import {
  deriveStatus,
  hasUnpublishedChanges,
  hasUnsavedChanges,
  type AgentConfig,
  type AgentSnapshot,
} from '@agent-factory/agent-core'
import {
  initialAgentConfig,
  initialPublishHistory,
  initialVersion,
} from '@agent-factory/mock-engine'
import { defineStore } from 'pinia'
import { toRaw } from 'vue'

function clone<T>(value: T): T {
  return structuredClone(toRaw(value))
}

export const useAgentStore = defineStore('agent', {
  state: () => ({
    config: clone(initialAgentConfig),
    savedConfig: clone(initialAgentConfig),
    publishedConfig: clone(initialAgentConfig) as AgentConfig | null,
    publishHistory: clone(initialPublishHistory),
    version: initialVersion,
    saving: false,
    publishing: false,
    error: null as string | null,
    lastSavedAt: '2026-08-20T09:00:00.000Z',
    lastPublishedAt: '2026-08-20T09:10:00.000Z',
  }),
  getters: {
    status: (state) => deriveStatus(state.config, state.savedConfig, state.publishedConfig),
    hasUnsavedChanges: (state) => hasUnsavedChanges(state.config, state.savedConfig),
    hasUnpublishedChanges: (state) =>
      hasUnpublishedChanges(state.savedConfig, state.publishedConfig),
    enabledCapabilityCount: (state) => state.config.capabilities.filter((item) => item.enabled).length,
  },
  actions: {
    updateConfig(patch: Partial<AgentConfig>) {
      this.config = { ...this.config, ...patch }
    },
    async saveAgent() {
      this.saving = true
      this.error = null
      try {
        await $fetch('/api/agent/save' as string & {}, {
          method: 'POST',
          body: clone(this.config),
        })
        this.savedConfig = clone(this.config)
        this.lastSavedAt = new Date().toISOString()
      } catch {
        this.error = '保存失败，请重试'
      } finally {
        this.saving = false
      }
    },
    async publishAgent(changelog?: string) {
      this.publishing = true
      this.error = null
      try {
        const nextConfig = clone(this.config)
        await $fetch('/api/agent/publish' as string & {}, {
          method: 'POST',
          body: { config: nextConfig, changelog },
        })
        this.publishedConfig = nextConfig
        this.savedConfig = nextConfig
        this.version += 1
        const now = new Date().toISOString()
        this.lastPublishedAt = now
        this.lastSavedAt = now
        this.publishHistory.push({
          config: nextConfig,
          savedAt: now,
          publishedAt: now,
          version: this.version,
          changelog,
        })
      } catch {
        this.error = '发布失败，请重试'
      } finally {
        this.publishing = false
      }
    },
    rollbackToVersion(snapshot: AgentSnapshot) {
      this.config = clone(snapshot.config)
    },
  },
})
