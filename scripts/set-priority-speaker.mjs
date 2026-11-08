// 把「开发者 3064550366」设为群 1103397568 的指定唤醒成员（他说话必醒）
// 注意：surfcore 要求设置潜水前有 5 分钟静默，所以本脚本应在凌晨安静时段跑。
import fs from 'node:fs';
import http from 'node:http';

const ROOT = 'C:/dsh/repos/surfcore';
const token = fs.readFileSync(`${ROOT}/state/console-token`, 'utf8').trim();

const payload = {
  key: 'group:1103397568',
  config: {
    mode: 'diving',
    infinite: true,
    triggers: {
      atMention: true,
      nameMention: true,
      question: true,
      poke: true,
      anyMessage: false,
      probability: 0.05,
      speakerIds: ['3064550366'],
      keywords: ['小鲸鱼', 'DeepSeek', 'deepseek', 'DS', 'D老师', 'd老师', 'D指导', 'd指导', 'D师傅', 'd师傅', '深度求索', '大肥鱼', '鲸鱼', 'DeepSeek V3', 'DeepSeek R1', 'R1'],
    },
  },
};
const body = JSON.stringify(payload);

const log = (line) => {
  console.log(line);
  try { fs.appendFileSync(`${ROOT}/logs/online-schedule.log`, line + '\n'); } catch {}
};

const req = http.request({
  host: '127.0.0.1', port: 3100,
  path: `/api/socialV2/wake-config?token=${encodeURIComponent(token)}`,
  method: 'POST',
  headers: { 'content-type': 'application/json', 'content-length': Buffer.byteLength(body), origin: 'http://127.0.0.1:3100' },
  timeout: 15000,
}, (res) => {
  let out = '';
  res.setEncoding('utf8');
  res.on('data', (c) => { out += c; });
  res.on('end', () => {
    const ok = res.statusCode === 200;
    log(`[${new Date().toISOString()}] set-speakerIds http=${res.statusCode} ${ok ? 'OK' : 'BLOCKED'} ${out.replace(/\s+/g, ' ').slice(0, 220)}`);
    process.exitCode = ok ? 0 : 1;
  });
});
req.on('timeout', () => req.destroy(new Error('timeout')));
req.on('error', (e) => { log(`[${new Date().toISOString()}] set-speakerIds ERROR ${e.message}`); process.exitCode = 1; });
req.end(body);
