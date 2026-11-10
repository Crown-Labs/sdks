#!/usr/bin/env node
// Build publishable tarballs without rewriting workspace manifests. Never publishes without --publish.
const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')
const root = path.resolve(__dirname, '..')
const output = path.join(root, '.sdk-packages')
const names = ['sdk-core', 'v2-sdk', 'v3-sdk', 'v4-sdk', 'router-sdk', 'universal-router-sdk']
const versions = new Map()
for (const name of fs.readdirSync(path.join(root, 'sdks'))) {
  const file = path.join(root, 'sdks', name, 'package.json')
  if (fs.existsSync(file)) { const pkg = JSON.parse(fs.readFileSync(file)); versions.set(pkg.name, pkg.version) }
}
fs.mkdirSync(output, { recursive: true })
const tarballs = []
for (const name of names) {
  const source = path.join(root, 'sdks', name)
  const pkg = JSON.parse(fs.readFileSync(path.join(source, 'package.json')))
  if (pkg.private || pkg.name !== `@kittycorn-labs/${name}`) throw new Error(`Invalid release package: ${name}`)
  if (!fs.existsSync(path.resolve(source, pkg.main))) throw new Error(`Build ${name} before packing`)
  const stage = fs.mkdtempSync(path.join(output, `${name}-`))
  try {
    fs.cpSync(path.join(source, 'dist'), path.join(stage, 'dist'), { recursive: true })
    for (const file of ['README.md', 'LICENSE']) {
      if (fs.existsSync(path.join(source, file))) fs.copyFileSync(path.join(source, file), path.join(stage, file))
    }
    for (const field of ['dependencies', 'peerDependencies', 'optionalDependencies']) {
      for (const [dep, range] of Object.entries(pkg[field] || {})) {
        if (range.startsWith('workspace:')) {
          if (!versions.has(dep)) throw new Error(`Unknown workspace dependency ${dep}`)
          pkg[field][dep] = versions.get(dep)
        }
      }
    }
    delete pkg.scripts
    delete pkg.devDependencies
    pkg.files = ['dist', 'README.md', 'LICENSE']
    fs.writeFileSync(path.join(stage, 'package.json'), JSON.stringify(pkg, null, 2) + '\n')
    const result = JSON.parse(execFileSync('npm', ['pack', '--json', '--ignore-scripts', '--pack-destination', output], { cwd: stage, encoding: 'utf8' }))
    tarballs.push(path.join(output, result[0].filename))
    console.log(result[0].filename)
  } finally { fs.rmSync(stage, { recursive: true, force: true }) }
}
if (process.argv.includes('--publish')) {
  for (const file of tarballs) execFileSync('npm', ['publish', file, '--access', 'public'], { stdio: 'inherit' })
}
