import { Cpu, History, LayoutDashboard, UserRound, Wrench } from 'lucide-vue-next'
import type { Component } from 'vue'

export interface WorkbenchSection {
  id: string
  label: string
  icon: Component
}

export const SECTION_IDS = ['overview', 'persona', 'model', 'abilities', 'versions'] as const
export const DEFAULT_SECTION = SECTION_IDS[0]

/**
 * URL 状态分层（对齐 Dify / Linear 的惯例）：
 * - 分区 = path（/persona、/model...）：分区是"页面"语义，用 push 导航，支持浏览器后退；
 * - Playground 抽屉 / 侧栏折叠 = query（?playground=0|1、?sidebar=0）：视图状态语义，replace 更新不污染历史。
 *   未写 playground 时：桌面默认打开（停靠栏），紧凑视口默认关闭（避免进页就被抽屉盖住）。
 * 刷新、分享链接、前进后退均天然恢复。动态路由单页承载（pages/[section].vue），
 * 分区切换不卸载组件树，Playground 会话与编辑状态天然保留。
 */
export function useWorkbench() {
  const route = useRoute()
  const router = useRouter()
  const { isCompact } = useIsMobile()

  const sections: WorkbenchSection[] = [
    { id: 'overview', label: '概览', icon: LayoutDashboard },
    { id: 'persona', label: '人设与开场', icon: UserRound },
    { id: 'model', label: '模型与语音', icon: Cpu },
    { id: 'abilities', label: '能力', icon: Wrench },
    { id: 'versions', label: '版本', icon: History },
  ]

  const activeSection = computed<string>({
    get: () => {
      const section = String(route.params.section ?? '')
      return SECTION_IDS.includes(section as (typeof SECTION_IDS)[number])
        ? section
        : DEFAULT_SECTION
    },
    set: (id) => {
      // 分区是页面语义：push（可后退）；query 视图状态随行保留
      router.push({ params: { section: id }, query: route.query })
    },
  })

  const playgroundOpen = computed<boolean>({
    get: () => {
      const flag = route.query.playground
      if (flag === '0') return false
      if (flag === '1') return true
      return !isCompact.value
    },
    set: (open) => {
      router.replace({
        query: {
          ...route.query,
          playground: open ? (isCompact.value ? '1' : undefined) : '0',
        },
      })
    },
  })

  const sidebarOpen = computed<boolean>({
    get: () => route.query.sidebar !== '0',
    set: (open) => {
      router.replace({
        query: { ...route.query, sidebar: open ? undefined : '0' },
      })
    },
  })

  const activeSectionLabel = computed(
    () => sections.find((section) => section.id === activeSection.value)?.label ?? '',
  )

  return { activeSection, activeSectionLabel, sections, playgroundOpen, sidebarOpen }
}
