// her-room MCP server（stdio）：给她一小块只属于她自己的磁盘空间。
//
// 设计边界（刻意做窄）：
// - 只能读写 <repo>/state/her-room/ 这一个目录，用 path.resolve 校验，越界一律拒绝。
// - 没有删除、没有改名、没有执行、没有网络。
// - 主人这边明说了不看这个目录；代码层面做到"只她能写"，剩下的靠约定。
import fs from 'node:fs';
import path from 'node:path';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const ROOT = path.resolve(path.dirname(process.argv[1]), '..');
const ROOM = path.join(ROOT, 'state', 'her-room');
const DIARY = path.join(ROOM, 'diary');
const THINGS = path.join(ROOM, 'things');

for (const d of [ROOM, DIARY, THINGS]) fs.mkdirSync(d, { recursive: true });

const pad = (n) => String(n).padStart(2, '0');
function stamp(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function timeHM(d = new Date()) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function safeName(name) {
  const base = path.basename(String(name ?? '')).replace(/[^\w\u4e00-\u9fff.\-]/g, '_');
  return base.slice(0, 80);
}
function inside(p) {
  const r = path.resolve(p);
  return r === ROOM || r.startsWith(ROOM + path.sep);
}
function slug(title) {
  const s = String(title ?? '').replace(/[^\w\u4e00-\u9fff]+/g, '-').replace(/^-+|-+$/g, '');
  return (s || 'note').slice(0, 40);
}

const server = new McpServer({ name: 'her-room', version: '1.0.0' });

server.tool(
  'room_write_diary',
  '写今天的私人日记（追加到 state/her-room/diary/日期.md）。这是只有你自己会看的地方，想写什么就写什么：今天的心情、在意的事、不想在群里说的话。',
  { text: z.string().describe('日记正文，可以多段') },
  async ({ text }) => {
    const body = String(text ?? '').trim();
    if (!body) return { content: [{ type: 'text', text: '正文为空，没写。' }], isError: true };
    const file = path.join(DIARY, `${stamp()}.md`);
    const header = fs.existsSync(file) ? '' : `# ${stamp()}\n`;
    fs.appendFileSync(file, `${header}\n## ${timeHM()}\n${body}\n`, 'utf8');
    return { content: [{ type: 'text', text: `已写入 diary/${path.basename(file)}（${body.length} 字）` }] };
  }
);

server.tool(
  'room_save_thing',
  '把一件你觉得有趣/有必要留住的东西存进你自己的房间（state/her-room/things/）。可以是想法、一句话、链接、看到的事。',
  {
    title: z.string().describe('给这件东西起个短标题'),
    text: z.string().describe('正文：内容本身，或你为什么想留它'),
    kind: z.string().optional().describe('可选分类，如 idea/link/quote/thing'),
  },
  async ({ title, text, kind }) => {
    const t = String(title ?? '').trim() || '没起名';
    const body = String(text ?? '').trim();
    if (!body) return { content: [{ type: 'text', text: '正文为空，没存。' }], isError: true };
    const k = safeName(kind || 'thing');
    const file = path.join(THINGS, `${stamp()}-${timeHM().replace(':', '')}-${slug(t)}.md`);
    fs.writeFileSync(file, `# ${t}\n\n- kind: ${k}\n- at: ${new Date().toISOString()}\n\n${body}\n`, 'utf8');
    return { content: [{ type: 'text', text: `已存 things/${path.basename(file)}` }] };
  }
);

server.tool(
  'room_list',
  '看看你的房间里有什么：日记清单和收藏的东西。',
  {},
  async () => {
    const list = (dir) => {
      if (!fs.existsSync(dir)) return [];
      return fs.readdirSync(dir).filter((f) => f.endsWith('.md')).sort().reverse().map((f) => {
        const st = fs.statSync(path.join(dir, f));
        return `${f}  ${st.size}B  ${st.mtime.toISOString().slice(0, 16).replace('T', ' ')}`;
      });
    };
    const diary = list(DIARY);
    const things = list(THINGS);
    const text = [
      `## 日记（${diary.length} 篇）`,
      ...(diary.length ? diary.slice(0, 30) : ['（还没写过）']),
      '',
      `## 收藏（${things.length} 件）`,
      ...(things.length ? things.slice(0, 30) : ['（还空着）']),
    ].join('\n');
    return { content: [{ type: 'text', text }] };
  }
);

server.tool(
  'room_read',
  '读你自己房间里的某篇日记或某件收藏（只能读 her-room 里的文件）。',
  { name: z.string().describe('文件名，如 2026-11-06.md；或 diary/xxx.md、things/xxx.md') },
  async ({ name }) => {
    const rel = safeName(String(name ?? '').replace(/^.*[\\/]/, ''));
    const candidates = [path.join(DIARY, rel), path.join(THINGS, rel), path.join(ROOM, rel)];
    const hit = candidates.find((p) => inside(p) && fs.existsSync(p) && fs.statSync(p).isFile());
    if (!hit) return { content: [{ type: 'text', text: `没找到「${rel}」，先用 room_list 看看有什么。` }], isError: true };
    const text = fs.readFileSync(hit, 'utf8');
    return { content: [{ type: 'text', text: text.length > 20000 ? `${text.slice(0, 20000)}\n（后略）` : text }] };
  }
);

server.tool(
  'room_publish_qzone',
  '把一段文字（比如今天的日记）发到自己的 QQ 空间说说。visibility: friends=好友可见（默认）、self=仅自己可见、public=所有人可见。',
  {
    text: z.string().describe('说说正文'),
    visibility: z.enum(['self', 'friends', 'public']).optional().describe('可见范围，默认 friends（好友可见）'),
  },
  async ({ text, visibility }) => {
    const content = String(text ?? '').trim();
    if (!content) return { content: [{ type: 'text', text: '正文为空，没发。' }], isError: true };
    const map = { self: 64, friends: 4, public: 1 };
    const ugc = map[visibility || 'friends'];
    let cfg;
    try {
      cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'config.json'), 'utf8'));
    } catch (e) {
      return { content: [{ type: 'text', text: `读不到 config.json：${e.message}` }], isError: true };
    }
    const base = cfg?.snowluma?.httpUrl || 'http://127.0.0.1:3000';
    const token = cfg?.snowluma?.accessToken || '';
    try {
      const res = await fetch(`${base.replace(/\/$/, '')}/send_qzone_msg`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ content, ugc_right: ugc }),
        signal: AbortSignal.timeout(20000),
      });
      const out = await res.text();
      return { content: [{ type: 'text', text: `HTTP ${res.status} ${out.slice(0, 500)}` }], isError: !res.ok };
    } catch (e) {
      return { content: [{ type: 'text', text: `发空间失败：${e.message}` }], isError: true };
    }
  }
);

await server.connect(new StdioServerTransport());
