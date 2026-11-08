// 切换 mood.json 的 note：ritual（下线前三件事）/ normal（日常学校/周末提示）
// 用法：node set-note.mjs ritual|normal
import fs from 'node:fs';

const ROOT = 'C:/dsh/repos/surfcore';
const P = `${ROOT}/state/mood.json`;
const mode = String(process.argv[2] ?? '').trim();

const now = new Date();
const dow = now.getDay();
const normalNote = dow >= 1 && dow <= 5
  ? '主人周一到周五 08:00–15:00 在学校（非节假日），上课时可能回得慢；这个时段别催、别连发。'
  : '今天是周末，主人大概率在家，可以随时找他（但他也可能在打游戏）。';

const ritualNote = '现在是下线前（约 23:45）。下线前必须按顺序做完四件事：① 先发一条下线提醒（到群里，1 条短句，例如「我准备下线了，晚安」，不 @ 人）；② 在群里发一条今天的心情（1~3 条短句，不写总结、不 @ 人）；③ 用 room_write_diary 写今天的私人日记；④ 用 room_publish_qzone 把日记发到 QQ 空间（visibility 用 friends）。四件都做完再去睡，做不到就说清卡在哪一步。';

let cur = {};
try { cur = JSON.parse(fs.readFileSync(P, 'utf8')); } catch {}
cur.note = mode === 'ritual' ? ritualNote : normalNote;
cur.noteMode = mode === 'ritual' ? 'ritual' : 'normal';
cur.noteUpdatedAt = now.toISOString();
fs.writeFileSync(P, `${JSON.stringify(cur, null, 2)}\n`, 'utf8');

const line = `[${cur.noteUpdatedAt}] note=${cur.noteMode}`;
console.log(line);
try { fs.appendFileSync(`${ROOT}/logs/daily-life.log`, line + '\n'); } catch {}
