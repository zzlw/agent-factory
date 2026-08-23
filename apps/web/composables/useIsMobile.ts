export function useIsMobile() {
  const isMobile = ref(false)
  let mediaQuery: MediaQueryList | null = null

  function syncMobileState() {
    if (!mediaQuery) {
      mediaQuery = window.matchMedia('(max-width: 768px)')
    }
    isMobile.value = mediaQuery.matches
  }

  onMounted(() => {
    syncMobileState()
    mediaQuery?.addEventListener('change', syncMobileState)
  })

  onBeforeUnmount(() => {
    mediaQuery?.removeEventListener('change', syncMobileState)
  })

  return { isMobile }
}
