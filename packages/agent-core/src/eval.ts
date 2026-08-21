import type { AgentConfig, Message, TestScenario, TraceStep } from './types'

export interface ScenarioResult {
  scenarioId: string
  passed: boolean
  reasons: string[]
}

export function evaluateScenario(
  scenario: TestScenario,
  config: AgentConfig,
  reply: Message,
  trace: TraceStep[],
): ScenarioResult {
  const reasons: string[] = []
  const assertion = scenario.assertion

  if (assertion.requiresCapability) {
    const capability = config.capabilities.find(
      (item) => item.name === assertion.requiresCapability,
    )
    const enabled = capability?.enabled === true
    if (!enabled) {
      reasons.push(`缺少已启用能力：${assertion.requiresCapability}`)
    }
  }

  if (assertion.mustCallTool) {
    const toolCalled =
      reply.toolCall?.name === assertion.mustCallTool ||
      trace.some(
        (step) =>
          step.type === 'toolCall' &&
          `${step.title}${step.detail}`.includes(assertion.mustCallTool ?? ''),
      )
    if (!toolCalled) {
      reasons.push(`未调用工具：${assertion.mustCallTool}`)
    }
  }

  if (assertion.replyContains && !reply.content.includes(assertion.replyContains)) {
    reasons.push(`回复未包含关键词：${assertion.replyContains}`)
  }

  return {
    scenarioId: scenario.id,
    passed: reasons.length === 0,
    reasons,
  }
}
