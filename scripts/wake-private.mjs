// 每天 15:30（下课后）唤醒私聊，让她把"今天发生的事"主动说给主人听
import fs from 'node:fs';
import http from 'node:http';

const ROOT = 'C:/dsh/repos/surfcore';
const token = fs.readFileSync(`${ROOT}/state/console-token`, 'utf8').trim();
const body = JSON.stringify({ key: 'private:3064550366', reason: 'proactiveCheck' });

const log = (line) => {
  console.log(line);
  try { fs.appendFileSync(`${ROOT}/logs/daily-life.log`, line + '\n'); } catch {}
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
    log(`[${new Date().toISOString()}] wake-private http=${res.statusCode} ${out.replace(/\s+/g, ' ').slice(0, 200)}`);
    process.exitCode = res.statusCode === 200 ? 0 : 1;
  });
});
req.on('timeout', () => req.destroy(new Error('timeout')));
req.on('error', (e) => { log(`[${new Date().toISOString()}] wake-private ERROR ${e.message}`); process.exitCode = 1; });
req.end(body);
