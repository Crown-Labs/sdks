// Keep the six published SDK versions aligned without a separate release framework.
const fs = require('fs')
const path = require('path')
const { workspaces } = require('../package.json')
const version = process.argv[2]
if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version || ''))
  throw new Error('Usage: bun run g:version <version>')
for (const workspace of workspaces) {
  const file = path.resolve(__dirname, '..', workspace, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(file))
  pkg.version = version
  fs.writeFileSync(file, JSON.stringify(pkg, null, 2) + '\n')
}
console.log('Updated SDK versions; run bun install, build and test before committing.')
