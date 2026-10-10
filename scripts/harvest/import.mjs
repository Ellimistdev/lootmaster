import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, unlinkSync } from 'node:fs'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'
import { loadEnvFile } from 'node:process'
import { parseSavedVariables } from './parse.mjs'

if (existsSync(resolve('.env'))) loadEnvFile(resolve('.env'))
const args = process.argv.slice(2)
const explicitPath = args.length > 0 && /\.lua$/i.test(args[0])
const input = explicitPath ? args.shift() : process.env.LOOTMASTER_HARVEST_PATH
if (!input) {
  console.error('Set LOOTMASTER_HARVEST_PATH in .env or pass a Lua file path.')
  console.error('Usage: npm run import:harvest -- [path/to/LootmasterHarvester.lua] [instanceID...]')
  process.exit(1)
}
const raw = readFileSync(resolve(input), 'utf8')
const db = parseSavedVariables(raw)
if (db.schemaVersion !== 1 || db.source !== 'wow-encounter-journal') {
  throw new Error('Unsupported SavedVariables export')
}
const selected = new Set(args.map(String))
const instances = Object.entries(db.instances || {}).filter(([id]) => !selected.size || selected.has(id))
if (!instances.length) throw new Error('No matching instances in export')
const directory = resolve('data/harvests/instances')
mkdirSync(directory, { recursive: true })
const fileName = (name, id) => {
  const safe = String(name || '').normalize('NFKC')
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '').replace(/\s+/g, ' ').replace(/[. ]+$/g, '').trim()
  if (!safe) throw new Error('Missing valid name for instance ' + id)
  return id + ' - ' + safe + '.json'
}
// The active manifest is authoritative for instances in the most recent run.
const activeJobs = new Map()
for (const job of db.harvest?.manifest || []) {
  const id = String(job.instanceId)
  if (!activeJobs.has(id)) activeJobs.set(id, [])
  activeJobs.get(id).push(job)
}
let written = 0
let skipped = 0
for (const [id, instance] of instances) {
  if (!/^\d+$/.test(id)) throw new Error('Invalid instance ID: ' + id)
  const errors = []
  const manifest = activeJobs.get(id)
  const exportedInstance = manifest ? {
    ...instance,
    encounters: {},
  } : instance
  if (manifest) {
    for (const job of manifest) {
      const encounterId = String(job.encounterId)
      const difficultyId = String(job.difficultyId)
      const originalEncounter = instance.encounters?.[encounterId]
      const originalDifficulty = originalEncounter?.difficulties?.[difficultyId]
      if (!originalDifficulty) {
        errors.push(id + '/' + encounterId + '/' + difficultyId + ': missing manifest difficulty')
        continue
      }
      if (!exportedInstance.encounters[encounterId]) {
        exportedInstance.encounters[encounterId] = { ...originalEncounter, difficulties: {} }
      }
      const difficulties = exportedInstance.encounters[encounterId].difficulties
      if (!difficulties[difficultyId]) {
        difficulties[difficultyId] = { ...originalDifficulty, baseline: undefined, specializations: {} }
      }
      const target = difficulties[difficultyId]
      if (job.specId != null) {
        const specId = String(job.specId)
        target.specializations[specId] = originalDifficulty.specializations?.[specId]
      } else {
        target.baseline = originalDifficulty.baseline
      }
    }
  }
  let jobs = 0
  const referenced = new Set()
  for (const [encounterId, encounter] of Object.entries(exportedInstance.encounters || {})) {
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
  if (manifest && jobs !== manifest.length) errors.push('Manifest job count mismatch for instance ' + id)
  if (errors.length) {
    if (selected.size) {
      throw new Error('Refusing to import incomplete instance ' + id + ':\n' +
        errors.slice(0, 10).join('\n') +
        (errors.length > 10 ? '\n... and ' + (errors.length - 10) + ' more errors' : ''))
    }
    console.warn('Skipped instance ' + id + ' (' + (instance.name || 'unnamed') +
      '): ' + errors.length + ' incomplete/invalid job(s); first: ' + errors[0])
    skipped++
    continue
  }
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
    instance: exportedInstance,
    validation: { warnings: [] },
  }
  const filename = fileName(instance.name, id)
  const path = resolve(directory, filename)
  const obsolete = readdirSync(directory).filter((name) =>
    name === 'instance-' + id + '.json' ||
    ((name.endsWith(' - ' + id + '.json') || name.startsWith(id + ' - ')) && name !== filename))
  const existed = existsSync(path) || obsolete.length > 0
  writeFileSync(path, JSON.stringify(document, null, 2) + '\n')
  for (const oldName of obsolete) unlinkSync(resolve(directory, oldName))
  console.log((existed ? 'Updated ' : 'Created ') + path + ' (' + jobs + ' jobs)')
  written++
}
console.log('Imported ' + written + ' instance(s); skipped ' + skipped + ' incomplete instance(s). Other instance files were left untouched.')
if (!written) {
  console.error('No complete instances available to import.')
  process.exitCode = 1
}
