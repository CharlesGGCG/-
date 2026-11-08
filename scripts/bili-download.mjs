// 把 B站 视频分片下载到本地（绕开 B站 对整片下载的 567 风控）。
// 用法：node scripts/bili-download.mjs <BV 或完整 URL> [--maxSec 3600]
import { execFile } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = path.join(ROOT, 'state', 'bili-downloads')
const COOKIES = path.join(process.env.USERPROFILE || process.env.HOME || '', '.dsh', 'bili-cookies.txt')
const YTDLP = process.env.BILI_YTDLP || 'yt-dlp'

function argVal(name, fallback = '') {
  const i = process.argv.indexOf(name)
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback
}
function hasArg(name) { return process.argv.includes(name) }

function extractBv(input) {
  const m = /(BV[0-9A-Za-z]{10})/.exec(String(input ?? ''))
  return m ? m[1] : ''
}

const raw = process.argv[2]
const bv = extractBv(raw)
if (!bv) {
  console.error('用法: node scripts/bili-download.mjs <BV或URL> [--maxSec 秒]')
  process.exit(2)
}
const url = raw.includes('://') ? raw : `https://www.bilibili.com/video/${bv}`
const maxSec = Math.max(60, Math.min(6 * 3600, Number(argVal('--maxSec', 3600)) || 3600))

fs.mkdirSync(OUT_DIR, { recursive: true })
const outPath = path.join(OUT_DIR, `${bv}.mp4`)

if (fs.existsSync(outPath) && fs.statSync(outPath).size > 1000 && !hasArg('--force')) {
  console.log(JSON.stringify({ ok: true, cached: true, path: outPath, bv }))
  process.exit(0)
}

const cookies = fs.existsSync(COOKIES) ? COOKIES : null
const args = [
  '--cookies', cookies,
  '-f', 'b[height<=720][acodec!=none]/bv*[height<=720]+ba/b[height<=720][acodec!=none]/bv*+ba/b',
  '-S', 'res:720',
  '--download-sections', `*0-${maxSec}`,
  '--no-playlist', '--no-progress', '--retries', '3', '--fragment-retries', '5',
  '--merge-output-format', 'mp4',
  '-o', `${bv}.%(ext)s`,
  url,
]

console.error(`[bili-download] ${bv} -> ${outPath} (max ${maxSec}s)`)
execFile(YTDLP, args, { cwd: OUT_DIR, windowsHide: true, maxBuffer: 1024 * 1024, timeout: 20 * 60 * 1000 }, (err, stdout, stderr) => {
  if (err) {
    console.log(JSON.stringify({ ok: false, bv, error: String(stderr || err.message || err).slice(-800) }))
    process.exit(0)
  }
  // yt-dlp 有时按格式 id 写文件名（如 BVxxx.f100022.mp4），取目录里最大、最新产出的文件重命名成 BV.mp4
  try {
    const candidates = fs.readdirSync(OUT_DIR)
      .filter((n) => n.startsWith(bv + '.') && !/\.(part|ytdl|temp)$/i.test(n) && n !== `${bv}.mp4`)
      .map((n) => ({ n, s: fs.statSync(path.join(OUT_DIR, n)).size, t: fs.statSync(path.join(OUT_DIR, n)).mtimeMs }))
      .sort((a, b) => b.t - a.t)
    if (candidates.length && !fs.existsSync(outPath)) {
      fs.renameSync(path.join(OUT_DIR, candidates[0].n), outPath)
    }
  } catch {}
  const size = fs.existsSync(outPath) ? fs.statSync(outPath).size : 0
  console.log(JSON.stringify({ ok: size > 0, bv, path: outPath, bytes: size, error: size > 0 ? '' : '下载结果为空' }))
})
