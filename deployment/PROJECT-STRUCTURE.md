# 小鲸鱼 · 项目整体结构

> 生成：2026-11-08。surfcore v0.8.9，仓库 `C:\dsh\repos\surfcore`，远程 `github.com/CharlesGGCG/-`（私有）。
> 一句话：surfcore 是跑在 DeepSeek Harness（DSH）上的 Cordis 插件，把 DeepSeek 变成 QQ 群里的「小鲸鱼」——带人格、情绪、QQ 空间、B站、语音、表情包。

## A. 仓库本体（会进 GitHub 的部分）

```
C:\dsh\repos\surfcore/
├── src/                       # 核心运行时（79 文件）
│   ├── bridge.js              #   QQ 桥接主控（收发/唤醒/额度/发图/语音转写/分片下载端点）
│   ├── mcp-her-room.js        #   「她的房间」MCP（日记/收藏/发QQ空间）
│   ├── mcp-snowluma-safe.js   #   SnowLuma 安全 MCP（QQ 工具面：读消息/发图/语音/下B站视频）
│   ├── mcp-web-search-safe.js #   联网搜索 MCP（SSRF 防护）
│   ├── mcp-host-server.js     #   宿主 MCP
│   ├── bili-*.js              #   B站：api/卡片/动态/记忆/分享调度
│   ├── voice-*.js             #   语音：TTS/音色包/诊断/导入
│   ├── sticker-*.js           #   表情包：库/语义/策略
│   ├── persona-*.js  identity/role-card/self-identity  # 人格/身份/角色卡
│   ├── token-*.js  turn-guard  wake-*  v2-wait        # 额度/唤醒/轮次守卫
│   ├── safe-fetch.js  safe-text.js  sensitive.js       # SSRF/敏感词/安全
│   └── …（共约 79 个模块）
│
├── plugins/surfcore/          # Cordis 插件包（205 文件）
│   ├── lib/                   #   bili 客户端、scheduler、client…
│   ├── tools/                 #   bili 工具命令（feed/debrief/…）
│   ├── qq-mode/  persona/  presets/  platforms/  extensions/  runtime/  scripts/  locale/
│   └── qq-tool-restrict.mjs   #   QQ 工具白名单守卫
│
├── roles/                     # 人格卡（4 文件）
│   ├── 小鲸鱼.md              #   主人格（QQ 群友版 · 12 节）
│   ├── 傲娇助手.md / 小咪.md / README.md
│
├── scripts/                   # 开发/运维/测试脚本（241 文件）
│   ├── daily-life.mjs  set-note.mjs  daily-mood-wake.mjs  set-online.mjs
│   ├── wake-private.mjs  set-priority-speaker.mjs  bili-download.mjs
│   └── test-*.mjs  publish-*.mjs  release-*.mjs …
│
├── docs/                      # 文档（212 文件）
│   ├── README / ROADMAP / HANDOFF / PITFALLS / RELEASE / RELEASE-QUEUE
│   ├── RISK_REGISTER / COORDINATION / FOLDER_MAP / VOICE-PACKS …
│   └── cases/  guides/  handoffs/
│
├── dsh/  examples/  assets/  video/  dist/  public/  release/
├── *.cmd  *.bat               # Windows 调度/启动脚本（GBK）
├── package.json  README.md  README.en.md  CHANGELOG.md  LICENSE
├── AGENTS.md  RULES.md  config.example.json  .gitignore  .npmrc
```

## B. 本地运行时（gitignore，不上传）

```
C:\dsh\repos\surfcore\
├── state/                     # 运行时状态（54577 文件）——她的房间/心情/令牌/日志
│   ├── her-room/{diary,things}/  mood.json  console-token  owner-mentions.log …
├── config.json                # 实时配置（含 SnowLuma token 等密钥）→ 已忽略
├── node_modules/  logs/       # 依赖 + 日志
│
C:\dsh\                        # 部署根目录
├── HANDOVER.md  RESTART-CHECKLIST.md  restart*.cmd/log
├── prompts/  backup/  素材/  给她完整的一生/   # 提示词/备份/教学素材/生活归档
│
~\.dsh\                        # 用户数据（DSH 全局）
├── surfcore/                  #   bili.config.json、characters/、bili/credentials、cookies
├── sessions/                  #   会话日志（压缩）
├── profiles/web/              #   web profile（插件/MCP 装配）
└── bili-cookies.txt  video.json  whale-roles/  whale-audio/ …
```

## C. GitHub 分支结构（私有仓库）

- 远程：`https://github.com/CharlesGGCG/-.git`（**私有**）。
- 两条分支，职责分开：

| 分支 | 指向 | 含义 |
|---|---|---|
| `原项目` | `0ce8580`（release: v0.8.9） | 干净的 surfcore v0.8.9 主项目，无个人维护改动 |
| `本地` | `4845ddb` | **电脑上正在跑的版本** = 原项目 + 维护批次（27 文件，+893/−18） |

- 关系：`本地` 直接长在 `原项目` 上（线性，`原项目..本地` 只有 1 个提交），compare 干净。
- 维护批次内容：语音转写 / 分片下B站视频 / 发图 / 她的房间 / QQ空间 / 表情包 / 下线仪式（详见 HANDOVER §6）。
- 密钥安全：`config.json`、`state/` 已在 `.gitignore`，从未入仓。
