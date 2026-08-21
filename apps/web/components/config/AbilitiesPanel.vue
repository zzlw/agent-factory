<script setup lang="ts">
import type { Capability, CapabilityType } from '@agent-factory/agent-core'
import {
  createColumnHelper,
  FlexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import { ArrowDown, ArrowUp, ArrowUpDown, BookOpen, Puzzle, Wrench } from 'lucide-vue-next'
import { h } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'

const agentStore = useAgentStore()

const typeLabels: Record<CapabilityType, string> = {
  tool: 'Tool',
  skill: 'Skill',
  knowledgeBase: 'Knowledge Base',
}

const typeIcons = {
  tool: Wrench,
  skill: Puzzle,
  knowledgeBase: BookOpen,
}

const integrationLabels = {
  mcp: 'MCP',
  builtin: '内置',
  custom: '自定义',
} as const

const search = ref('')
const capabilities = computed(() => agentStore.config.capabilities)

const columnHelper = createColumnHelper<Capability>()

const columns = [
  columnHelper.accessor('name', {
    header: '名称',
    cell: (info) => {
      const capability = info.row.original
      return h('div', { class: 'flex items-center gap-2' }, [
        h('span', { class: 'flex size-7 items-center justify-center rounded-md bg-muted' }, [
          h(typeIcons[capability.type], { class: 'size-4' }),
        ]),
        h('span', { class: 'text-sm font-medium' }, capability.name),
      ])
    },
  }),
  columnHelper.accessor('type', {
    header: '类型',
    cell: (info) => typeLabels[info.getValue()],
  }),
  columnHelper.accessor('description', {
    header: '描述',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('integration', {
    header: '接入',
    cell: (info) => {
      const integration = info.getValue()
      if (integration === 'mcp') {
        return h(Badge, { variant: 'outline' }, { default: () => 'MCP' })
      }
      return integrationLabels[integration]
    },
  }),
  columnHelper.display({
    id: 'enabled',
    header: '启用',
    cell: (info) =>
      h(Switch, {
        modelValue: info.row.original.enabled,
        'onUpdate:modelValue': (enabled: boolean) =>
          setCapabilityEnabled(info.row.original.id, enabled),
        'aria-label': '启用开关',
      }),
  }),
]

const table = useVueTable({
  get data() {
    return capabilities.value
  },
  columns,
  state: {
    get globalFilter() {
      return search.value
    },
  },
  onGlobalFilterChange: (updater) => {
    search.value = typeof updater === 'function' ? updater(search.value) : updater
  },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  initialState: { pagination: { pageSize: 5 } },
})

function setCapabilityEnabled(id: string, enabled: boolean) {
  agentStore.updateConfig({
    capabilities: agentStore.config.capabilities.map((item) =>
      item.id === id ? { ...item, enabled } : item,
    ),
  })
}
</script>

<template>
  <div class="grid gap-6">
    <div class="flex items-center justify-between gap-3">
      <div>
        <h2 class="text-lg font-semibold">能力</h2>
        <p class="text-sm text-muted-foreground">
          管理 Agent 可调用的 Tool、Skill 与 Knowledge Base。
        </p>
      </div>
      <Input v-model="search" class="w-56" placeholder="搜索能力" />
    </div>

    <Card class="py-4">
      <CardContent>
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b text-left text-muted-foreground">
              <th
                v-for="header in table.getHeaderGroups()[0]?.headers"
                :key="header.id"
                class="px-3 py-2 font-medium"
              >
                <button
                  class="inline-flex items-center gap-1"
                  :class="header.column.getCanSort() ? 'cursor-pointer' : 'cursor-default'"
                  @click="header.column.getToggleSortingHandler()?.({})"
                >
                  <FlexRender
                    :render="header.column.columnDef.header"
                    :props="header.getContext()"
                  />
                  <ArrowUpDown
                    v-if="header.column.getCanSort() && header.column.getIsSorted() === false"
                    class="size-3"
                  />
                  <ArrowUp v-else-if="header.column.getIsSorted() === 'asc'" class="size-3" />
                  <ArrowDown v-else-if="header.column.getIsSorted() === 'desc'" class="size-3" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in table.getRowModel().rows"
              :key="row.id"
              class="border-b last:border-b-0"
            >
              <td v-for="cell in row.getVisibleCells()" :key="cell.id" class="px-3 py-2">
                <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
              </td>
            </tr>
          </tbody>
        </table>

        <Empty v-if="table.getRowModel().rows.length === 0" class="py-10">
          <EmptyHeader>
            <EmptyTitle>没有匹配的能力</EmptyTitle>
            <EmptyDescription>尝试更换关键词，或清空搜索查看全部能力。</EmptyDescription>
          </EmptyHeader>
        </Empty>

        <div
          v-if="table.getRowModel().rows.length > 0"
          class="mt-3 flex items-center justify-between text-sm text-muted-foreground"
        >
          <span>共 {{ table.getFilteredRowModel().rows.length }} 项</span>
          <div class="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              :disabled="!table.getCanPreviousPage()"
              @click="table.previousPage()"
            >
              上一页
            </Button>
            <span>
              第 {{ table.getState().pagination.pageIndex + 1 }} / {{ table.getPageCount() }} 页
            </span>
            <Button
              variant="outline"
              size="sm"
              :disabled="!table.getCanNextPage()"
              @click="table.nextPage()"
            >
              下一页
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
