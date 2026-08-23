<script setup lang="ts">
import { testScenarios } from '@agent-factory/mock-engine'
import { PanelRightClose, PanelRightOpen, RotateCcw, Square } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import type { PromptInputMessage } from '~/components/ai-elements/prompt-input/types'
import {
  PLAYGROUND_DEFAULT_WIDTH,
  PLAYGROUND_MAX_WIDTH,
  PLAYGROUND_MIN_WIDTH,
  playgroundWidthStyle,
} from './width'

const route = useRoute()
const router = useRouter()
const { playgroundOpen } = useWorkbench()
const { isCompact } = useIsMobile()
const {
  messages,
  traceByMessage,
  sending,
  streaming,
  configChanged,
  sendMessage,
  resetSession,
  stopStream,
} = useMockChat()
const { results, running, completed, runAll } = useEvals()

// PromptInput 的 submit 回调：输入清空/失败恢复由组件内部管理
async function handleSubmit({ text }: PromptInputMessage) {
  await sendMessage(text)
}

function runScenario(input: string) {
  void sendMessage(input)
}

// Playground 宽度与抽屉开合同一真源（URL query ?pw=）：刷新/分享/前进后退均恢复，
// 不依赖 localStorage（内嵌 webview 可能不可用）。默认宽度不写入 query 保持 URL 干净。
function clampWidth(value: number) {
  return Math.min(PLAYGROUND_MAX_WIDTH, Math.max(PLAYGROUND_MIN_WIDTH, Math.round(value)))
}

const queryWidth = computed(() => {
  const raw = Number(route.query.pw)
  return Number.isFinite(raw) ? clampWidth(raw) : PLAYGROUND_DEFAULT_WIDTH
})

const playgroundWidth = ref(queryWidth.value)
const overlayOpen = computed(() => isCompact.value && playgroundOpen.value)
const panelStyle = computed(() => playgroundWidthStyle(playgroundWidth.value))
// 浏览器前进/后退或手动改 URL 时同步宽度（分区切换等 query 不变的导航不会触发）
watch(queryWidth, (width) => {
  if (width !== playgroundWidth.value) {
    playgroundWidth.value = width
  }
})

const resizing = ref(false)

// 拖拽阈值：位移超过 3px 才认定为拖拽，纯点击（含触控板点击的微小抖动）不产生任何效果
const DRAG_THRESHOLD = 3

function onResizeStart(e: PointerEvent) {
  e.preventDefault()
  const startX = e.clientX
  const startWidth = playgroundWidth.value
  let dragging = false
  const onMove = (ev: PointerEvent) => {
    const delta = startWidth - (ev.clientX - startX)
    if (!dragging) {
      if (Math.abs(ev.clientX - startX) < DRAG_THRESHOLD) {
        return
      }
      dragging = true
      resizing.value = true
      // 拖拽确认后全局锁定 col-resize 光标，鼠标移出热区也不变回箭头
      document.body.style.cursor = 'col-resize'
    }
    // 面板贴右缘：鼠标右移 → 宽度收窄
    playgroundWidth.value = clampWidth(delta)
  }
  const onUp = () => {
    if (dragging) {
      resizing.value = false
      document.body.style.cursor = ''
      // 拖拽结束才写 URL（拖拽中逐帧 replace 太重），replace 不污染历史栈
      const width = playgroundWidth.value
      router.replace({
        query: {
          ...route.query,
          pw: width === PLAYGROUND_DEFAULT_WIDTH ? undefined : String(width),
        },
      })
    }
    document.removeEventListener('pointermove', onMove)
    document.removeEventListener('pointerup', onUp)
  }
  document.addEventListener('pointermove', onMove)
  document.addEventListener('pointerup', onUp)
}
</script>

<template>
  <!-- 收起态 FAB 必须在 aside 外：aside 关闭时离开文档流，放里面会一起消失 -->
  <Transition
    enter-active-class="transition-opacity duration-200 ease-out"
    enter-from-class="opacity-0"
    leave-active-class="transition-opacity duration-150 ease-in"
    leave-to-class="opacity-0"
  >
    <Button
      v-if="!playgroundOpen"
      variant="default"
      size="icon"
      class="fixed right-4 bottom-4 z-50 size-12 rounded-full shadow-lg lg:hidden [bottom:max(1rem,env(safe-area-inset-bottom))]"
      aria-label="打开 Playground"
      @click="playgroundOpen = true"
    >
      <PanelRightOpen class="size-5" />
    </Button>
  </Transition>

  <Transition
    enter-active-class="transition-opacity duration-300 ease-out"
    enter-from-class="opacity-0"
    leave-active-class="transition-opacity duration-200 ease-in"
    leave-to-class="opacity-0"
  >
    <div
      v-if="overlayOpen"
      class="fixed inset-0 z-40 bg-black/40"
      aria-hidden="true"
      @click="playgroundOpen = false"
    />
  </Transition>

  <!-- 紧凑抽屉用 translate，不用 v-show / hidden：display:none 会掐断离场动画 -->
  <aside
    :class="cn(
      'flex min-h-0 shrink-0 flex-col overflow-hidden border-l bg-background',
      'max-lg:fixed max-lg:inset-y-0 max-lg:right-0 max-lg:z-50 max-lg:h-svh max-lg:w-(--playground-width) max-lg:max-w-[85vw] max-lg:shadow-lg',
      'max-md:inset-0 max-md:w-full max-md:max-w-none max-md:shadow-none',
      'max-lg:transition-transform motion-reduce:max-lg:transition-none',
      playgroundOpen
        ? 'max-lg:translate-x-0 max-lg:duration-300 max-lg:ease-out lg:relative lg:w-(--playground-width)'
        : 'max-lg:pointer-events-none max-lg:translate-x-full max-lg:duration-200 max-lg:ease-in lg:relative lg:w-10',
      resizing ? '' : 'lg:transition-[width] duration-200 ease-linear',
    )"
    :style="panelStyle"
    :role="overlayOpen ? 'dialog' : undefined"
    :aria-modal="overlayOpen ? true : undefined"
    :aria-hidden="isCompact && !playgroundOpen ? true : undefined"
    :aria-label="overlayOpen ? 'Playground' : undefined"
  >
    <!-- 展开态内容：宽度跟随面板实时宽度，防过渡期重排；min-h-0 锁死高度链，让滚动收敛在消息区内 -->
    <div
      class="flex h-full min-h-0 flex-1 flex-col transition-opacity duration-200 ease-linear"
      :class="playgroundOpen ? 'opacity-100' : 'pointer-events-none opacity-0'"
    >
      <div class="shrink-0 overflow-y-auto border-b p-4 max-lg:max-h-[45%]">
        <div class="mb-3 flex items-start justify-between gap-2">
          <div class="min-w-0">
            <h2 class="text-sm font-semibold">Playground</h2>
            <p class="hidden text-xs text-muted-foreground sm:block">实时调试 · 随配置更新</p>
          </div>
          <div class="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              class="h-7 gap-1 px-2 text-xs"
              @click="resetSession"
            >
              <RotateCcw class="size-3.5" />
              <span class="hidden sm:inline">重置会话</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              class="size-7 shrink-0"
              title="收起调试面板"
              @click="playgroundOpen = false"
            >
              <PanelRightClose class="size-4" />
            </Button>
          </div>
        </div>
        <ConfigSummary />
        <div
          v-if="configChanged"
          role="status"
          class="mt-2 flex items-center justify-between gap-2 rounded-md border bg-muted px-2 py-1.5"
        >
          <p class="text-xs text-muted-foreground">配置已变更，建议重置会话</p>
          <Button
            variant="ghost"
            size="sm"
            class="h-6 shrink-0 px-2 text-xs"
            @click="resetSession"
          >
            重置会话
          </Button>
        </div>
        <div class="mt-3 space-y-2">
          <div class="flex flex-wrap items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              class="h-7 px-2 text-xs"
              :disabled="running || sending"
              @click="runAll"
            >
              运行全部场景
            </Button>
            <Badge v-if="completed" variant="outline">
              {{ results.filter((item) => item.passed).length }}/{{ results.length }} 通过
            </Badge>
          </div>
          <div class="flex flex-wrap gap-1.5">
            <Button
              v-for="scenario in testScenarios"
              :key="scenario.id"
              variant="ghost"
              size="sm"
              class="h-7 px-2 text-xs"
              @click="runScenario(scenario.input)"
            >
              {{ scenario.label }}
            </Button>
          </div>
        </div>
      </div>

      <!-- 消息流：StickToBottom 自动吸底；absolute inset-0 使高度只取决于定位祖先，不参与 flex 内容高度计算，彻底阻断“消息撑开面板”的整页滚动路径 -->
      <div class="relative min-h-0 flex-1">
        <Conversation class="absolute inset-0">
          <ConversationContent class="gap-2 p-3">
            <ChatMessage
              v-for="message in messages"
              :key="message.id"
              :message="message"
              :trace="traceByMessage[message.id]"
            />
            <div v-if="sending || streaming" class="flex items-center gap-2 text-[13px] text-muted-foreground">
              <Loader :size="14" />
              正在生成...
              <Button
                v-if="streaming"
                variant="ghost"
                size="icon"
                class="size-6"
                title="停止生成"
                @click="stopStream"
              >
                <Square class="size-3.5" />
              </Button>
            </div>
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      </div>

      <!-- 输入区：PromptInput 体系（Enter 提交含中文输入法保护、提交自动清空、失败恢复草稿） -->
      <div class="shrink-0 border-t p-3">
        <PromptInput @submit="handleSubmit">
          <!-- 不套 PromptInputBody（display:contents 容器）：InputGroup 的 flex-col 布局靠直接子元素 data-align 检测触发，多包一层会退化成横排 -->
          <PromptInputTextarea placeholder="输入消息测试当前配置" />
          <PromptInputFooter>
            <span class="hidden text-[13px] text-muted-foreground sm:inline">
              Enter 发送 · Shift+Enter 换行
            </span>
            <PromptInputSubmit class="ml-auto" :disabled="sending || streaming" />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>

    <!-- 可拖拽分隔条：系统原生 col-resize 光标，hover / 拖拽中分界线高亮（ResizeHandle 共享组件） -->
    <ResizeHandle
      v-if="playgroundOpen"
      class="hidden lg:block"
      mode="resize"
      :active="resizing"
      @resize-start="onResizeStart"
    />

    <!-- 收起态窄竖轨：覆盖在容器左侧，展开时淡出；仅桌面停靠态使用 -->
    <div
      class="absolute inset-y-0 left-0 hidden w-10 flex-col items-center transition-opacity duration-200 ease-linear lg:flex"
      :class="playgroundOpen ? 'pointer-events-none opacity-0' : 'opacity-100'"
    >
      <Button
        variant="ghost"
        size="icon"
        class="my-2 size-7"
        title="展开调试面板"
        @click="playgroundOpen = true"
      >
        <PanelRightOpen class="size-4" />
      </Button>
      <p class="mt-3 text-[10px] tracking-widest text-muted-foreground [writing-mode:vertical-rl]">
        Playground
      </p>
    </div>
    </aside>
</template>
