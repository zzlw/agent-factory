import type { AgentConfig } from './types'

export interface ConfigFieldDiff {
  key: string
  label: string
  current: string | null
  previous: string | null
}

const textFields: Array<{ key: keyof AgentConfig; label: string }> = [
  { key: 'name', label: '名称' },
  { key: 'description', label: '用途描述' },
  { key: 'systemPrompt', label: 'System Prompt' },
  { key: 'firstMessage', label: 'First Message' },
  { key: 'model', label: '模型' },
]

function capabilitySummary(config: AgentConfig): string {
  return config.capabilities
    .map((item) => `${item.name}${item.enabled ? '（已启用）' : '（已关闭）'}`)
    .join('、')
}

export function diffAgentConfig(current: AgentConfig, previous: AgentConfig): ConfigFieldDiff[] {
  const diffs: ConfigFieldDiff[] = []

  for (const field of textFields) {
    const currentValue = String(current[field.key])
    const previousValue = String(previous[field.key])
    if (currentValue !== previousValue) {
      diffs.push({
        key: field.key,
        label: field.label,
        current: currentValue,
        previous: previousValue,
      })
    }
  }

  if (current.temperature !== previous.temperature) {
    diffs.push({
      key: 'temperature',
      label: 'Temperature',
      current: String(current.temperature),
      previous: String(previous.temperature),
    })
  }

  if (capabilitySummary(current) !== capabilitySummary(previous)) {
    diffs.push({
      key: 'capabilities',
      label: '能力',
      current: capabilitySummary(current),
      previous: capabilitySummary(previous),
    })
  }

  return diffs
}
