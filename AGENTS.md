# AGENTS.md

本文件用于约束 AI 生成代码的风格、边界和实现方式。目标不是限制创造力，而是减少“AI 味”、保持项目像一个长期维护的真实产品。

## 项目上下文

- 项目：Agent Factory 智能体工作台
- 技术栈：pnpm monorepo + Nuxt 4 + Vue 3 + TypeScript + Pinia + Pinia Colada + shadcn-vue + Tailwind CSS + TanStack Vue Table + Zod + @vueuse/core + @vueuse/motion + fast-deep-equal + nanoid + date-fns + Nitro Server Routes + Biome
- 核心能力：Agent 配置、能力管理、Playground、Trace、状态机、版本发布与回滚
- 交付节奏：按方案中的 L1 → L2 → L3 → L4 分层实现

## 目录与职责

- `apps/web/pages/`：页面入口，只负责组合组件，不写复杂业务逻辑
- `apps/web/components/`：展示与交互组件，不直接调用 `$fetch`
- `apps/web/composables/`：可复用的客户端逻辑，例如 `useAgentStatus`、`useMockChat`
- `apps/web/stores/`：全局状态与状态机，例如 Agent 配置、发布历史
- `apps/web/server/api/`：Nitro Server Routes，负责 Mock API 和未来真实后端代理
- `packages/agent-core/`：纯 TS 领域包，放类型、状态推导、Evals 断言、Zod Schema
- `packages/mock-engine/`：Mock 数据、测试场景与回复规则引擎
- `apps/web/lib/`：UI 基础工具，例如 `cn()`、Tailwind 相关辅助

## 命名规则

使用产品语言，而不是泛化命名：

```ts
// 推荐
saveAgent()
publishAgent()
rollbackToVersion()
AgentSnapshot
Capability
publishHistory

// 避免
handleClick()
dataList
Item
process()
```

文件命名与目录语义一致，组件使用 `PascalCase`，composable 使用 `useXxx`，server route 使用 Nuxt 约定。

## TypeScript 约束

- 开启严格模式，禁止 `any`
- 领域类型集中放在 `packages/agent-core/src/types.ts`
- 请求与表单 Schema 统一放在 `packages/agent-core/src/schemas.ts`，前端 vee-validate 与 Nitro Server Route 复用
- 函数尽量声明返回类型
- 不引入无意义的泛型
- 不为一次使用创建过度抽象

## 状态边界

Pinia 只放跨组件共享的 Agent 状态：

- `config`
- `savedConfig`
- `publishedConfig`
- `publishHistory`
- `version`
- 保存 / 发布 loading 与 error

消息流和 Trace 由 `useMockChat` 管理，不放进 Pinia，避免状态来源混乱。
Pinia Colada 只负责服务端请求缓存与 mutation loading；请求结果进入 Pinia 后，由 Pinia 作为编辑态唯一来源。

状态机必须保持以下不变量：

- `publishedConfig === publishHistory[last].config`
- `version === publishHistory[last].version`

## Mock 与 API

- 前端统一使用 `$fetch('/api/...')`
- Server Route 负责读取请求体并返回结构化响应
- `packages/mock-engine` 的 `replyEngine` 依据请求体中的 config 快照回复，不读取前端全局状态
- 不引入 MSW 作为运行时 Mock
- 失败路径通过 Nitro Server Route 返回 500 模拟

## 代码质量

- 使用 Biome 作为唯一格式化与 lint 工具，不引入 Prettier / ESLint
- 根目录维护 `biome.json`，提交前运行 `biome check --write .`
- 开启 import 排序和 `useSortedClasses`，保证 Tailwind class 顺序
- 不生成无意义注释、`any`、魔法数字和未使用依赖

## 组件规范

- 组件只做展示和用户输入，不直接写业务规则
- 视觉样式优先使用 Tailwind 和 shadcn-vue token，不堆砌任意 utility class
- 避免为单一场景创建过多子组件
- 使用语义化变量名，状态提示同时提供文字和视觉反馈
- 动画使用 `@vueuse/motion` 或 Vue `<Transition>`，保持短时、克制，并遵循 `prefers-reduced-motion`
- 滚动容器统一使用 Reka UI `ScrollArea`，不手写滚动条 CSS
- 通用能力优先使用成熟开源库，不手写 deepEqual、ID、时间、滚动条等通用逻辑；只允许手写产品特定逻辑

## AI 味禁止清单

不要生成以下代码：

- 复述代码的无意义注释
- 无理由的 `TODO`、`FIXME`
- 所有函数都 `async`，即使没有异步操作
- 用 `any`、`unknown` 逃避类型
- 魔法数字和魔法字符串
- 只使用一次的抽象层
- 冗余 `try/catch/finally`，除非确实需要清理资源或处理已知错误
- 生成与产品无关的示例文案
- 一次性引入多个未使用的依赖

## 提交与审查

- 按功能分层提交，例如 `feat: L1 core loop`
- 每次提交只包含一个可理解的变更
- 生成后必须检查：
  - 是否有死代码
  - 是否有不属于当前文件的职责
  - 命名是否能直接映射到产品概念
  - 是否引入当前不需要的依赖
  - 是否出现重复逻辑

## 实现顺序

优先保证核心闭环：

1. 类型与 Mock 数据
2. Pinia 状态机
3. 三栏布局与配置面板
4. Playground 纯文本对话
5. 状态徽标与保存 / 发布
6. Trace、版本 diff、回滚、一键回归

每完成一层，验证一次，再进入下一层。
