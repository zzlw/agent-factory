<script setup lang="ts">
import type { AgentSnapshot } from '@agent-factory/agent-core'
import {
  createColumnHelper,
  FlexRender,
  getCoreRowModel,
  getSortedRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import { RotateCcw } from 'lucide-vue-next'
import { h } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const agentStore = useAgentStore()

const pendingRollback = ref<AgentSnapshot | null>(null)
const rollbackOpen = computed({
  get: () => pendingRollback.value !== null,
  set: (open) => {
    if (!open) {
      pendingRollback.value = null
    }
  },
})

const history = computed(() => [...agentStore.publishHistory].reverse())
const currentVersion = computed(
  () =>
    agentStore.publishHistory[agentStore.publishHistory.length - 1]?.version ?? agentStore.version,
)

const columnHelper = createColumnHelper<AgentSnapshot>()

const columns = [
  columnHelper.accessor('version', {
    header: '版本',
    cell: (info) => h(Badge, { variant: 'default' }, { default: () => `v${info.getValue()}` }),
  }),
  columnHelper.accessor('changelog', {
    header: '发布说明',
    cell: (info) => info.getValue() ?? '—',
  }),
  columnHelper.accessor('publishedAt', {
    header: '发布时间',
    cell: (info) => formatTime(info.getValue()),
  }),
  columnHelper.display({
    id: 'actions',
    header: '',
    cell: (info) => {
      const snapshot = info.row.original
      if (snapshot.version === currentVersion.value) {
        return h('span', { class: 'text-xs text-muted-foreground' }, '线上版本')
      }
      return h(
        Button,
        {
          variant: 'outline',
          size: 'sm',
          onClick: () => {
            pendingRollback.value = snapshot
          },
        },
        { default: () => [h(RotateCcw, { class: 'size-4' }), '回滚到此版本'] },
      )
    },
  }),
]

const table = useVueTable({
  get data() {
    return history.value
  },
  columns,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  initialState: { sorting: [{ id: 'version', desc: true }] },
})

function confirmRollback() {
  if (pendingRollback.value) {
    agentStore.rollbackToVersion(pendingRollback.value)
  }
  pendingRollback.value = null
}

function formatTime(iso: string | null): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Shanghai',
  }).format(new Date(iso))
}
</script>

<template>
  <div class="grid gap-6">
    <Card>
      <CardHeader>
        <CardTitle>当前配置与线上版本</CardTitle>
        <CardDescription>
          对比当前编辑配置与最近发布版本（v{{ currentVersion }}）。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DiffView
          :current="agentStore.config"
          :previous="agentStore.publishedConfig ?? agentStore.config"
        />
      </CardContent>
    </Card>

    <Card class="py-4">
      <CardHeader>
        <CardTitle>发布历史</CardTitle>
        <CardDescription>版本记录来自不可变快照，回滚会把历史配置载入草稿。</CardDescription>
      </CardHeader>
      <CardContent>
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b text-left text-muted-foreground">
              <th
                v-for="header in table.getHeaderGroups()[0]?.headers"
                :key="header.id"
                class="px-3 py-2 font-medium"
              >
                <FlexRender
                  :render="header.column.columnDef.header"
                  :props="header.getContext()"
                />
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
      </CardContent>
    </Card>

    <AlertDialog v-model:open="rollbackOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>回滚到 v{{ pendingRollback?.version }}？</AlertDialogTitle>
          <AlertDialogDescription>
            该操作会把 v{{ pendingRollback?.version }} 的配置载入当前草稿，需再次保存 / 发布才会生效。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction @click="confirmRollback">确认回滚</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
