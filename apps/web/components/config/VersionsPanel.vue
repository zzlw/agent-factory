<script setup lang="ts">
import type { AgentSnapshot } from '@agent-factory/agent-core'
import { RotateCcw } from 'lucide-vue-next'

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

    <Card>
      <CardHeader>
        <CardTitle>发布历史</CardTitle>
        <CardDescription>版本记录来自不可变快照，回滚会把历史配置载入草稿。</CardDescription>
      </CardHeader>
      <CardContent class="space-y-2">
        <div
          v-for="snapshot in history"
          :key="snapshot.version"
          class="flex items-start justify-between gap-4 rounded-md border p-3"
        >
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <Badge variant="default">v{{ snapshot.version }}</Badge>
              <span v-if="snapshot.version === currentVersion" class="text-xs text-muted-foreground">
                线上版本
              </span>
            </div>
            <p v-if="snapshot.changelog" class="mt-1 text-sm text-muted-foreground">
              {{ snapshot.changelog }}
            </p>
            <p class="mt-1 text-xs text-muted-foreground">
              发布：{{ formatTime(snapshot.publishedAt) }}
            </p>
          </div>

          <AlertDialog v-if="snapshot.version !== currentVersion" v-model:open="rollbackOpen">
            <AlertDialogTrigger as-child>
              <Button variant="outline" size="sm" @click="pendingRollback = snapshot">
                <RotateCcw class="size-4" />
                回滚到此版本
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>回滚到 v{{ snapshot.version }}？</AlertDialogTitle>
                <AlertDialogDescription>
                  该操作会把 v{{ snapshot.version }} 的配置载入当前草稿，需再次保存 / 发布才会生效。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction @click="confirmRollback">确认回滚</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
