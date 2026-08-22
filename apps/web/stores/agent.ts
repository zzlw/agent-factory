import {
  type AgentConfig,
  type AgentSnapshot,
  deriveStatus,
  hasUnpublishedChanges,
  hasUnsavedChanges,
  validateAgentConfig,
} from '@agent-factory/agent-core'
import {
  initialAgentConfig,
  initialPublishHistory,
  initialVersion,
} from '@agent-factory/mock-engine'
import { defineStore } from 'pinia'
import { toRaw } from 'vue'

function clone<T>(value: T): T {
  // structuredClone 无法克隆嵌套的响应式 Proxy（例如 updateConfig 里展开配置时泄漏的
  // capabilities 数组代理），JSON 序列化会穿透代理读出原始数据，再解析得到纯对象。
  return JSON.parse(JSON.stringify(toRaw(value))) as T
}

function errorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const data = (error as { data?: unknown }).data
    if (typeof data === 'object' && data !== null && 'message' in data) {
      const message = (data as { message?: unknown }).message
      if (typeof message === 'string' && message.trim()) {
        return message
      }
    }
  }
  return fallback
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
    enabledCapabilityCount: (state) =>
      state.config.capabilities.filter((item) => item.enabled).length,
  },
  actions: {
    updateConfig(patch: Partial<AgentConfig>) {
      this.config = { ...this.config, ...patch }
    },
    async saveAgent() {
      const validation = validateAgentConfig(this.config)
      if (!validation.ok) {
        this.error = validation.message
        return
      }
      this.saving = true
      this.error = null
      try {
        await $fetch('/api/agent/save' as string & {}, {
          method: 'POST',
          body: clone(this.config),
        })
        this.savedConfig = clone(this.config)
        this.lastSavedAt = new Date().toISOString()
      } catch (error) {
        this.error = errorMessage(error, '保存失败，请重试')
      } finally {
        this.saving = false
      }
    },
    async publishAgent(changelog?: string) {
      const nextConfig = clone(this.config)
      const validation = validateAgentConfig(nextConfig)
      if (!validation.ok) {
        this.error = validation.message
        return
      }
      this.publishing = true
      this.error = null
      try {
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
      } catch (error) {
        this.error = errorMessage(error, '发布失败，请重试')
      } finally {
        this.publishing = false
      }
    },
    rollbackToVersion(snapshot: AgentSnapshot) {
      this.config = clone(snapshot.config)
    },
  },
})
