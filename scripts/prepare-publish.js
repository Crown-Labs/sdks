#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all workspace packages
const rootPackageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const workspaces = rootPackageJson.workspaces.flatMap(ws => {
  if (ws.endsWith('/*')) {
    const dir = ws.slice(0, -2);
    return fs.readdirSync(dir)
      .filter(f => fs.statSync(path.join(dir, f)).isDirectory())
      .map(f => path.join(dir, f));
  }
  return ws;
});

// Get current versions of all packages
const packageVersions = {};
workspaces.forEach(ws => {
  const pkgPath = path.join(ws, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    if (pkg.name) {
      packageVersions[pkg.name] = pkg.version;
    }
  }
});

// Update workspace:* references in all packages
workspaces.forEach(ws => {
  const pkgPath = path.join(ws, 'package.json');
  if (fs.existsSync(pkgPath)) {
    let content = fs.readFileSync(pkgPath, 'utf8');
    const pkg = JSON.parse(content);
    
    let modified = false;
    
    // Check dependencies
    ['dependencies', 'devDependencies', 'peerDependencies'].forEach(depType => {
      if (pkg[depType]) {
        Object.keys(pkg[depType]).forEach(dep => {
          if (pkg[depType][dep] === 'workspace:*' && packageVersions[dep]) {
            pkg[depType][dep] = `^${packageVersions[dep]}`;
            modified = true;
            console.log(`Updated ${dep} in ${pkg.name} from workspace:* to ^${packageVersions[dep]}`);
          }
        });
      }
    });
    
    if (modified) {
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
    }
  }
});

console.log('✅ Prepared packages for publishing');