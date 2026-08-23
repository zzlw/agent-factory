# AGENTS.md

This file constrains the style, boundaries, and implementation approach for AI-generated code. The goal is not to limit creativity, but to reduce “AI flavor” and keep the project feeling like a long-term, real-world product.

## Project Context

- Project: Agent Factory workbench
- Stack: pnpm monorepo + Nuxt 4 + Vue 3 + TypeScript + Pinia + Pinia Colada + shadcn-vue + Tailwind CSS + TanStack Vue Table + Zod + @vueuse/core + @vueuse/motion + fast-deep-equal + nanoid + date-fns + Nitro Server Routes + Biome
- Core capabilities: agent configuration, capability management, Playground, Trace, state machine, version publishing, and rollback
- Delivery cadence: implement in layers L1 → L2 → L3 → L4

## Directory Responsibilities

- `apps/web/pages/`: route entry points that only compose components; no complex business logic
- `apps/web/components/`: presentation and interaction components; do not call `$fetch` directly
- `apps/web/composables/`: reusable client logic such as `useAgentStatus` and `useMockChat`
- `apps/web/stores/`: global state and state machines, such as agent configuration and publish history
- `apps/web/server/api/`: Nitro server routes for the mock API and future real backend proxying
- `packages/agent-core/`: pure TypeScript domain package for types, status derivation, Evals assertions, and Zod schemas
- `packages/mock-engine/`: mock data, test scenarios, and reply rule engine
- `apps/web/lib/`: base UI utilities such as `cn()` and Tailwind helpers

## Naming

Use product language rather than generic names:

```ts
// Prefer
saveAgent()
publishAgent()
rollbackToVersion()
AgentSnapshot
Capability
publishHistory

// Avoid
handleClick()
dataList
Item
process()
```

File names should match directory semantics. Components use `PascalCase`, composables use `useXxx`, and server routes follow Nuxt conventions.

## TypeScript Constraints

- Enable strict mode and avoid `any`
- Keep domain types in `packages/agent-core/src/types.ts`
- Keep request and form schemas in `packages/agent-core/src/schemas.ts`, shared by vee-validate and Nitro server routes
- Declare return types on functions where reasonable
- Avoid meaningless generics
- Do not create abstractions for single-use cases

## State Boundaries

Pinia stores only cross-component Agent state:

- `config`
- `savedConfig`
- `publishedConfig`
- `publishHistory`
- `version`
- save/publish loading and error state

Message flow and Trace are managed by `useMockChat`, not Pinia, to avoid mixed state sources.
Pinia Colada only handles server request caching and mutation loading; once results enter Pinia, Pinia becomes the single source of truth for editing state.

The state machine must preserve these invariants:

- `publishedConfig === publishHistory[last].config`
- `version === publishHistory[last].version`

## Mock and API

- The frontend always uses `$fetch('/api/...')`
- Server routes read request bodies and return structured responses
- `replyEngine` in `packages/mock-engine` replies from the `config` snapshot in the request body; it must not read frontend global state
- Do not introduce MSW as a runtime mock

## Code Quality

- Use Biome as the only formatter and linter; do not introduce Prettier or ESLint
- Maintain `biome.json` at the repository root and run `biome check --write .` before committing
- Enable import sorting and `useSortedClasses` to keep Tailwind classes ordered
- Do not generate meaningless comments, `any`, magic numbers, magic strings, or unused dependencies

## Component Guidelines

- Components only present UI and handle user input; they do not encode business rules
- Prefer Tailwind and shadcn-vue tokens over arbitrary utility-class piles
- Avoid creating too many subcomponents for a single scenario
- Use semantic variable names and provide both text and visual feedback for status
- Keep animations short and restrained with `@vueuse/motion` or Vue `<Transition>`, and respect `prefers-reduced-motion`
- Use Reka UI `ScrollArea` for scroll containers instead of hand-written scrollbar CSS
- Prefer mature open-source libraries for generic capabilities such as deep equality, IDs, time, and scrollbars; only hand-write product-specific logic

## AI Flavor Blocklist

Do not generate:

- Comments that merely restate the code
- Unjustified `TODO` or `FIXME`
- Functions declared `async` without asynchronous work
- `any` or `unknown` used to bypass types
- Magic numbers and magic strings
- Single-use abstraction layers
- Redundant `try/catch/finally` unless resource cleanup or known error handling is needed
- Sample copy unrelated to the product
- Multiple unused dependencies introduced at once

## Commits and Review

- Commit by feature layer, for example `feat: L1 core loop`
- Each commit contains exactly one understandable change
- After generation, check for:
  - Dead code
  - Responsibilities that belong in a different file
  - Names that map directly to product concepts
  - Dependencies not needed at this time
  - Duplicated logic

## Implementation Order

Prioritize the core loop:

1. Types and mock data
2. Pinia state machine
3. Three-pane layout and configuration panels
4. Plain-text Playground conversation
5. Status badges and save/publish
6. Trace, version diff, rollback, and one-click regression

Verify each layer before moving to the next.
