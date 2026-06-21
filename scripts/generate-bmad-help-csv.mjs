/**
 * Génère _bmad/_config/bmad-help.csv à partir des dossiers .agents/skills/bmad-*.
 * Exécution : node scripts/generate-bmad-help-csv.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const skillsRoot = join(root, '.agents', 'skills')

function parseFrontmatter(md) {
  if (!md.startsWith('---\n')) return {}
  const end = md.indexOf('\n---\n', 4)
  if (end === -1) return {}
  const block = md.slice(4, end)
  const out = {}
  for (const line of block.split('\n')) {
    const m = line.match(/^(\w+):\s*(.*)$/)
    if (!m) continue
    let v = m[2].trim()
    if ((v.startsWith("'") && v.endsWith("'")) || (v.startsWith('"') && v.endsWith('"'))) {
      v = v.slice(1, -1)
    }
    out[m[1]] = v
  }
  return out
}

/** @type {Array<{skill: string, display: string, menu: string, phase: string, preceded: string, followed: string, required: string, out: string, outputs: string}>} */
const rows = []

const phaseMap = {
  'bmad-help': 'anytime',
  'bmad-customize': 'anytime',
  'bmad-party-mode': 'anytime',
  'bmad-index-docs': 'anytime',
  'bmad-investigate': 'anytime',
  'bmad-shard-doc': 'anytime',
  'bmad-editorial-review-prose': 'anytime',
  'bmad-editorial-review-structure': 'anytime',
  'bmad-advanced-elicitation': 'anytime',
  'bmad-brainstorming': '1-discovery',
  'bmad-product-brief': '1-discovery',
  'bmad-prfaq': '1-discovery',
  'bmad-market-research': '1-discovery',
  'bmad-domain-research': '1-discovery',
  'bmad-technical-research': '1-discovery',
  'bmad-spec': '2-planning',
  'bmad-prd': '2-planning',
  'bmad-create-prd': '2-planning',
  'bmad-edit-prd': '2-planning',
  'bmad-validate-prd': '2-planning',
  'bmad-ux': '3-design',
  'bmad-create-architecture': '3-design',
  'bmad-create-epics-and-stories': '4-backlog',
  'bmad-create-story': '4-backlog',
  'bmad-sprint-planning': '4-backlog',
  'bmad-sprint-status': '5-delivery',
  'bmad-dev-story': '5-delivery',
  'bmad-quick-dev': '5-delivery',
  'bmad-qa-generate-e2e-tests': '5-delivery',
  'bmad-code-review': '6-quality',
  'bmad-checkpoint-preview': '6-quality',
  'bmad-check-implementation-readiness': '6-quality',
  'bmad-review-adversarial-general': '6-quality',
  'bmad-review-edge-case-hunter': '6-quality',
  'bmad-retrospective': '7-ops',
  'bmad-correct-course': '7-ops',
  'bmad-document-project': 'anytime',
  'bmad-generate-project-context': 'anytime',
}

const menuMap = {
  'bmad-help': '[?]',
  'bmad-customize': '[CZ]',
  'bmad-party-mode': '[PM]',
  'bmad-prd': '[PR]',
  'bmad-spec': '[SP]',
  'bmad-product-brief': '[PB]',
  'bmad-prfaq': '[PF]',
  'bmad-document-project': '[DP]',
  'bmad-generate-project-context': '[GC]',
  'bmad-create-architecture': '[AR]',
  'bmad-ux': '[UX]',
  'bmad-create-epics-and-stories': '[ES]',
  'bmad-create-story': '[ST]',
  'bmad-sprint-planning': '[PL]',
  'bmad-sprint-status': '[SS]',
  'bmad-dev-story': '[DS]',
  'bmad-quick-dev': '[QD]',
  'bmad-code-review': '[CR]',
  'bmad-checkpoint-preview': '[CP]',
  'bmad-check-implementation-readiness': '[IR]',
  'bmad-agent-analyst': '[AN]',
  'bmad-agent-architect': '[ARc]',
  'bmad-agent-dev': '[DV]',
  'bmad-agent-pm': '[PMg]',
  'bmad-agent-tech-writer': '[TW]',
  'bmad-agent-ux-designer': '[UXa]',
}

let dirs
try {
  dirs = readdirSync(skillsRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name.startsWith('bmad-'))
    .map((d) => d.name)
    .sort()
} catch {
  console.error('Dossier .agents/skills introuvable — CSV minimal généré.')
  dirs = []
}

for (const name of dirs) {
  const skillMd = join(skillsRoot, name, 'SKILL.md')
  let desc = ''
  try {
    const fm = parseFrontmatter(readFileSync(skillMd, 'utf8'))
    desc = (fm.description || '').replace(/\s+/g, ' ').trim()
  } catch {
    desc = 'Skill BMad'
  }
  const phase = phaseMap[name] || 'anytime'
  const menu = menuMap[name] || `[${name.replace('bmad-', '').slice(0, 2).toUpperCase()}]`
  const display = name
    .replace('bmad-', '')
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
  const required = 'false'
  let outputs = ''
  let outLoc = '{project-root}/docs/bmad'
  if (name === 'bmad-generate-project-context') {
    outputs = 'project-context.md'
    outLoc = '{project-root}/docs/bmad'
  } else if (name === 'bmad-document-project') {
    outputs = '**/*.md'
    outLoc = '{project-root}/docs/bmad/document-project'
  } else if (name === 'bmad-prd' || name === 'bmad-create-prd' || name === 'bmad-edit-prd') {
    outputs = '**/prd.md'
    outLoc = '{project-root}/docs/bmad/planning'
  } else if (name === 'bmad-spec') {
    outputs = '**/SPEC.md'
    outLoc = '{project-root}/docs/bmad/planning'
  } else if (name === 'bmad-create-epics-and-stories') {
    outputs = '**/epics*.md'
    outLoc = '{project-root}/docs/bmad/planning'
  }
  rows.push({
    skill: name,
    display,
    menu,
    phase,
    preceded: '',
    followed: '',
    required,
    out: outLoc,
    outputs,
    desc,
  })
}

rows.unshift({
  skill: '_meta',
  display: 'Documentation BMad (externe)',
  menu: '[DOC]',
  phase: 'anytime',
  preceded: '',
  followed: '',
  required: 'false',
  out: 'https://docs.bmad-method.org/',
  outputs: '',
  desc: 'Guide officiel personnalisation et méthode BMad.',
})

function csvEscape(s) {
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

const header =
  'module,skill,display-name,menu-code,description,action,args,phase,preceded-by,followed-by,required,output-location,outputs'
const lines = [header]
for (const r of rows) {
  const module = 'visudrome-bmad'
  const action = ''
  const args = ''
  lines.push(
    [
      module,
      r.skill,
      r.display,
      r.menu,
      r.desc,
      action,
      args,
      r.phase,
      r.preceded,
      r.followed,
      r.required,
      r.out,
      r.outputs,
    ]
      .map((c) => csvEscape(String(c)))
      .join(','),
  )
}

const outDir = join(root, '_bmad', '_config')
mkdirSync(outDir, { recursive: true })
const outPath = join(outDir, 'bmad-help.csv')
writeFileSync(outPath, lines.join('\n') + '\n', 'utf8')
console.log('Écrit', outPath, `(${rows.length} lignes)`)
