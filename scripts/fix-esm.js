// TypeScript's bundler output omits Node ESM extensions and JSON import attributes.
const fs = require('fs')
const path = require('path')
const root = path.resolve('dist/esm')
fs.writeFileSync(path.join(root, 'package.json'), '{"type":"module"}\n')
function visit(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name)
    if (entry.isDirectory()) { visit(file); continue }
    if (!file.endsWith('.js')) continue
    let source = fs.readFileSync(file, 'utf8')
    source = source.replace(/(from\s+['"])([^'"]+)(['"])(;?)/g, (match, start, spec, end, semi) => {
      if (spec.startsWith('.') && !path.extname(spec)) {
        const target = path.resolve(dir, spec)
        spec += fs.existsSync(target + '.js') ? '.js' : '/index.js'
      } else if (spec.startsWith('ethers/lib/') && !path.extname(spec)) spec += '.js'
      return start + spec + end + (spec.endsWith('.json') ? ' with { type: "json" }' : '') + semi
    })
    fs.writeFileSync(file, source)
  }
}
visit(root)
