import {
  initialAgentConfig,
  initialPublishHistory,
  initialVersion,
} from '@agent-factory/mock-engine'

export default defineEventHandler(() => {
  return {
    config: structuredClone(initialAgentConfig),
    publishHistory: structuredClone(initialPublishHistory),
    version: initialVersion,
  }
})
