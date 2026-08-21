import type { ScenarioResult } from '@agent-factory/agent-core'
import { evaluateScenario } from '@agent-factory/agent-core'
import { buildMockReply, testScenarios } from '@agent-factory/mock-engine'

export interface EvalsState {
  results: ScenarioResult[]
  running: boolean
  completed: boolean
}

export function useEvals() {
  const agentStore = useAgentStore()
  const results = ref<ScenarioResult[]>([])
  const running = ref(false)
  const completed = ref(false)

  async function runAll(): Promise<void> {
    if (running.value) {
      return
    }
    running.value = true
    completed.value = false
    results.value = []

    for (const scenario of testScenarios) {
      const reply = buildMockReply(scenario.input, agentStore.config)
      const result = reply.messages.some((message) => message.role === 'assistant')
        ? evaluateScenario(scenario, agentStore.config, reply.messages, reply.trace)
        : {
            scenarioId: scenario.id,
            passed: false,
            reasons: ['Mock 引擎未返回助手回复'],
          }
      results.value.push(result)
    }

    running.value = false
    completed.value = true
  }

  return {
    results,
    running,
    completed,
    runAll,
  }
}
