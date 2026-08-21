import equal from 'fast-deep-equal'

import type { AgentConfig, AgentStatus } from './types'

export function hasUnsavedChanges(config: AgentConfig, savedConfig: AgentConfig): boolean {
  return !equal(config, savedConfig)
}

export function hasUnpublishedChanges(
  savedConfig: AgentConfig,
  publishedConfig: AgentConfig | null,
): boolean {
  if (!publishedConfig) {
    return true
  }
  return !equal(savedConfig, publishedConfig)
}

export function deriveStatus(
  config: AgentConfig,
  savedConfig: AgentConfig,
  publishedConfig: AgentConfig | null,
): AgentStatus {
  if (hasUnsavedChanges(config, savedConfig)) {
    return 'draft'
  }
  if (hasUnpublishedChanges(savedConfig, publishedConfig)) {
    return 'saved'
  }
  return 'published'
}
