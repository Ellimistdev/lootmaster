import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'
import { parseSavedVariables } from './parse.mjs'

const input = process.argv[2]
if (!input) {
  console.error('Usage: npm run import:harvest -- <path/to/LootmasterHarvester.lua> [instanceID...]')
  process.exit(1)
}
const raw = readFileSync(resolve(input), 'utf8')
const db = parseSavedVariables(raw)
if (db.schemaVersion !== 1 || db.source !== 'wow-encounter-journal') {
  throw new Error('Unsupported SavedVariables export')
}
const selected = new Set(process.argv.slice(3).map(String))
const instances = Object.entries(db.instances || {}).filter(([id]) => !selected.size || selected.has(id))
if (!instances.length) throw new Error('No matching instances in export')
const directory = resolve('data/harvests/instances')
mkdirSync(directory, { recursive: true })
let written = 0
for (const [id, instance] of instances) {
  if (!/^\d+$/.test(id)) throw new Error('Invalid instance ID: ' + id)
  const errors = []
  let jobs = 0
  const referenced = new Set()
  for (const [encounterId, encounter] of Object.entries(instance.encounters || {})) {
    for (const [difficultyId, difficulty] of Object.entries(encounter.difficulties || {})) {
      const label = id + '/' + encounterId + '/' + difficultyId
      const baseline = difficulty.baseline
      const check = (job, name) => {
        jobs++
        if (!job || !['complete', 'empty_verified'].includes(job.status)) {
          errors.push(name + ': incomplete result')
          return new Set()
        }
        const items = (job.items || []).map((item) => item.itemID)
        if (items.some((itemID) => !Number.isSafeInteger(itemID) || itemID <= 0) ||
            new Set(items).size !== items.length ||
            job.reportedCount !== items.length ||
            (job.unresolvedEntries || []).length ||
            (job.duplicateCount || 0)) {
          errors.push(name + ': invalid item list')
        }
        items.forEach((itemID) => referenced.add(String(itemID)))
        return new Set(items)
      }
      const baselineIds = check(baseline, label + '/baseline')
      for (const [specId, job] of Object.entries(difficulty.specializations || {})) {
        if (!db.specializations?.[specId]) errors.push(label + ': unknown spec ' + specId)
        const itemIds = check(job, label + '/' + specId)
        for (const itemId of itemIds) {
          if (!baselineIds.has(itemId)) errors.push(label + ': filtered item absent from baseline ' + itemId)
        }
      }
      for (const specId of Object.keys(db.specializations || {})) {
        if (!Object.hasOwn(difficulty.specializations || {}, specId)) {
          errors.push(label + ': missing spec ' + specId)
        }
      }
    }
  }
  if (!jobs) errors.push('No jobs for instance ' + id)
  if (errors.length) throw new Error('Refusing to import incomplete instance ' + id + ':\n' + errors.join('\n'))
  const items = Object.fromEntries(Object.entries(db.items || {}).filter(([itemId]) => referenced.has(itemId)))
  const document = {
    schemaVersion: 1,
    source: db.source,
    sourceSha256: createHash('sha256').update(raw).digest('hex'),
    instanceId: Number(id),
    game: db.game,
    harvest: { status: 'complete', jobs, importedAt: db.harvest?.completedAt },
    specializations: db.specializations,
    items,
    instance,
    validation: { warnings: [] },
  }
  const path = resolve(directory, 'instance-' + id + '.json')
  const existed = existsSync(path)
  writeFileSync(path, JSON.stringify(document, null, 2) + '\n')
  console.log((existed ? 'Updated ' : 'Created ') + path + ' (' + jobs + ' jobs)')
  written++
}
console.log('Imported ' + written + ' instance(s). Other instance files were left untouched.')
