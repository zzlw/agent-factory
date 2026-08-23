/** Tailwind `md` is min-width: 768px. JS must use max-width: 767px to avoid the 768 off-by-one. */
export const MOBILE_BREAKPOINT = 768
/** Tailwind `lg` is min-width: 1024px. Below this, the 3-pane workbench cannot keep both rails in flow. */
export const COMPACT_BREAKPOINT = 1024

function useMatchMaxWidth(maxWidth: number) {
  const matches = ref(false)

  if (import.meta.client) {
    const mediaQuery = window.matchMedia(`(max-width: ${maxWidth}px)`)

    function sync() {
      matches.value = mediaQuery.matches
    }

    // 等 mount 再同步：首屏与 SSR 保持同一棵树，避免 Reka id / Dialog↔Drawer / 侧栏分叉
    onMounted(() => {
      sync()
      mediaQuery.addEventListener('change', sync)
    })
    onBeforeUnmount(() => {
      mediaQuery.removeEventListener('change', sync)
    })
  }

  return matches
}

export function useIsMobile() {
  const isMobile = useMatchMaxWidth(MOBILE_BREAKPOINT - 1)
  const isCompact = useMatchMaxWidth(COMPACT_BREAKPOINT - 1)
  return { isMobile, isCompact }
}
