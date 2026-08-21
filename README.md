# Agent Factory 智能体工作台

面向非开发者与开发者混合人群的 AI Agent 低代码构建平台。本仓库实现的是单个 Agent 的创建与调试工作台：配置 Prompt、模型与能力，在 Playground 中即时测试，并完成保存、发布、版本 diff 与回滚。

## 技术栈

- pnpm monorepo + Nuxt 4 + Vue 3 + TypeScript
- Pinia + Pinia Colada
- shadcn-vue（Reka UI）+ Tailwind CSS v4
- ai-elements-vue + vue-stream-markdown
- Zod + fast-deep-equal + nanoid
- Nitro Server Routes（本地 Mock API）
- Biome

## 快速开始

```bash
pnpm install
pnpm dev
```

打开 `http://localhost:3000`。其他命令：

```bash
pnpm build      # 生产构建
pnpm typecheck  # 全仓类型检查
pnpm lint       # Biome 检查
pnpm lint:fix   # Biome 检查并自动修复
```

## 目录结构

```text
apps/web/
  components/    展示与交互组件（不直接调用 $fetch）
  composables/   可复用的客户端逻辑
  stores/        Pinia 全局状态与三快照状态机
  pages/         分区路由入口
  server/api/    Nitro Mock API
  lib/           UI 基础工具
packages/
  agent-core/    纯 TS 领域包（类型、状态推导、Evals、Zod Schema、diff）
  mock-engine/   Mock 数据、测试场景与回复规则引擎
```

## 核心概念

- **三快照状态机**：`config` / `savedConfig` / `publishedConfig` 通过 `fast-deep-equal` 推导 Draft / Saved / Published 状态。
- **Playground 与配置同屏**：每次对话请求体携带当前 config 快照，Mock 回复引擎依据请求体回复，不读取前端全局状态。
- **Evals-lite**：测试场景的通过 / 失败由 `ScenarioAssertion` 对实际回复与 Trace 计算得出。
- **版本与回滚**：发布历史是不可变快照，回滚只把历史配置载入草稿，再次发布生成新版本。
