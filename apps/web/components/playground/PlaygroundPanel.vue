<script setup lang="ts">
import type { PromptInputMessage } from '~/components/ai-elements/prompt-input/types'
import { PanelRightClose, PanelRightOpen, RotateCcw } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { playgroundOpen } = useWorkbench()
const { messages, traceByMessage, sending, configChanged, sendMessage, resetSession } = useMockChat()

// PromptInput 的 submit 回调：输入清空/失败恢复由组件内部管理
async function handleSubmit({ text }: PromptInputMessage) {
  await sendMessage(text)
}

// Playground 宽度与抽屉开合同一真源（URL query ?pw=）：刷新/分享/前进后退均恢复，
// 不依赖 localStorage（内嵌 webview 可能不可用）。默认宽度不写入 query 保持 URL 干净。
const DEFAULT_WIDTH = 384
// 最小宽度即默认宽度：不允许拖到默认值以下，面板只向“更宽”方向调整
const MIN_WIDTH = DEFAULT_WIDTH
const MAX_WIDTH = 640

function clampWidth(value: number) {
  return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.round(value)))
}

const queryWidth = computed(() => {
  const raw = Number(route.query.pw)
  return Number.isFinite(raw) ? clampWidth(raw) : DEFAULT_WIDTH
})

const playgroundWidth = ref(queryWidth.value)
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
    playgroundWidth.value = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, delta))
  }
  const onUp = () => {
    if (dragging) {
      resizing.value = false
      document.body.style.cursor = ''
      // 拖拽结束才写 URL（拖拽中逐帧 replace 太重），replace 不污染历史栈
      const width = playgroundWidth.value
      router.replace({
        query: { ...route.query, pw: width === DEFAULT_WIDTH ? undefined : String(width) },
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
  <!-- 抽屉动画与左侧菜单同机制：单一容器宽度过渡 + 内容层 opacity；拖拽期间关闭过渡保证跟手 -->
  <aside
    class="relative flex min-h-0 shrink-0 flex-col overflow-hidden border-l bg-card/50"
    :class="[
      playgroundOpen ? '' : 'w-10',
      resizing ? '' : 'transition-[width] duration-200 ease-linear',
    ]"
    :style="playgroundOpen ? { width: `${playgroundWidth}px` } : undefined"
  >
    <!-- 展开态内容：宽度跟随面板实时宽度，防过渡期重排；min-h-0 锁死高度链，让滚动收敛在消息区内 -->
    <div
      class="flex min-h-0 flex-1 flex-col transition-opacity duration-200 ease-linear"
      :class="playgroundOpen ? 'opacity-100' : 'pointer-events-none opacity-0'"
      :style="playgroundOpen ? { width: `${playgroundWidth}px` } : undefined"
    >
      <div class="border-b p-4">
        <div class="mb-3 flex items-start justify-between gap-2">
          <div>
            <h2 class="text-sm font-semibold">Playground</h2>
            <p class="text-xs text-muted-foreground">实时调试 · 随配置更新</p>
          </div>
          <div class="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              class="h-7 gap-1 px-2 text-xs"
              @click="resetSession"
            >
              <RotateCcw class="size-3.5" />
              重置会话
            </Button>
            <Button
              variant="ghost"
              size="icon"
              class="size-7"
              title="收起调试面板"
              @click="playgroundOpen = false"
            >
              <PanelRightClose class="size-4" />
            </Button>
          </div>
        </div>
        <ConfigSummary />
        <p v-if="configChanged" class="mt-2 text-xs text-destructive">配置已变更，建议重置会话</p>
      </div>

      <!-- 消息流：StickToBottom 自动吸底；absolute inset-0 使高度只取决于定位祖先，不参与 flex 内容高度计算，彻底阻断“消息撑开面板”的整页滚动路径 -->
      <div class="relative min-h-0 flex-1">
        <Conversation class="absolute inset-0">
          <ConversationContent class="gap-4 p-3">
            <ChatMessage
              v-for="message in messages"
              :key="message.id"
              :message="message"
              :trace="traceByMessage[message.id]"
            />
            <div v-if="sending" class="flex items-center gap-2 text-[13px] text-muted-foreground">
              <Loader :size="14" />
              正在生成...
            </div>
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      </div>

      <!-- 输入区：PromptInput 体系（Enter 提交含中文输入法保护、提交自动清空、失败恢复草稿） -->
      <div class="border-t p-3">
        <PromptInput @submit="handleSubmit">
          <!-- 不套 PromptInputBody（display:contents 容器）：InputGroup 的 flex-col 布局靠直接子元素 data-align 检测触发，多包一层会退化成横排 -->
          <PromptInputTextarea placeholder="输入消息测试当前配置" />
          <PromptInputFooter>
            <span class="text-[13px] text-muted-foreground">Enter 发送 · Shift+Enter 换行</span>
            <PromptInputSubmit :disabled="sending" />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>

    <!-- 可拖拽分隔条：系统原生 col-resize 光标，hover / 拖拽中分界线高亮（ResizeHandle 共享组件） -->
    <ResizeHandle
      v-if="playgroundOpen"
      mode="resize"
      :active="resizing"
      @resize-start="onResizeStart"
    />

    <!-- 收起态窄竖轨：覆盖在容器左侧，展开时淡出 -->
    <div
      class="absolute inset-y-0 left-0 flex w-10 flex-col items-center transition-opacity duration-200 ease-linear"
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
