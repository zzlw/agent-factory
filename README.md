# Agent Factory

Agent Factory is an AI agent low-code builder for developers and non-developers. It currently focuses on a single-agent creation and debugging loop: configure persona, model, and capabilities, validate them in the Playground, then save, publish, diff versions, roll back, and run one-click regression.

[简体中文](README.zh-CN.md) | English

<p align="center">
  <a href="https://agent-factory-vert.vercel.app"><img src="https://img.shields.io/badge/Live_Demo-Vercel-black?style=flat-square&amp;logo=vercel&amp;logoColor=white" alt="Live Demo"></a>
  <a href="https://agent-factory.jiawen.live"><img src="https://img.shields.io/badge/China_Mirror-agent--factory.jiawen.live-orange?style=flat-square&amp;logo=cloudflare&amp;logoColor=white" alt="China Mirror"></a>
  <a href="https://github.com/zzlw/agent-factory/deployments"><img src="https://img.shields.io/github/deployments/zzlw/agent-factory/production?label=CI%2FCD&amp;style=flat-square&amp;logo=githubactions&amp;logoColor=white" alt="CI/CD"></a>
  <a href="https://github.com/zzlw/agent-factory/commits/main"><img src="https://img.shields.io/github/last-commit/zzlw/agent-factory?style=flat-square&amp;logo=git&amp;logoColor=white" alt="Last Commit"></a>
</p>

<p align="center">
  <a href="https://nuxt.com"><img src="https://img.shields.io/badge/Nuxt-4-00DC82?style=flat-square&amp;logo=nuxtdotjs&amp;logoColor=white" alt="Nuxt 4"></a>
  <a href="https://vuejs.org"><img src="https://img.shields.io/badge/Vue-3-4FC08D?style=flat-square&amp;logo=vuedotjs&amp;logoColor=white" alt="Vue 3"></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&amp;logo=typescript&amp;logoColor=white" alt="TypeScript"></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind_CSS-v4-38BDF8?style=flat-square&amp;logo=tailwindcss&amp;logoColor=white" alt="Tailwind CSS v4"></a>
  <a href="https://pnpm.io"><img src="https://img.shields.io/badge/pnpm-11-F69220?style=flat-square&amp;logo=pnpm&amp;logoColor=white" alt="pnpm 11"></a>
</p>

## Live Demos

- Default: https://agent-factory-vert.vercel.app
- China mirror: https://agent-factory.jiawen.live

The default Vercel domain can be unreliable in mainland China. Use `agent-factory.jiawen.live` when accessing from China.

## Features

- **Three-pane workbench**: sidebar, configuration panel, and Playground side by side. Switching sections preserves the component tree, chat session, and editing state.
- **Agent configuration**: persona and greeting, model and voice, and capability toggles for Tool / Skill / Knowledge Base.
- **State machine**: `Draft` / `Saved` / `Published` is derived from three configuration snapshots in real time.
- **Playground**: streaming replies, tool-call cards, execution traces, and one-click scenario regression.
- **Save and publish**: `Cmd/Ctrl+S` save, changelog-driven publishing, and simulated failure paths.
- **Version management**: immutable publish history, field-level diff, and rollback to a previous version.
- **Evals-lite**: `ScenarioAssertion` checks real replies and traces instead of relying on hard-coded outcomes.
- **URL state layering**: sections live in the path while Playground/sidebar state lives in the query string, so refresh, sharing, and back/forward navigation all recover correctly.

## Tech Stack

- pnpm monorepo + Nuxt 4 (SSR) + Vue 3 + TypeScript
- Pinia + Pinia Colada
- shadcn-vue (Reka UI) + Tailwind CSS v4
- ai-elements-vue + vue-stream-markdown
- TanStack Vue Table v8 + vee-validate + @vee-validate/zod
- Zod + fast-deep-equal + nanoid + date-fns
- Nitro Server Routes (mock API)
- Biome

## Getting Started

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`. Other commands:

```bash
pnpm build      # production build
pnpm typecheck  # type-check the whole repository
pnpm lint       # run Biome checks
pnpm lint:fix   # run Biome checks and fix
```

## Project Structure

```text
apps/web/
  components/    presentation and interaction components (no direct $fetch)
  composables/   reusable client logic
  stores/        Pinia global state and three-snapshot state machine
  pages/         section route entry points
  server/api/    Nitro mock API
  lib/           base UI utilities
packages/
  agent-core/    pure TypeScript domain package (types, status, Evals, Zod schemas, diff)
  mock-engine/   mock data, test scenarios, and reply rule engine
```

## Core Architecture

- **Three-snapshot state machine**: `config` / `savedConfig` / `publishedConfig` are compared with `fast-deep-equal` to derive state.
- **Invariants**: `publishedConfig === publishHistory[last].config` and `version === publishHistory[last].version`.
- **State boundaries**: Pinia owns shared agent configuration and publishing state; message flow and traces live in `useMockChat`.
- **Request snapshots**: every Playground request sends the current `config` snapshot, and `mock-engine` replies from that snapshot instead of reading frontend global state.
- **Server boundary**: the frontend always uses `$fetch('/api/...')`; Nitro server routes provide structured responses and simulate failure paths.

## Demo Walkthrough

```text
1. Open /overview and inspect the current agent status, capability summary, and published diff
2. In the Playground, click the "Test Weather" scenario chip
3. Edit the System Prompt and watch the header status become Draft
4. Expand the assistant message's execution trace
5. Click "Run All Scenarios" and review the pass/fail summary
6. Save (or press Cmd/Ctrl+S) and watch the status become Saved
7. Click "Publish Update", add a changelog, and create a new version
8. Change the configuration again, then open /versions to inspect the field-level diff
9. Roll back to an earlier version and confirm the draft is loaded
10. Arm the failure demo, then save or publish to verify the Nitro 500 path
```

## Deployment and China Access

- Vercel auto-detects Nuxt: set Root Directory to `apps/web` and leave Build / Install / Output on auto-detect. Do not maintain a `vercel.json` in the repository.
- Default URL: `https://agent-factory-vert.vercel.app`
- China mirror: `https://agent-factory.jiawen.live`, using a DNS-only CNAME from Cloudflare to Vercel's China-optimized endpoint.

Reproduce it with:

```bash
vercel domains add agent-factory.jiawen.live agent-factory

curl -X POST "https://api.cloudflare.com/client/v4/zones/<zone_id>/dns_records" \
  -H "Authorization: Bearer <api_token>" -H "Content-Type: application/json" \
  -d '{"type":"CNAME","name":"agent-factory","content":"cname-china.vercel-dns.com","proxied":false}'

vercel domains verify agent-factory.jiawen.live
```

Keep Cloudflare proxying disabled (gray cloud / DNS only) so traffic goes directly to `cname-china.vercel-dns.com`. Enabling the orange cloud would route through Cloudflare and conflict with Vercel's certificate.

## Dependency Notes

- `esbuild` is pinned to `0.27.7` in `pnpm-workspace.yaml`: pnpm 11 drops platform-specific optional dependencies (`@esbuild/darwin-arm64`, etc.) while re-resolving the lockfile, which can cause Nitro to report `Host version 0.28.2 does not match binary version 0.27.7`. Pinning to `0.27.7` keeps a single esbuild version with complete platform dependencies.
- Local packages are consumed through workspace protocol; Nuxt declares them in `nuxt.config.ts` under `build.transpile`.
