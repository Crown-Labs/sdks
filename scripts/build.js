// Build in workspace dependency order; no shared cache or global tooling required.
const { execFileSync } = require('child_process')
const path = require('path')
const { workspaces } = require('../package.json')
for (const workspace of workspaces)
  execFileSync('bun', ['run', 'build'], {
    cwd: path.resolve(__dirname, '..', workspace),
    stdio: 'inherit',
  })
