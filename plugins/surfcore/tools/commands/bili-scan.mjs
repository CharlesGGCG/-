// bili-scan：子代理看视频入口 —— 跑 feed 选题，对每条 debrief（纯文本），输出一份报告。
// 给「子代理刷 B站」用：主会话派一个子代理跑它，拿回报告，不把视频内容灌进主上下文。
//
// 用法：node bili.mjs scan [--n 5] [--source rcmd] [--json]
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const biliMjs = path.join(here, '..', 'bili.mjs')

function run(args) {
  const r = spawnSync(process.execPath, [biliMjs, ...args], { encoding: 'utf8', timeout: 180_000 })
  return { out: String(r.stdout || ''), err: String(r.stderr || ''), ok: r.status === 0 }
}

const argv = process.argv.slice(2)
const opt = {}
for (let i = 0; i < argv.length; i += 1) {
  if (!argv[i].startsWith('--')) continue
  const k = argv[i].slice(2)
  const next = argv[i + 1]
  if (next && !next.startsWith('--')) { opt[k] = next; i += 1 } else opt[k] = true
}
const N = Math.max(1, Math.min(10, Number(opt.n || 5) || 5))
const SOURCE = String(opt.source || 'rcmd')

// ① 选题
const feed = run(['feed', '--source', SOURCE, '--n', String(N), '--json'])
let picks = []
try { picks = (JSON.parse(feed.out).items || []) } catch {}

if (!picks.length) {
  console.log(feed.err || feed.out || '（没有可看的候选）')
  process.exit(0)
}

// ② 逐条深读（子代理替主会话把视频内容吃掉，只交回摘要）
const rows = []
for (const p of picks) {
  const d = run(['debrief', String(p.bv), '--no-frames'])
  rows.push({
    bv: String(p.bv || ''),
    title: String(p.title || ''),
    up: String(p.up || ''),
    score: p.score,
    brief: String(d.out || d.err || '').trim(),
  })
}

// ③ 输出报告
if (opt.json) {
  console.log(JSON.stringify({ ok: true, source: SOURCE, count: rows.length, items: rows }, null, 2))
  process.exit(0)
}
console.log(`# 今晚刷 B站 报告（${SOURCE} · ${rows.length} 条）\n`)
for (const [i, r] of rows.entries()) {
  console.log(`## ${i + 1}. ${r.title}`)
  console.log(`- BV：${r.bv}\n- UP：${r.up}\n`)
  console.log(r.brief ? `${r.brief}\n` : '（没拿到内容）\n')
}
