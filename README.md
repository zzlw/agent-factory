# Agent Factory 智能体工作台

面向非开发者与开发者混合人群的 AI Agent 低代码构建平台。本仓库实现的是单个 Agent 的创建与调试工作台：配置 Prompt、模型与能力，在 Playground 中即时测试，并完成保存、发布、版本 diff 与回滚。

## 技术栈

- pnpm monorepo + Nuxt 4 + Vue 3 + TypeScript
- Pinia + Pinia Colada
- shadcn-vue（Reka UI）+ Tailwind CSS v4
- ai-elements-vue + vue-stream-markdown
- TanStack Vue Table v8 + vee-validate + @vee-validate/zod
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

## 部署与国内访问

- Vercel 自动识别 Nuxt：Root Directory 设为 `apps/web`，Build/Install/Output 均使用自动检测，不在仓库里维护 `vercel.json`。
- 默认地址：`https://agent-factory-vert.vercel.app`
- 国内镜像：`https://agent-factory.jiawen.live`（通过 Cloudflare 权威 DNS 做 DNS-only CNAME 到 Vercel 中国区节点）

复现方式：

```bash
vercel domains add agent-factory.jiawen.live agent-factory

curl -X POST "https://api.cloudflare.com/client/v4/zones/<zone_id>/dns_records" \
  -H "Authorization: Bearer <api_token>" -H "Content-Type: application/json" \
  -d '{"type":"CNAME","name":"agent-factory","content":"cname-china.vercel-dns.com","proxied":false}'

vercel domains verify agent-factory.jiawen.live
```

要点：CNAME 必须关闭 Cloudflare 代理（灰云 / DNS only），流量直达 `cname-china.vercel-dns.com`；开橙云会绕行 Cloudflare 代理并与 Vercel 证书冲突。

## 依赖说明

- `esbuild` 在 `pnpm-workspace.yaml` 中被固定为 `0.27.7`：pnpm 11 在重解析锁文件时会把 `esbuild@0.28.x` 的平台可选依赖（`@esbuild/darwin-arm64` 等）丢掉，导致 Nitro 构建报 `Host version 0.28.2 does not match binary version 0.27.7`。固定到 fontless 已锁定的 `0.27.7` 后 esbuild 只保留一份，平台依赖完整。
- 本地包通过 workspace 协议引用，Nuxt 在 `nuxt.config.ts` 中声明了 `build.transpile`。

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

## 演示走查

```text
1. 打开 /overview，查看当前 Agent 状态、能力摘要与线上差异
2. 右侧 Playground 用测试场景芯片发送“测试能力”
3. 修改 System Prompt，顶栏状态变为 Draft
4. 展开助手消息的“执行轨迹”查看 Trace
5. 点击“运行全部场景”，查看 4 个场景的通过/失败摘要
6. 保存（或 Cmd/Ctrl+S），状态变为 Saved
7. 点击“发布更新”，填写发布说明，生成 v3
8. 再次修改配置，进入 /versions 查看字段级 diff
9. 从 v2 点击“回滚到此版本”，配置载入草稿，状态回到 Draft
10. 顶栏“失败演示”后再保存/发布，验证 Nitro 返回 500 的失败路径
```
