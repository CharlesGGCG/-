import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const HOME = os.homedir()

const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'))
const PORT = Number(cfg.port) || 8787
const INVITE = String(cfg.inviteCode || '')
const COOKIE = 'ww_invite'
const COOKIE_VAL = crypto.createHash('sha256').update(INVITE).digest('hex')

const HOST_FILE = String(cfg.hostFile || '').trim() || path.join(HOME, '.dsh', 'surfcore', 'pet', 'host.json')
function readHost() {
  try {
    const h = JSON.parse(fs.readFileSync(HOST_FILE, 'utf8'))
    return {
      baseUrl: String(h.baseUrl || '').replace(/\/+$/, ''),
      token: String(h.token || ''),
      api: h.api || '/dsh-surfcore/pet-api',
    }
  } catch { return null }
}

async function petChat(text) {
  const h = readHost()
  if (!h || !h.token) return { ok: false, error: '她还没准备好（本机服务未就绪）' }
  try {
    const r = await fetch(`${h.baseUrl}${h.api}/chat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-pet-token': h.token },
      body: JSON.stringify({ text }),
    })
    return await r.json()
  } catch (e) { return { ok: false, error: String(e.message) } }
}

async function petStatus() {
  const h = readHost()
  if (!h || !h.token) return { ok: false, online: false }
  try {
    const r = await fetch(`${h.baseUrl}${h.api}/status`, { headers: { 'x-pet-token': h.token } })
    return await r.json()
  } catch { return { ok: false, online: false } }
}

async function petHistory(limit = 60) {
  const h = readHost()
  if (!h || !h.token) return { ok: false, messages: [] }
  try {
    const r = await fetch(`${h.baseUrl}${h.api}/history?limit=${limit}`, { headers: { 'x-pet-token': h.token } })
    return await r.json()
  } catch { return { ok: false, messages: [] } }
}

// 表情包：读 nekowhale 目录 + 代理 GIF
const STICKER_CATALOG = String(cfg.stickerCatalog || path.join(HOME, '.dsh', 'profiles', 'web', 'node_modules', 'dsh-nekowhale-stickers', 'meta', 'nekowhale.json'))
const STICKER_BASE = String(cfg.stickerBase || 'http://127.0.0.1:3080/x-nekowhale-stickers/s/').replace(/\/+$/, '')
let stickerList = []
try {
  const cat = JSON.parse(fs.readFileSync(STICKER_CATALOG, 'utf8'))
  stickerList = (Array.isArray(cat.stickers) ? cat.stickers : []).map((s) => ({
    id: String((s.id || '').split('/').pop() || s.id),
    hash: String(s.hash || ''),
    emotion: String(s.emotion || ''),
    tags: Array.isArray(s.tags) ? s.tags.slice(0, 6) : [],
    text: String(s.text || ''),
  })).filter((s) => s.hash)
} catch { stickerList = [] }

function parseCookies(req) {
  const out = {}
  const c = req.headers.cookie || ''
  for (const part of c.split(';')) {
    const i = part.indexOf('=')
    if (i > 0) out[part.slice(0, i).trim()] = part.slice(i + 1).trim()
  }
  return out
}
function authorized(req) {
  return parseCookies(req)[COOKIE] === COOKIE_VAL
}

function send(res, code, body, type = 'application/json; charset=utf-8') {
  res.writeHead(code, { 'content-type': type })
  res.end(typeof body === 'string' ? body : JSON.stringify(body))
}

const indexHtml = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8')

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost')
  const p = url.pathname

  if (p === '/api/invite') {
    if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'method' })
    let body = ''
    for await (const chunk of req) body += chunk
    let code = ''
    try { code = String(JSON.parse(body).code || '') } catch {}
    if (code && code === INVITE) {
      res.setHeader('Set-Cookie', `${COOKIE}=${COOKIE_VAL}; Path=/; HttpOnly; Max-Age=${90 * 24 * 3600}; SameSite=Lax`)
      return send(res, 200, { ok: true })
    }
    return send(res, 401, { ok: false, error: '邀请码不对' })
  }

  if (p === '/api/auth') {
    return send(res, 200, { authorized: authorized(req) })
  }

  if (p === '/api/chat') {
    if (!authorized(req)) return send(res, 401, { ok: false, error: '请先输入邀请码' })
    let body = ''
    for await (const chunk of req) body += chunk
    let text = ''
    try { text = String(JSON.parse(body).text || '') } catch {}
    if (!text.trim()) return send(res, 400, { ok: false, error: '空消息' })
    const r = await petChat(text)
    return send(res, r.ok ? 200 : 502, r)
  }

  if (p === '/api/status') {
    if (!authorized(req)) return send(res, 401, { ok: false, error: '请先输入邀请码' })
    return send(res, 200, await petStatus())
  }

  if (p === '/api/history') {
    if (!authorized(req)) return send(res, 401, { ok: false, error: '请先输入邀请码' })
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit')) || 60))
    return send(res, 200, await petHistory(limit))
  }

  if (p === '/api/stickers') {
    if (!authorized(req)) return send(res, 401, { ok: false, error: '请先输入邀请码' })
    return send(res, 200, { ok: true, count: stickerList.length, stickers: stickerList })
  }

  if (p.startsWith('/s/')) {
    if (!authorized(req)) return send(res, 401, { ok: false, error: '请先输入邀请码' })
    const hash = p.slice(3).replace(/\.gif$/i, '').replace(/[^a-f0-9]/gi, '')
    if (!hash) return send(res, 404, 'not found', 'text/plain')
    try {
      const r = await fetch(`${STICKER_BASE}/${hash}.gif`)
      if (!r.ok) return send(res, 404, 'not found', 'text/plain')
      const buf = Buffer.from(await r.arrayBuffer())
      res.writeHead(200, { 'content-type': 'image/gif', 'content-length': buf.length, 'cache-control': 'public, max-age=86400' })
      res.end(buf)
      return
    } catch { return send(res, 502, 'proxy error', 'text/plain') }
  }

  if (p === '/') {
    // 支持直接带邀请码的链接：/?invite=CODE 自动放行
    if (url.searchParams.get('invite') === INVITE && INVITE) {
      res.setHeader('Set-Cookie', `${COOKIE}=${COOKIE_VAL}; Path=/; HttpOnly; Max-Age=${90 * 24 * 3600}; SameSite=Lax`)
    }
    return send(res, 200, indexHtml, 'text/html; charset=utf-8')
  }

  // 静态文件（头像等）
  {
    const rel = p.replace(/^\/+/, '').replace(/\.\./g, '')
    if (rel) {
      const file = path.join(__dirname, 'public', rel)
      if (fs.existsSync(file) && fs.statSync(file).isFile()) {
        const types = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.css': 'text/css', '.js': 'text/javascript' }
        const type = types[path.extname(file).toLowerCase()] || 'application/octet-stream'
        res.writeHead(200, { 'content-type': type, 'cache-control': 'public, max-age=86400' })
        fs.createReadStream(file).pipe(res)
        return
      }
    }
  }

  return send(res, 404, 'not found', 'text/plain')
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`whaleweb listening on http://127.0.0.1:${PORT}`)
})
