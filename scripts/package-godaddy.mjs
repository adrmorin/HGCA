// Packs dist/ into hgca-godaddy-upload.zip for cPanel's File Manager.
// - Entries sit at the zip root, so "Extract" inside the site folder produces
//   index.html, .htaccess and assets/ directly.
// - Files copied from public/ that no page, script or stylesheet references are
//   left out (source images, unused videos...), so the upload stays small.
import { readFileSync } from 'node:fs'
import { extname, basename } from 'node:path'
import { listFiles, writeZip } from './zip.mjs'

const DIST = 'dist'
const OUT = 'hgca-godaddy-upload.zip'
// verificar.html (certificate QR codes), confirmar.html (confirmation email) and the
// cPanel mail relay are only reached from outside the site, so the reference scan
// below would not find them
const ALWAYS = new Set(['index.html', '.htaccess', 'verificar.html', 'confirmar.html',
  'correo/enviar.php', 'correo/.htaccess', 'correo/config.example.php'])
// The relay secret lives only on the server; never ship it even if it exists locally
const NEVER = new Set(['correo/config.php'])
const TEXT = new Set(['.html', '.js', '.css', '.svg', '.json', '.webmanifest'])

const files = listFiles(DIST).filter((f) => !NEVER.has(f.path))

// Everything Vite emitted (assets/) and every file whose name appears in a
// reachable text file is kept. Iterate so pages linked from kept pages count too.
const kept = new Set(files.filter((f) => ALWAYS.has(f.path) || f.path.startsWith('assets/')).map((f) => f.path))
let grew = true
while (grew) {
  grew = false
  const corpus = files
    .filter((f) => kept.has(f.path) && TEXT.has(extname(f.path)))
    .map((f) => readFileSync(f.full, 'utf8'))
    .join('\n')
  for (const f of files) {
    if (kept.has(f.path)) continue
    const name = basename(f.path)
    if (corpus.includes(f.path) || corpus.includes(name) || corpus.includes(encodeURI(name))) {
      kept.add(f.path)
      grew = true
    }
  }
}

const skipped = files.filter((f) => !kept.has(f.path))
if (skipped.length) {
  console.log(`Skipped ${skipped.length} unreferenced files:`)
  for (const f of skipped) console.log(`  - ${f.path}`)
}

const { count, bytes } = writeZip(files.filter((f) => kept.has(f.path)), OUT)
console.log(`${OUT}: ${count} files, ${(bytes / 1048576).toFixed(1)} MB`)
