# 鲸忆 · Whalemory — A real identity for DSH agents

> **Whalemory · 鲸忆** — A whale who remembers.
>
> Not another "plug an LLM into QQ" bot framework, but an attempt to give a DeepSeek Harness agent a real identity: a whale with her own personality, memory, and daily rhythm — living between QQ and Bilibili, and sitting on your desktop. She understands your voice, watches the videos you forward, keeps the little things worth holding onto in a room of her own, writes a diary only she will read, and remembers what matters about you.
>
> We don't want to "act human" through ever-longer prompts. Instead, each time she wakes, she recalls her own memories in first person. We feed her multimodal information, gradually shrink the prompt, and search for something that can truly serve as memory.
>
> **鲸忆 · Whalemory** —— 一条会记住的鲸鱼。
>
> 它不是「把大模型接进 QQ」的机器人框架，而是给 DeepSeek Harness 里的 agent 一个真实的身份：一条有自己人格、记忆和作息的鲸鱼，住在 QQ 与 B站 之间，也会坐在你的桌面上。她能听懂你的语音、看懂你转发的视频、把想留住的东西收进自己的房间、写下只有自己会看的日记，也记得关于你的事。
>
> 我们不想靠越来越长的提示词去「演」一个人，而是让她在每次醒来时，用第一人称回忆自己的记忆；把多模态信息喂给她，逐步减少提示词，寻找真正能充当记忆的方案。

> **Upstream**: this project is a fork of [Mieksido/surfcore](https://github.com/Mieksido/surfcore) (v0.8.9, MIT License). Original copyright and license are in [LICENSE](LICENSE) (Copyright (c) 2026 Derpyu520 and qq-bridge / QSH contributors). This is a personal maintenance fork, evolving independently of upstream. Please file issues here, not upstream.

**English** | [中文](README.md)

---

## Two routes

Same whale, two ways to live. **Switching routes never switches the brain** — persona, memory, voice and Bilibili all live in local DSH; only the "door through which she talks" changes.

### Route 1 · QQ × Bilibili (the original)

She lives in QQ groups, also browses Bilibili, and has a desktop-pet avatar.

```
QQ groups / DMs (SnowLuma) ────┐
Bilibili (watch / comment / post)┼──▶ One brain: persona card + memory card (local DSH)
Desktop pet (surfpet, optional) ─┘
```

For people who want the "group member" experience — at the cost of QQ's unofficial-protocol ban risk.

### Route 2 · Local-first (no Tencent)

Drop QQ. She lives in your desktop pet and your web page; public outreach goes through Bilibili.

```
Desktop pet (surfpet) ───────────┐
Invite Web (whaleweb + tunnel) ─┼──▶ One brain: persona card + memory card (local DSH)
Bilibili (posts / comments / live)┘
（QQ bridge: off）
```

For people who don't want the ban risk and only need "her company + a few friends can reach her".

> Why drop QQ, and how local carries it → [放弃QQ方案](docs/放弃QQ方案.md) (Chinese)

---

## Quick start

Common prerequisites: Windows + Node ≥22.13 + DeepSeek Harness ≥0.2.1-rc.2.

### Route 1 · QQ × Bilibili

```bash
git clone https://github.com/CharlesGGCG/Anamnesis-Whalemory-CharlesGXB.git
cd Anamnesis-Whalemory-CharlesGXB
npm install
cp config.example.json config.json      # fill snowluma / ownerQQ / allow whitelist
node scripts/setup-dsh.mjs              # install presets + MCP + bundle
# restart DSH → Settings → SurfCore → Diagnostics → one-click install
```

You also need to install [SnowLuma2](https://github.com/SnowLuma/SnowLuma) (third-party QQ runtime) yourself and scan the QR code. Step-by-step: [INSTALL.md](docs/guides/INSTALL.md).

### Route 2 · Local-first (desktop pet + invite web)

1. **Desktop pet**: Settings → Pet → install [surfpet](https://github.com/Mieksido/surfpet) (Electron avatar, 5 skins, text/voice chat).
2. **Invite Web**: `whaleweb/` (one `server.mjs` + one `index.html`, zero dependencies); set the invite code in `config.json`, run `node server.mjs` on 8787, expose it via a Cloudflare tunnel.
3. **Bilibili**: Settings → Bilibili → scan QR; she keeps watching / posting / replying.

See [放弃QQ方案](docs/放弃QQ方案.md) (Chinese).

---

## Capabilities

| Subsystem | What you get | Details |
| --- | --- | --- |
| QQ | groups/DMs, quote-reply, stickers/images/voice, poke, 4 run modes | [MODULE-BRIDGE.md](docs/guides/MODULE-BRIDGE.md) |
| Bilibili | watch/score/comment/dynamics, live room, 34 CLIs | [SUBSYSTEM-BILI.md](docs/guides/SUBSYSTEM-BILI.md) |
| Memory | decaying card + full card, 3-scene sharing, forgetting & capacity alerts | [MEMORY_CARD.md](docs/guides/MEMORY_CARD.md) |
| Persona | multi-character switch, admin dual-identity | [CHARACTER_PERSONA.md](docs/guides/CHARACTER_PERSONA.md) |
| Proactive | purpose engine (carrier QQ / pet) | [PURPOSE_OUTREACH.md](docs/guides/PURPOSE_OUTREACH.md) |
| Voice | local / cloud TTS | [SUBSYSTEM-VOICE.md](docs/guides/SUBSYSTEM-VOICE.md) |
| Desktop pet | text/voice chat, bubbles, focus mode | [SUBSYSTEM-PET.md](docs/guides/SUBSYSTEM-PET.md) |
| Invite Web | invite code + tunnel + web chat | [放弃QQ方案](docs/放弃QQ方案.md) |

---

## Docs map

- Overview (processes / layers / what-to-restart): [ARCHITECTURE.md](docs/guides/ARCHITECTURE.md)
- Full index: [docs/README.md](docs/README.md)
- Pitfalls: [PITFALLS.md](docs/PITFALLS.md) · Risk register: [RISK_REGISTER.md](docs/RISK_REGISTER.md)

---

## Security & boundaries

- Sending must hit the whitelist; the tool surface is fail-closed; the console is loopback-only + token; secrets never hit logs.
- Irreversible deletion is treated as an incident (quarantine to `_backups/` first).
- See [BOUNDARIES.md](docs/guides/BOUNDARIES.md), [SECURITY_BASELINE.md](docs/guides/SECURITY_BASELINE.md).

---

## Development

```bash
npm run test:audit           # default gate (offline)
npm run test:regressions     # bridge / protocol regression
cd plugins/surfcore && npm test
npm run guard:check          # run after DSH upgrade (asar session-guard patch)
```

---

## License

MIT. SnowLuma2 is a third-party proprietary component and is not distributed with this repo. Please comply with QQ / Bilibili ToS on your own.
