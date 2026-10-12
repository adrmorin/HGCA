// Packs certificados-app/ into hcga-certificados-app.zip for GoDaddy Node.js Hosting.
// GoDaddy's requirements: package.json at the zip root, no node_modules (it runs
// `npm install` itself), no .env files (secrets go in the app's environment variables)
// and no generated PDFs (storage/ is created by the app at startup).
import { listFiles, writeZip } from './zip.mjs'

const APP = 'certificados-app'
const OUT = 'hcga-certificados-app.zip'

function incluir(path) {
  if (path.startsWith('node_modules/') || path.startsWith('.git/')) return false
  if (path.startsWith('storage/')) return false // generated certificates never ship in the package
  if (/(^|\/)\.env($|\.)/.test(path)) return path.endsWith('.env.example') // never real secrets
  return true
}
const files = listFiles(APP).filter((f) => incluir(f.path))

for (const required of ['package.json', 'package-lock.json', 'src/server.js', 'src/plantilla.js']) {
  if (!files.some((f) => f.path === required)) throw new Error(`Missing ${APP}/${required}`)
}

const { count, bytes } = writeZip(files, OUT)
console.log(`${OUT}: ${count} files, ${(bytes / 1024).toFixed(0)} KB`)
for (const f of files) console.log(`  ${f.path}`)
