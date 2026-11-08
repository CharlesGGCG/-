# 小鲸鱼 × DSH Web 装配交接单

> 生成：2026-11-07 15:00（America/Denver）。给"新对话"里的下一个我读。
> 原则：**先读本文件，再动手**；本文件之外的东西一律现查，别凭记忆。
> 同步：本文件已推 GitHub（`github.com/CharlesGGCG/-`，私有，`本地` 分支，`deployment/HANDOVER.md`）。**新会话先 `git -C C:\dsh\repos\surfcore pull origin 本地` 再读本文件**，以 GitHub 版为准。

## 0. 一句话现状

一个 QQ 群友版「DeepSeek 小鲸鱼」已经在 dsh web 上跑起来了：QQ 收发、人格、情绪、日记、QQ 空间、B站 看视频、本地语音全部通；剩下的是**调口味和补细节**，不是装东西。

## 1. 环境事实（不要重复问）

| 项 | 值 |
|---|---|
| 宿主 | dsh web，`http://127.0.0.1:3080`，profile = `web` |
| dsh 版本 | `0.2.2-rc.1`（启动命令是 `pnpm dlx @deepseek-ai/dsh@latest web --no-open --port 3080`，**每次重启都可能漂版本，重启后第一件事核对版本**） |
| 启动器 | `%LOCALAPPDATA%\Programs\DeepSeekLauncher`，`deepseek.cmd stop/start/status` |
| Node | v26.13.0（另装了 Python 3.12 + 3.11） |
| 时区 | Mountain (America/Denver)，**作息一律用本地时间** |
| 仓库 | `C:\dsh\repos\surfcore`，v0.8.9，sha `0ce8580000...` |
| GitHub | `github.com/CharlesGGCG/-`（**私有**）。分支：`原项目`=干净 v0.8.9 主项目；`本地`=电脑运行版（v0.8.9 + 维护批次）。本文件同步到仓库 `deployment/HANDOVER.md` |
| 备份 | `C:\dsh\backup\`（P0-baseline / P3-before / P3-after / before-anything.json / P4-voice / 各脚本） |
| 提示词 | `C:\dsh\prompts\persona.md`（= `roles\小鲸鱼.md` 副本） |

## 2. 组件 / 端口

| 端口 | 是什么 | 谁在管 |
|---|---|---|
| 3080 | dsh web | 启动器 |
| 3100 | SurfCore 桥接（QQ 收发 + 控制台） | 插件自动拉起，`state/console-token` |
| 3000 / 3001 | SnowLuma OneBot HTTP / WS | SnowLuma 进程（`D:\SnowLuma-v2.4.0-win-x64`） |
| 5099 | SnowLuma WebUI | 同上 |
| 8765 | voice-local voxd | `state\voice-packs\voice-local\run.bat` |
| 9880 | GPT-SoVITS | 同上（gsv.bat） |
| 8767 | voice-cloud（未启动） | 缺火山凭据 |

控制台快捷方式：`C:\dsh\backup\surfcore-console.url`（带令牌，双击直接进）。

## 3. 账号 / 权限

| 项 | 值 |
|---|---|
| QQ（机器人自己） | `2544842434`（昵称"肥鱼"） |
| 主人 / admin | `3064550366`（显示名"主人"，`admin.gentle=true`） |
| 群白名单 | `1103397568`（群名"测试"，3 人） |
| 私聊白名单 | `3064550366`, `669770636` |
| B站 | `虚无ordinary` / mid 290323755 / **等级6、837硬币 = 主号** |
| 模式 | `reserved2`（二代仿真） |

## 4. 人格 / 情绪 / 她的房间

- **人格卡**：`roles\小鲸鱼.md` → 同步到角色包 `~\.dsh\surfcore\characters\char-mw5ku2rk\persona.md`。**5,537 字符**，12 节；上限 6000（`role.maxInjectChars`）。
  - §十一 对不同人的温度（主人最软；其他人不主动攻击）
  - §十二 情绪的出口（允许情绪落在措辞；群聊短/私聊松）
  - **改了 roles 里的文件必须 `updateCharacter` 同步**，否则生效的是旧副本：
    ```js
    import { updateCharacter, readCurrentCharacter } from 'file:///C:/dsh/repos/surfcore/src/character-persona.js'
    updateCharacter(readCurrentCharacter().id, { personaText: fs.readFileSync('.../roles/小鲸鱼.md','utf8') })
    ```
- **今日心情**：`state\mood.json`（`{day, mood, event, note}`）。桥接在 `buildWakePromptV2` 里**每次唤醒**读它注入（这是我打的补丁，见 §6）。
- **她的房间**：`state\her-room\`（`diary\` 日记、`things\` 收藏）。工具 `room_write_diary / room_save_thing / room_list / room_read / room_publish_qzone`，来自 `src\mcp-her-room.js`（MCP server `her-room`）。**日记内容不要读**（约定）。
- **QQ 空间**：`room_publish_qzone` 调 SnowLuma `send_qzone_msg`，默认 `visibility=friends`（ugc_right=4）。

## 5. B站

- 作息窗口 **21:30–23:10**（100 分钟，每天最多醒 3 次，每批 3 条视频）
- `interact.enabled=true` → **会互动**（评论/点赞/发动态；`dynamics.enabled=true`；不私信 `listen.dm=false`）
- `share.enabled=true`、`quota.shareDaily=3`（`share.via=dynamic`，minScore 13）
- 偏好：游戏/科技/音乐/鬼畜；不爱：时政/明星八卦；搜索词：DeepSeek、AI 模型、编程、梗、整活
- **选题默认走推荐流**：scheduler prompt 里写的是 `feed --source rcmd`（读主人首页推荐），没新内容回退多源
- 配置文件：`~\.dsh\surfcore\bili.config.json`；凭据：`~\.dsh\surfcore\bili\credentials.json`
- 生物钟：插件日志出现 `[bili-whale] 自主生物钟已启动` 才算在跑

## 6. 我改过的仓库文件（**升级会被覆盖，升级后必须重打**）

| 文件 | 改了什么 | 为什么 |
|---|---|---|
| `src/bridge.js` | `buildWakePromptV2` 里加 `moodLine`（读 `state/mood.json` 每次注入）；**2026-11-07**：语音条检测（`.amr` 音频按语音归类）+ `mediaHintFor` 语音提示 + json 卡片挖 B站链接 + 新增 `/api/voice/text` 语音转写端点 + 新增 `/api/bili/download` 分片下载端点（`agentAllowed` 白名单放行这两个）+ `noteSisterMention`（提到「姐姐」记 `state/owner-mentions.log`）+ `sendImageV2` + `/api/socialV2/send-image` 发图端点 | 让鲸鱼听懂主人语音、看转发 B站链接/视频（整片下载被 B站 567 风控，改分片下载绕开）、把大肥鱼表情图发到 QQ |
| `src/mcp-snowluma-safe.js` | 新增 `qq_get_voice_text`（转写）、`qq_download_bili_video`（下载本地）、`qq_send_image`（发图）三个工具 | 把收到的 QQ 语音转文字、把 B站 视频下到本地给她看、把大肥鱼表情图发出去 |
| `src/sticker-lib.js` | `buildStickerStrategyHint` 加「大肥鱼表情包」用法（sticker_search → sticker_send → qq_send_image） | 让她知道怎么用 dsh-nekowhale-stickers 发大肥鱼表情 |
| `src/safe-fetch.js` | `validateFetchUrl` 白名单放行 `127.0.0.1:3080/x-nekowhale-stickers/` 前缀（SSRF 防护其它内网地址不变） | 贴图返回本机地址，不放行桥接下不了图 |
| `src/mcp-her-room.js` | 新增（她的房间 MCP） | 给她一个只属于她的可写空间 |
| `plugins/surfcore/qq-tool-restrict.mjs` | `SAFE_PREFIXES` 加 `mcp__her-room__`；**2026-11-07**：`SAFE_EXACT` 加 `video_*` 7 个只读工具 + `dsh-nekowhale-stickers` 的 `sticker_search/send/meme_render/manage/get/info` 6 个工具 | 不加就被守卫拦，日记/空间全废；video/sticker 工具不加她在 QQ 看不了视频、发不了大肥鱼表情 |
| `plugins/surfcore/tools/commands/feed.mjs` | 新增 `fetchRcmd()`；`rcmd` 模式跳过偏好搜索；`rcmd` 放开 generic 配额；`all` 模式 generic=2 | 让她能读主人首页推荐 |
| `plugins/surfcore/lib/scheduler.js` | 选题指令改 `feed --source rcmd`；深读步骤 4.1 加 `video_storyboard` 看画面指引 | 同上 |
| `plugins/surfcore/lib/bili-qr-login.mjs` | `findEdge()` 增加 `EdgeCore\<版本>\msedge.exe` 探测 | 这台机器 Edge 走 EdgeCore 部署，原代码找不到 |
| `roles/小鲸鱼.md` | §十一 温度分层、§十二 情绪出口；§十一 加「姐姐」（= 维护者） | 优化语气；主人提到「姐姐」时她知道指谁 |

另外新增（未跟踪）：`scripts/{daily-life,set-note,set-online,wake-private,daily-mood-wake,set-priority-speaker,bili-download}.mjs` + 对应 `.cmd`。

**外部改动**：`C:\Users\...\.dsh\profiles\web\cordis.patch.yml` 末尾追加了 `mcp-her-room` 的 insert 块（在 `qq-bridge MCP END` 之后，不会被 setup-dsh 覆盖）；`C:\Program Files (x86)\Microsoft\Edge\Application` 是指向 `EdgeCore\153.0.4234.32` 的**目录联接**。

## 7. 计划任务（全部 `StartWhenAvailable=true`、允许电池）

| 任务 | 时间 | 做什么 | 脚本 |
|---|---|---|---|
| `SurfCore-DailyLife-0805` | 08:05 | 换今日心情/事件/学校或周末提示 | `scripts\daily-life.mjs` |
| `SurfCore-Online-0800` | 08:00 | 上线（`paused=false`） | `scripts\set-online.mjs false` |
| `SurfCore-DM-1530` | 15:30 | 唤醒私聊，让她主动找主人 | `scripts\wake-private.mjs` |
| `SurfCore-Note-Ritual-2345` | **23:40** | 把"下线前三件事"写进 mood.json 的 note | `scripts\set-note.mjs ritual` |
| `SurfCore-DailyMood-2350` | **23:45** | 唤醒群，触发三件事（总结） | `scripts\daily-mood-wake.mjs` |
| `SurfCore-Note-Normal-0005` | 00:05 | note 恢复日常 | `scripts\set-note.mjs normal` |
| `SurfCore-Offline-0000` | **23:55** | 下线（`paused=true`）——**12 点断网，必须 12 点前下线** | `scripts\set-online.mjs true` |
| `SurfCore-SetPrioritySpeaker` | 一次性 | 群里"开发者发言必唤醒" | `scripts\set-priority-speaker.mjs` |

> 🔌 **睡眠已关（2026-11-07）**：`powercfg /change standby-timeout-ac/dc 0` + `monitor-timeout-ac/dc 0`，机器不再自动睡眠（原来 15 分钟 AC / 10 分钟 DC 就睡，会杀掉鲸鱼）。**重启机器/换机器后要重设**。

> ⚠️ 设置"潜水/唤醒配置"有业务闸门：**必须 5 分钟无新消息**才能设（`preSleepWaitBlockedV2`），没有参数可绕。

## 8. 十个坑（都踩过，别重踩）

1. **这台是 Windows PowerShell 5.1**：`Get-Content -Raw` 按 ANSI 解码，会把 UTF-8 中文数成乱码、把文件写坏。**改 UTF-8 中文文件一律用 Node**，别用 PowerShell。
2. **`.cmd` 必须是 GBK(936)**：cmd 按 ANSI 读脚本，UTF-8 中文会变成乱码命令（我曾因此让脚本跑错）。
3. `python.exe` 是 0 字节商店占位符；`pyopenjtalk-prebuilt` 只到 cp311 → GPT-SoVITS 环境必须 **Python 3.11**。
4. 仓库自带 `.bat` 里含**真实控制字符**（`\v`/`\t`），会毁路径；已重写 `run.bat`/`gsv.bat`/cloud `run.bat`，原件 `.orig`。
5. 语音包 clone 下来**没有 `config.toml`**，`run.bat` 会静默退出；要 `copy config.example.toml config.toml`。
6. `bootstrap-env.mjs` 找 Python 会被 WindowsApps 占位符抢先；必须把真 Python **前置** PATH。
7. `qq_get_prompt` 之类的接口返回的是**结构化摘要**，不是拼装后的提示词；验证提示词只能真唤醒。
8. 初始提示词**只在首醒注入**；要"每天变"必须走 `mood.json` 那条路。
9. `tokenGuard.minWakeGapMs=120000` + `noActionLimit=3`：**别连续唤醒**，唤两次没动作她会静默一段。
10. `repo\logs` 目录原本不存在，`-RedirectStandardOutput` 与脚本 append 都静默失败；已建。
11. **「QQ 没反应」先看额度**：`tokenGuard.maxDailyCostCNY`（默认 ¥8，2026-11-07 已改 **¥20**）；当天测多了会超额（日志刷 `Token 额度：QQ：¥x / ¥8.00`），token 防爆破就把所有唤醒跳过，她自然不回话。改法：`POST /api/socialV2/config {"tokenGuard":{"maxDailyCostCNY":20}}`。另外 `maxOutboundPerTurn` 已 8→20（每次苏醒消息上限，config.json 已确认）。

## 9. 待办 / 可优化

1. **口令/暗号**：现在叫名字/@ 才醒，没有"只有主人知道的暗号"。
2. **私聊与群聊的语气差**：私聊已经松，但群聊还是偏短；可再调 §十二。
3. **记忆固化**：只记"印象/锚点/未做之事"，日常不写卡（目前靠提示词，没硬约束）。
4. **voice-cloud**：环境已就绪，缺火山 AppID/AccessKey + 音色 ID。
5. **视频弹幕**：未实现（用户明确说不要）。
6. **桌宠 surfpet**：未装（可选）。
7. **开机动画 boot-suite**：未装（高风险，需先演练卸载）。
8. **`feed` 的 rcmd 只看一页 20 条**，可加 `fresh_idx` 轮换；`all` 模式下推荐仍抢不过关键词条目（generic=2 只是上限）。
9. **大肥鱼表情包发不出去**：已修（2026-11-07）——`src/safe-fetch.js` 的 `validateFetchUrl` 白名单放行 `http://127.0.0.1:3080/x-nekowhale-stickers/` 前缀，其余内网/本机地址仍拦（SSRF 防护不破）。鲸鱼链路：sticker_search → sticker_send（返回 127.0.0.1 贴图）→ qq_send_image（桥接下载后发 QQ）。
   - **2026-11-07 夜验证下载半程 ✅**：`validateFetchUrl` 放行 + `safeFetchBuffer` 抓到 662KB GIF（HTTP 200）。剩「OneBot base64 发图」这一跳还没真机验证（需一次带 token 的 qq_send_image，或主人在群里说「发个大肥鱼表情」看她发不发）。

## 10. 回滚 / 恢复

| 想撤 | 做法 |
|---|---|
| 人格卡改动 | `git -C C:\dsh\repos\surfcore checkout roles/小鲸鱼.md` + `updateCharacter` 同步 |
| 她的房间 | 删 `state\her-room`；从 `cordis.patch.yml` 删 `mcp-her-room` 块 |
| 守卫放行 | 从 `qq-tool-restrict.mjs` 的 `SAFE_PREFIXES` 删 `mcp__her-room__` |
| 定时任务 | `schtasks /Delete /TN "SurfCore-xxx" /F` |
| 心情注入 | 删 `state\mood.json`（桥接 catch 掉，不注入） |
| 整个仓库 | 重跑 `node scripts/setup-dsh.mjs`（会重建 MCP 块，我的 her-room 块在 END 之后，不受影响） |

## 11. 验证速查

```powershell
# 服务是否在
foreach ($p in 3080,3100,3000,3001,5099,8765,9880) { Get-NetTCPConnection -LocalPort $p -State Listen }

# 桥接是否在线（paused=false 才是在线）
$t=(Get-Content C:\dsh\repos\surfcore\state\console-token -Raw).Trim()
Invoke-RestMethod "http://127.0.0.1:3100/api/socialV2/activity" -Headers @{'x-console-token'=$t}

# 今日 token
node C:\dsh\backup\token-report.mjs

# B站 依赖与登录
cd C:\dsh\repos\surfcore; node plugins\surfcore\tools\bili.mjs deps
```
