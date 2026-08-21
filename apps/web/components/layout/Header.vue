<script setup lang="ts">
import { toast } from 'vue-sonner'

const agentStore = useAgentStore()
const { activeSectionLabel } = useWorkbench()

const statusLabel = computed(() => {
  if (agentStore.status === 'draft') return '草稿'
  if (agentStore.status === 'saved') return '已保存'
  return '已发布'
})

const statusVariant = computed(() => {
  if (agentStore.status === 'draft') return 'outline'
  if (agentStore.status === 'saved') return 'secondary'
  return 'default'
})

// 发布按钮文案即状态指示器（Dify 惯例）：有未发布变更时切换为“发布更新”
const publishLabel = computed(() => (agentStore.hasUnpublishedChanges ? '发布更新' : '发布'))

const publishOpen = ref(false)
const changelog = ref('')

async function confirmPublish() {
  await agentStore.publishAgent(changelog.value.trim() || undefined)
  if (!agentStore.error) {
    changelog.value = ''
    publishOpen.value = false
  }
}

async function armFailure() {
  await $fetch('/api/agent/fail' as string & {}, {
    method: 'POST',
    body: { enabled: true },
  })
  toast.info('已武装失败演示', {
    description: '下一次保存或发布将返回 500',
  })
}

watch(
  () => agentStore.error,
  (message) => {
    if (message) {
      toast.error(message)
    }
  },
)
</script>

<template>
  <header
    class="sticky top-0 z-10 flex h-(--header-height) shrink-0 items-center gap-3 border-b bg-background px-4 md:px-6"
  >
    <SidebarTrigger />
    <Separator orientation="vertical" class="!h-4" />
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <Input
            v-model="agentStore.config.name"
            class="h-7 field-sizing-content min-w-10 max-w-64 border-transparent bg-transparent px-2 text-sm font-medium shadow-none hover:border-input focus-visible:border-input"
            aria-label="Agent 名称"
          />
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{{ activeSectionLabel }}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
    <Badge :variant="statusVariant">
      {{ statusLabel }} · v{{ agentStore.version }}
    </Badge>
    <div class="ml-auto flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        :disabled="agentStore.saving"
        @click="agentStore.saveAgent()"
      >
        {{ agentStore.saving ? '保存中' : '保存' }}
      </Button>
      <Button variant="ghost" size="sm" title="模拟下一次保存/发布失败" @click="armFailure">
        失败演示
      </Button>
      <Dialog v-model:open="publishOpen">
        <DialogTrigger as-child>
          <Button size="sm" :disabled="agentStore.publishing">
            {{ agentStore.publishing ? '发布中' : publishLabel }}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>发布当前配置</DialogTitle>
            <DialogDescription>
              将保存并发布当前配置，生成新版本 v{{ agentStore.version + 1 }}。
            </DialogDescription>
          </DialogHeader>
          <div class="grid gap-2">
            <Label for="publish-changelog">发布说明（可选）</Label>
            <Textarea
              id="publish-changelog"
              v-model="changelog"
              placeholder="例如：启用天气查询能力"
              rows="3"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" @click="publishOpen = false">取消</Button>
            <Button :disabled="agentStore.publishing" @click="confirmPublish">
              {{ agentStore.publishing ? '发布中' : '确认发布' }}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </header>
</template>
