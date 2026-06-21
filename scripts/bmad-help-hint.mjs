#!/usr/bin/env node
/**
 * Rappel : bmad-help est une skill Cursor (pas un binaire shell).
 * Ce script affiche où trouver le catalogue et comment s’y prendre.
 */
import { existsSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const csv = join(root, '_bmad', '_config', 'bmad-help.csv')
const readme = join(root, '_bmad', 'README.md')

console.log(`
bmad-help — ce n’est pas une commande terminal
─────────────────────────────────────────────

C’est une skill Cursor (agent) : tu l’utilises dans le CHAT Cursor, par exemple :
  • « bmad-help » ou « aide BMad »
  • ou en attachant / mentionnant la skill bmad-help si ton UI le propose

Le catalogue local est ici :
  ${csv}
  ${existsSync(csv) ? '✓ présent' : '✗ absent — lance : npm run bmad:catalog'}

Doc dossier _bmad/ :
  ${readme}
`)

if (existsSync(readme)) {
  const head = readFileSync(readme, 'utf8').split('\n').slice(0, 25).join('\n')
  console.log('── Aperçu _bmad/README.md ──\n' + head + '\n…\n')
}
