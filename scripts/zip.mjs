// Minimal zip writer shared by the packaging scripts.
// Entries use forward slashes and Unix permissions, so archives built on
// Windows extract correctly on GoDaddy's Linux servers.
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { crc32, deflateRawSync } from 'node:zlib'

export function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })
}

/** Files under `root` as { full, path } with `path` relative and slash-separated. */
export function listFiles(root) {
  return walk(root).map((full) => ({ full, path: relative(root, full).split(sep).join('/') }))
}

function dosDateTime(date) {
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1)
  const day = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()
  return { time, day }
}

/** Writes `files` ({ full, path }) to `out`. Returns { count, bytes }. */
export function writeZip(files, out) {
  const locals = []
  const centrals = []
  let offset = 0

  for (const f of files) {
    const name = Buffer.from(f.path, 'utf8')
    const data = readFileSync(f.full)
    // Video/images/fonts are already compressed; store them as-is
    const store = /\.(mp4|png|jpe?g|webp|gif|ico|woff2?)$/i.test(f.path)
    const body = store ? data : deflateRawSync(data, { level: 9 })
    const method = store ? 0 : 8
    const crc = crc32(data)
    const { time, day } = dosDateTime(statSync(f.full).mtime)

    const local = Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(20, 4)
    local.writeUInt16LE(0x0800, 6) // UTF-8 names
    local.writeUInt16LE(method, 8)
    local.writeUInt16LE(time, 10)
    local.writeUInt16LE(day, 12)
    local.writeUInt32LE(crc, 14)
    local.writeUInt32LE(body.length, 18)
    local.writeUInt32LE(data.length, 22)
    local.writeUInt16LE(name.length, 26)
    locals.push(local, name, body)

    const central = Buffer.alloc(46)
    central.writeUInt32LE(0x02014b50, 0)
    central.writeUInt16LE(0x031e, 4) // made by Unix, so permissions below apply
    central.writeUInt16LE(20, 6)
    central.writeUInt16LE(0x0800, 8)
    central.writeUInt16LE(method, 10)
    central.writeUInt16LE(time, 12)
    central.writeUInt16LE(day, 14)
    central.writeUInt32LE(crc, 16)
    central.writeUInt32LE(body.length, 20)
    central.writeUInt32LE(data.length, 24)
    central.writeUInt16LE(name.length, 28)
    central.writeUInt32LE((0o100644 << 16) >>> 0, 38) // -rw-r--r--
    central.writeUInt32LE(offset, 42)
    centrals.push(central, name)

    offset += local.length + name.length + body.length
  }

  const count = files.length
  const centralSize = centrals.reduce((n, b) => n + b.length, 0)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(count, 8)
  end.writeUInt16LE(count, 10)
  end.writeUInt32LE(centralSize, 12)
  end.writeUInt32LE(offset, 16)

  writeFileSync(out, Buffer.concat([...locals, ...centrals, end]))
  return { count, bytes: statSync(out).size }
}
