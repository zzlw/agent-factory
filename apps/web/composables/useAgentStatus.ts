import { useAgentStore } from '~/stores/agent'

export function useAgentStatus() {
  const agentStore = useAgentStore()

  return {
    status: computed(() => agentStore.status),
    hasUnsavedChanges: computed(() => agentStore.hasUnsavedChanges),
    hasUnpublishedChanges: computed(() => agentStore.hasUnpublishedChanges),
  }
}
