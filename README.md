# 鲸忆 · Whalemory —— 给 DSH agent 一个真实的身份

> **鲸忆 · Whalemory** —— 一条会记住的鲸鱼。
>
> 它不是「把大模型接进 QQ」的机器人框架，而是给 DeepSeek Harness 里的 agent 一个真实的身份：一条有自己人格、记忆和作息的鲸鱼，住在 QQ 与 B站 之间，也会坐在你的桌面上。她能听懂你的语音、看懂你转发的视频、把想留住的东西收进自己的房间、写下只有自己会看的日记，也记得关于你的事。
>
> 我们不想靠越来越长的提示词去「演」一个人，而是让她在每次醒来时，用第一人称回忆自己的记忆；把多模态信息喂给她，逐步减少提示词，寻找真正能充当记忆的方案。
>
> **Whalemory · 鲸忆** — A whale who remembers.
>
> Not another "plug an LLM into QQ" bot framework, but an attempt to give a DeepSeek Harness agent a real identity: a whale with her own personality, memory, and daily rhythm — living between QQ and Bilibili, and sitting on your desktop. She understands your voice, watches the videos you forward, keeps the little things worth holding onto in a room of her own, writes a diary only she will read, and remembers what matters about you.
>
> We don't want to "act human" through ever-longer prompts. Instead, each time she wakes, she recalls her own memories in first person. We feed her multimodal information, gradually shrink the prompt, and search for something that can truly serve as memory.

> **上游出处**：本项目基于 [Mieksido/surfcore](https://github.com/Mieksido/surfcore)（v0.8.9，MIT License）二次开发。原项目版权与许可见 [LICENSE](LICENSE)（Copyright (c) 2026 Derpyu520 and qq-bridge / QSH contributors）。本仓为个人维护分支，逐步偏离上游独立演进。上游不对本仓修改提供背书，问题请先在本仓提。

**中文** | [English](README.en.md)

---

## 两条路线

同一个她，两种活法。**换路线不换脑**——人格、记忆、语音、B站 都住在本地 DSH，变的只是「她跟人说话的入口」。

### 路线一 · QQ × B站（原玩法）

她活在 QQ 群里，也刷 B站、有桌宠分身。

```
QQ 群 / 私聊（SnowLuma）──┐
B站（看视频 / 评论 / 动态）──┼──▶ 同一颗脑：人格卡 + 记忆卡（本地 DSH）
桌宠（surfpet，可选）─────┘
```

适合想要「群友」体验的人；代价是 QQ 走非官方协议，有封控风险。

### 路线二 · 本地化（不靠腾讯）

放弃 QQ，她住在你的桌宠里、你的网页里；公开交流走 B站。

```
桌宠（surfpet）───────────┐
邀请 Web（whaleweb + 隧道）┼──▶ 同一颗脑：人格卡 + 记忆卡（本地 DSH）
B站（动态 / 评论 / 直播）──┘
（QQ 桥接：停用）
```

适合不想冒封号风险、只要「她陪你 + 几个朋友能找她」的人。

> 为什么放弃 QQ、凭什么本地能接住 → [放弃QQ方案](docs/放弃QQ方案.md)

---

## 快速开始

前置（两条路线共通）：Windows + Node ≥22.13 + DeepSeek Harness ≥0.2.1-rc.2。

### 路线一 · QQ × B站

```bash
git clone https://github.com/CharlesGGCG/Anamnesis-Whalemory-CharlesGXB.git
cd Anamnesis-Whalemory-CharlesGXB
npm install
cp config.example.json config.json      # 填 snowluma / ownerQQ / allow 白名单
node scripts/setup-dsh.mjs              # 挂 preset + MCP + bundle
# 重启 DSH → 设置 → SurfCore → 诊断 → 一键安装
```

另需自装 [SnowLuma2](https://github.com/SnowLuma/SnowLuma)（第三方 QQ 运行时）并扫码登录。手把手见 [INSTALL.md](docs/guides/INSTALL.md)。

### 路线二 · 本地化（桌宠 + 邀请 Web）

1. **桌宠**：设置页「桌宠」装 [surfpet](https://github.com/Mieksido/surfpet)（Electron 分身，5 套皮肤 + 文本/语音对话）。
2. **邀请 Web**：`whaleweb/`（一个 `server.mjs` + 一个 `index.html`，零依赖）；`config.json` 填邀请码，`node server.mjs` 起在 8787，外网用 Cloudflare 隧道。
3. **B站**：设置页「B站」扫码，她照常看视频 / 发动态 / 回评论。

详见 [放弃QQ方案](docs/放弃QQ方案.md)。

---

## 能力总览

| 子系统 | 你能看到的 | 细节 |
| --- | --- | --- |
| QQ | 群/私聊、引用回复、表情/图片/语音、拍一拍、四种运行模式 | [MODULE-BRIDGE.md](docs/guides/MODULE-BRIDGE.md) |
| B站 | 看视频/打分/评论/动态、直播间、34 个 CLI | [SUBSYSTEM-BILI.md](docs/guides/SUBSYSTEM-BILI.md) |
| 记忆 | 衰减卡 + 全量卡、三场景共享、遗忘与容量告警 | [MEMORY_CARD.md](docs/guides/MEMORY_CARD.md) |
| 人格 | 多角色整包切换、管理员双身份 | [CHARACTER_PERSONA.md](docs/guides/CHARACTER_PERSONA.md) |
| 主动 | 目的机制（载体 QQ / 桌宠） | [PURPOSE_OUTREACH.md](docs/guides/PURPOSE_OUTREACH.md) |
| 语音 | 本地 / 云端 TTS | [SUBSYSTEM-VOICE.md](docs/guides/SUBSYSTEM-VOICE.md) |
| 桌宠 | 文本/语音对话、气泡、专注模式 | [SUBSYSTEM-PET.md](docs/guides/SUBSYSTEM-PET.md) |
| 邀请 Web | 邀请码 + 隧道 + 网页聊天 | [放弃QQ方案](docs/放弃QQ方案.md) |

---

## 文档地图

- 总纲（进程 / 分层 / 改什么重启什么）：[ARCHITECTURE.md](docs/guides/ARCHITECTURE.md)
- 全索引：[docs/README.md](docs/README.md)
- 踩坑：[PITFALLS.md](docs/PITFALLS.md) · 风险台账：[RISK_REGISTER.md](docs/RISK_REGISTER.md)

---

## 安全与边界

- 发送必须命中白名单；工具面 fail-closed；控制台只接回环 + 令牌；密钥不落日志。
- 不可逆删除 = 事故（先隔离 `_backups/`）。
- 详见 [BOUNDARIES.md](docs/guides/BOUNDARIES.md)、[SECURITY_BASELINE.md](docs/guides/SECURITY_BASELINE.md)。

---

## 开发

```bash
npm run test:audit           # 默认门禁（离线）
npm run test:regressions     # 桥接 / 协议回归
cd plugins/surfcore && npm test
npm run guard:check          # DSH 升级后先跑（asar 护栏补丁）
```

---

## 许可

MIT。SnowLuma2 是第三方专有组件，不随仓库分发。请自行遵守 QQ / B站 服务条款。
