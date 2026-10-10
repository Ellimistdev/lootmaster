import { readFileSync, mkdirSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { createHash } from 'node:crypto'

const outputPath = resolve(process.argv[2] || 'public/data/encounter-loot.json')
const instanceDir = resolve('data/harvests/instances')
const instanceFiles = existsSync(instanceDir)
  ? readdirSync(instanceDir).filter((name) => /(?:^instance-| - )[0-9]+\.json$/.test(name)).sort()
  : []
if (!instanceFiles.length) {
  throw new Error('No per-instance JSON harvests found in data/harvests/instances/. Run npm run import:harvest first.')
}
const data = (() => {
  const docs = instanceFiles.map((name) => JSON.parse(readFileSync(resolve(instanceDir, name), 'utf8')))
  const merged = {
    schemaVersion: 1, source: 'wow-encounter-journal', game: docs[0].game,
    harvest: { status: 'complete', totalJobs: 0, completedJobs: 0, failedJobs: 0 },
    validation: { errors: [], warnings: [] },
    specializations: {}, items: {}, instances: {},
  }
  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i]
    const filename = instanceFiles[i]
    if (doc.schemaVersion !== 1 || doc.source !== merged.source ||
        !Number.isSafeInteger(doc.instanceId) ||
        !(filename === 'instance-' + doc.instanceId + '.json' ||
          filename === String(doc.instance?.name || '').normalize('NFKC')
            .replace(/[<>:"/\\|?*\x00-\x1f]/g, '').replace(/\s+/g, ' ').replace(/[. ]+$/g, '').trim() + ' - ' + doc.instanceId + '.json') ||
        !doc.instance || doc.harvest?.status !== 'complete') {
      throw new Error('Invalid instance export: ' + filename)
    }
    if (Object.hasOwn(merged.instances, String(doc.instanceId))) {
      throw new Error('Duplicate instance export: ' + doc.instanceId)
    }
    merged.instances[String(doc.instanceId)] = doc.instance
    for (const [id, spec] of Object.entries(doc.specializations || {})) {
      if (merged.specializations[id] && JSON.stringify(merged.specializations[id]) !== JSON.stringify(spec)) {
        throw new Error('Conflicting specialization ' + id + ' in ' + filename)
      }
      merged.specializations[id] = spec
    }
    for (const [id, item] of Object.entries(doc.items || {})) {
      if (merged.items[id] && JSON.stringify(merged.items[id]) !== JSON.stringify(item)) {
        throw new Error('Conflicting item ' + id + ' in ' + filename)
      }
      merged.items[id] = item
    }
    for (const encounter of Object.values(doc.instance.encounters || {})) {
      for (const difficulty of Object.values(encounter.difficulties || {})) {
        merged.harvest.totalJobs += 1 + Object.keys(difficulty.specializations || {}).length
      }
    }
    merged.validation.warnings.push(...(doc.validation?.warnings || []))
  }
  merged.harvest.completedJobs = merged.harvest.totalJobs
  return merged
})()
const errors = []
const warnings = []
const assert = (condition, message) => { if (!condition) errors.push(message) }
const entries = (value) => Object.entries(value || {}).sort(([a], [b]) => Number(a) - Number(b))
const ids = (job, label) => {
  assert(job && ['complete', 'empty_verified'].includes(job.status), label + ': incomplete job')
  if (!job) return []
  const items = job.items || []
  const result = items.map((item) => item.itemID)
  assert(result.every((id) => Number.isSafeInteger(id) && id > 0), label + ': invalid item ID')
  assert(new Set(result).size === result.length, label + ': duplicate item IDs')
  assert(job.reportedCount === result.length, label + ': reportedCount mismatch')
  assert((job.unresolvedEntries || []).length === 0, label + ': unresolved entries')
  assert(job.duplicateCount === 0, label + ': reported duplicate entries')
  return result.sort((a, b) => a - b)
}

assert(data.schemaVersion === 1, 'Unsupported harvest schema')
assert(data.source === 'wow-encounter-journal', 'Unexpected data source')
assert(data.harvest?.status === 'complete', 'Harvest is not complete')
assert((data.harvest?.failedJobs || 0) === 0, 'Harvest contains failed jobs')
assert((data.validation?.errors || []).length === 0, 'Addon validation errors present')
for (const warning of data.validation?.warnings || []) warnings.push('Addon: ' + JSON.stringify(warning))
const specs = entries(data.specializations)
assert(specs.length > 0, 'No specializations')
const normalized = {
  schemaVersion: 1,
  source: data.source,
  sourceSha256: createHash('sha256').update(instanceFiles.map((name) => readFileSync(resolve(instanceDir, name), 'utf8')).join('')).digest('hex'),
  game: data.game,
  harvest: {
    startedAt: data.harvest?.startedAt,
    completedAt: data.harvest?.completedAt,
    status: data.harvest?.status,
  },
  specializations: Object.fromEntries(specs),
  items: Object.fromEntries(entries(data.items)),
  instances: {},
}
let jobs = 0
for (const [instanceId, instance] of entries(data.instances)) {
  const outInstance = { name: instance.name, encounters: {} }
  for (const [encounterId, encounter] of entries(instance.encounters)) {
    const outEncounter = { name: encounter.name, dungeonEncounterId: encounter.dungeonEncounterId, difficulties: {} }
    for (const [difficultyId, difficulty] of entries(encounter.difficulties)) {
      const label = instanceId + '/' + encounterId + '/' + difficultyId
      const baseline = ids(difficulty.baseline, label + '/baseline')
      jobs++
      const baselineSet = new Set(baseline)
      const outSpecs = {}
      const union = new Set()
      for (const [specId, job] of entries(difficulty.specializations)) {
        assert(Object.hasOwn(data.specializations, specId), label + ': unknown spec ' + specId)
        const itemIds = ids(job, label + '/' + specId)
        for (const id of itemIds) {
          assert(baselineSet.has(id), label + '/' + specId + ': item ' + id + ' absent from baseline')
          union.add(id)
        }
        outSpecs[specId] = itemIds
        jobs++
      }
      for (const [specId] of specs) assert(Object.hasOwn(outSpecs, specId), label + ': missing spec ' + specId)
      for (const id of baseline) if (!union.has(id)) warnings.push(label + ': baseline item ' + id + ' has no eligible spec')
      outEncounter.difficulties[difficultyId] = {
        name: difficulty.difficultyName,
        baselineItemIds: baseline,
        specializations: outSpecs,
      }
    }
    outInstance.encounters[encounterId] = outEncounter
  }
  normalized.instances[instanceId] = outInstance
}
assert(jobs > 0, 'No collection jobs')
assert(jobs === data.harvest?.totalJobs, 'Job count does not match harvest.totalJobs')
assert(jobs === data.harvest?.completedJobs, 'Job count does not match harvest.completedJobs')
for (const warning of warnings) console.warn('WARNING:', warning)
if (errors.length) {
  for (const error of errors) console.error('ERROR:', error)
  process.exit(1)
}
mkdirSync(dirname(outputPath), { recursive: true })
writeFileSync(outputPath, JSON.stringify(normalized, null, 2) + '\n')
console.log('Validated ' + jobs + ' jobs across ' + specs.length + ' specs; wrote ' + outputPath)
