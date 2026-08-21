<script setup lang="ts">
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
const publishLabel = computed(() =>
  agentStore.hasUnpublishedChanges ? '发布更新' : '发布',
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
      <Button size="sm" :disabled="agentStore.publishing" @click="agentStore.publishAgent()">
        {{ agentStore.publishing ? '发布中' : publishLabel }}
      </Button>
    </div>
  </header>
</template>
