// src/memory-graph.js —— 记忆图谱适配层（wrap vendored CJS 引擎）
//
// 对话 → 知识图谱 → 向量召回 → 遗忘曲线。引擎本体在 src/memory-graph-engine/
// （MIT，源自 feiyuos-memory-graph，零依赖、纯 Node）。
//
// 用法：
//   const g = await openMemoryGraph({ dir, provider, persona })
//   g.enqueue({ userMessage, aiResponse })           // 每轮对话结束，攒满 batch 后台抽取
//   const { promptText } = await g.recall(text)      // 生成回复前，取 top5 相关记忆
//   await g.close()                                   // 退出前刷缓冲
//
// provider 两种：
//   - 'offline'：内置规则抽取 + n-gram 向量，零外部依赖，仅用于验证与测试。
//   - 'openai' ：任何 OpenAI 兼容端点（chat 用于抽取 + embed 用于向量）。
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { MemoryEngine, providers } = require('./memory-graph-engine/index.js')

export function providerFromConfig(cfg = {}) {
  const kind = cfg && cfg.provider === 'openai' ? 'openai' : 'offline'
  if (kind === 'openai') {
    return providers.openai({
      baseUrl: String(cfg.baseUrl ?? ''),
      apiKey: String(cfg.apiKey ?? ''),
      chatModel: String(cfg.chatModel || 'deepseek-chat'),
      embedModel: String(cfg.embedModel || 'bge-m3'),
      dim: Number(cfg.dim) || 1024,
      ...(cfg.headers && typeof cfg.headers === 'object' ? { headers: cfg.headers } : {}),
    })
  }
  return providers.offline()
}

export async function openMemoryGraph({ dir, provider, persona = {}, batchSize = 2 } = {}) {
  const engine = await MemoryEngine.open({
    dir: String(dir ?? ''),
    provider: providerFromConfig(provider),
    persona: {
      personaName: String(persona.personaName || '小鲸鱼'),
      genderTerm: String(persona.genderTerm || '主人'),
    },
    batchSize: Number(batchSize) || 2,
  })
  return {
    enqueue: (turn) => engine.enqueue(turn),
    flush: () => engine.flush(),
    recall: (text) => engine.recall(text),
    close: () => engine.close(),
    engine,
  }
}

export { providers }
