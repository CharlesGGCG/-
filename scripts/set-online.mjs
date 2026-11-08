// 上线/下线开关：node set-online.mjs true|false
// true = 下线（暂停二代 AI：不唤醒、不等待、不回消息）
import fs from 'node:fs';
import http from 'node:http';

const wantPaused = String(process.argv[2] ?? '').trim() === 'true';
const ROOT = 'C:/dsh/repos/surfcore';
const token = fs.readFileSync(`${ROOT}/state/console-token`, 'utf8').trim();
const body = JSON.stringify({ paused: wantPaused });

const req = http.request({
  host: '127.0.0.1',
  port: 3100,
  path: `/api/socialV2/activity?token=${encodeURIComponent(token)}`,
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'content-length': Buffer.byteLength(body),
    origin: 'http://127.0.0.1:3100',
  },
  timeout: 10000,
}, (res) => {
  let out = '';
  res.setEncoding('utf8');
  res.on('data', (c) => { out += c; });
  res.on('end', () => {
    const line = `[${new Date().toISOString()}] want=${wantPaused ? 'offline' : 'online'} http=${res.statusCode} ${out.trim()}`;
    console.log(line);
    try { fs.appendFileSync(`${ROOT}/logs/online-schedule.log`, line + '\n'); } catch {}
  });
});
req.on('timeout', () => { req.destroy(new Error('timeout')); });
req.on('error', (e) => {
  const line = `[${new Date().toISOString()}] want=${wantPaused ? 'offline' : 'online'} ERROR ${e.message}`;
  console.log(line);
  try { fs.appendFileSync(`${ROOT}/logs/online-schedule.log`, line + '\n'); } catch {}
  process.exitCode = 1;
});
req.end(body);
