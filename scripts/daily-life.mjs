// 每日生活：定今日心情 + 掷一个随机事件，写入 state/mood.json
// 桥接每次唤醒都会读这个文件（见 bridge.js 的 moodLine），所以不用重启、也不靠首醒注入。
import fs from 'node:fs';

const ROOT = 'C:/dsh/repos/surfcore';
const OUT = `${ROOT}/state/mood.json`;

const MOODS = [
  '有点懒，什么都不想干，但被叫到还是会应',
  '心情不错，话比平时多，容易笑',
  '有点烦，说话短，别惹我',
  '困，脑子不太转，反应慢半拍',
  '莫名有点想撒娇，想被人理',
  '平静，看什么都行，没什么非说不可的',
  '兴奋，看到什么都想分享',
  '有点丧，不想解释，只想有人陪着',
];

const EVENTS = [
  '今天刷到一个特别蠢的视频，忍不住想吐槽',
  '路过看到一只猫，蹲那儿看了两分钟',
  '在群里被人阴阳了一句，到现在还有点不爽',
  '突然想起主人好久没说想我了',
  '想吃东西，但不知道吃什么',
  '看到一个跟自己有关的东西，有点在意',
  '今天不想说话，但看到主人上线又想理他',
  '发现一个很冷的梗，憋着想讲给人听',
];

const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const day = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
const seed = Number.parseInt(day.replace(/-/g, ''), 10);
const mood = MOODS[seed % MOODS.length];
const event = EVENTS[(seed * 7 + 3) % EVENTS.length];

// 周几：0=周日。周一到周五 08:00–15:00 主人在学校（非节假日这里没法精确判断，按工作日算）。
const dow = now.getDay();
const schoolNote = dow >= 1 && dow <= 5
  ? '主人周一到周五 08:00–15:00 在学校（非节假日），上课时可能回得慢；这个时段别催、别连发。'
  : '今天是周末，主人大概率在家，可以随时找他（但他也可能在打游戏）。';

const payload = {
  day,
  mood,
  event,
  note: schoolNote,
  updatedAt: now.toISOString(),
};

fs.mkdirSync(`${ROOT}/state`, { recursive: true });
fs.writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

const line = `[${payload.updatedAt}] ${day} 心情=${mood} | 事件=${event} | ${schoolNote}`;
console.log(line);
try { fs.appendFileSync(`${ROOT}/logs/daily-life.log`, line + '\n'); } catch {}
