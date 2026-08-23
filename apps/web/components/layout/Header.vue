<script setup lang="ts">
import { Github, Moon, MoreHorizontal, Palette, Sun } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const agentStore = useAgentStore()
const { activeSectionLabel } = useWorkbench()
const { isMobile } = useIsMobile()
const { activeTheme, themeColorOptions } = useThemeColor()
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')
const GITHUB_REPO_URL = 'https://github.com/zzlw/agent-factory'

function toggleColorMode() {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}

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
    class="sticky top-0 z-10 flex h-(--header-height) min-w-0 shrink-0 items-center gap-2 border-b bg-background px-3 sm:gap-3 sm:px-4 md:px-6"
  >
    <SidebarTrigger class="shrink-0" />
    <Separator orientation="vertical" class="!h-4 shrink-0" />
    <Breadcrumb class="hidden min-w-0 md:flex">
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
    <span class="min-w-0 truncate text-sm font-medium md:hidden">
      {{ activeSectionLabel }}
    </span>
    <Badge class="shrink-0" :variant="statusVariant">
      {{ statusLabel }} · v{{ agentStore.version }}
    </Badge>
    <div class="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
      <div class="hidden items-center gap-2 lg:flex">
        <Button
          variant="outline"
          size="sm"
          :disabled="agentStore.saving"
          @click="agentStore.saveAgent()"
        >
          {{ agentStore.saving ? '保存中' : '保存' }}
        </Button>
        <Button size="sm" :disabled="agentStore.publishing" @click="publishOpen = true">
          {{ agentStore.publishing ? '发布中' : publishLabel }}
        </Button>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="ghost" size="icon" class="size-8 lg:hidden" aria-label="更多操作">
            <MoreHorizontal class="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-48">
          <DropdownMenuItem :disabled="agentStore.saving" @click="agentStore.saveAgent()">
            保存
          </DropdownMenuItem>
          <DropdownMenuItem :disabled="agentStore.publishing" @click="publishOpen = true">
            {{ agentStore.publishing ? '发布中' : '发布' }}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger class="gap-2">
              <Palette class="size-4" />
              主题色调
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup v-model="activeTheme">
                <DropdownMenuRadioItem
                  v-for="option in themeColorOptions"
                  :key="option.id"
                  :value="option.id"
                >
                  {{ option.label }}
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem @click="toggleColorMode">
            <Moon v-if="isDark" class="size-4" />
            <Sun v-else class="size-4" />
            {{ isDark ? '切换浅色' : '切换深色' }}
          </DropdownMenuItem>
          <DropdownMenuItem as-child>
            <a :href="GITHUB_REPO_URL" target="_blank" rel="noopener noreferrer">
              <Github class="size-4" />
              GitHub 仓库
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog v-if="!isMobile" v-model:open="publishOpen">
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
      <Drawer v-else v-model:open="publishOpen">
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>发布当前配置</DrawerTitle>
            <DrawerDescription>
              将保存并发布当前配置，生成新版本 v{{ agentStore.version + 1 }}。
            </DrawerDescription>
          </DrawerHeader>
          <div class="grid gap-2 px-4">
            <Label for="publish-changelog-mobile">发布说明（可选）</Label>
            <Textarea
              id="publish-changelog-mobile"
              v-model="changelog"
              placeholder="例如：启用天气查询能力"
              rows="3"
            />
          </div>
          <DrawerFooter>
            <Button variant="outline" @click="publishOpen = false">取消</Button>
            <Button :disabled="agentStore.publishing" @click="confirmPublish">
              {{ agentStore.publishing ? '发布中' : '确认发布' }}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      <div class="hidden items-center gap-2 lg:flex">
        <ThemeColorSelector />
        <ThemeModeToggle />
      </div>
      <Button
        as-child
        variant="ghost"
        size="icon"
        class="hidden size-8 text-muted-foreground hover:text-foreground active:scale-[0.98] lg:inline-flex"
      >
        <a
          :href="GITHUB_REPO_URL"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub 仓库"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" class="size-4">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.11-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.88-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
          </svg>
        </a>
      </Button>
    </div>
  </header>
</template>
