// 每天 23:50 让她在群里发一条今日心情（触发一次主动唤醒，内容由她自己生成）
import fs from 'node:fs';
import http from 'node:http';

const ROOT = 'C:/dsh/repos/surfcore';
const token = fs.readFileSync(`${ROOT}/state/console-token`, 'utf8').trim();
const body = JSON.stringify({ key: 'group:1103397568', reason: 'proactiveCheck' });

const log = (line) => {
  console.log(line);
  try { fs.appendFileSync(`${ROOT}/logs/online-schedule.log`, line + '\n'); } catch {}
};

const req = http.request({
  host: '127.0.0.1', port: 3100,
  path: `/api/socialV2/wake?token=${encodeURIComponent(token)}`,
  method: 'POST',
  headers: { 'content-type': 'application/json', 'content-length': Buffer.byteLength(body), origin: 'http://127.0.0.1:3100' },
  timeout: 15000,
}, (res) => {
  let out = '';
  res.setEncoding('utf8');
  res.on('data', (c) => { out += c; });
  res.on('end', () => {
    log(`[${new Date().toISOString()}] daily-mood-wake http=${res.statusCode} ${out.replace(/\s+/g, ' ').slice(0, 200)}`);
    process.exitCode = res.statusCode === 200 ? 0 : 1;
  });
});
req.on('timeout', () => req.destroy(new Error('timeout')));
req.on('error', (e) => { log(`[${new Date().toISOString()}] daily-mood-wake ERROR ${e.message}`); process.exitCode = 1; });
req.end(body);
