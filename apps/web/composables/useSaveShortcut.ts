export function useSaveShortcut() {
  const agentStore = useAgentStore()

  function onKeydown(event: KeyboardEvent) {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
      event.preventDefault()
      void agentStore.saveAgent()
    }
  }

  function onBeforeUnload(event: BeforeUnloadEvent) {
    if (agentStore.hasUnsavedChanges) {
      event.preventDefault()
      event.returnValue = ''
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', onKeydown)
    window.addEventListener('beforeunload', onBeforeUnload)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('keydown', onKeydown)
    window.removeEventListener('beforeunload', onBeforeUnload)
  })
}
