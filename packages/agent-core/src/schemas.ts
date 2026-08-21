import { z } from 'zod'

export const capabilityTypeSchema = z.enum(['tool', 'skill', 'knowledgeBase'])

export const capabilitySchema = z.object({
  id: z.string().min(1),
  type: capabilityTypeSchema,
  name: z.string().min(1),
  description: z.string(),
  enabled: z.boolean(),
  integration: z.enum(['mcp', 'builtin', 'custom']),
})

export const agentConfigSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  systemPrompt: z.string(),
  firstMessage: z.string(),
  model: z.string().min(1),
  temperature: z.number().min(0).max(2),
  voice: z.object({
    name: z.string(),
    enabled: z.boolean(),
  }),
  capabilities: z.array(capabilitySchema),
})

export type AgentConfigValidation = { ok: true } | { ok: false; message: string }

export function validateAgentConfig(config: unknown): AgentConfigValidation {
  const result = agentConfigSchema.safeParse(config)
  if (result.success) {
    return { ok: true }
  }
  const message = result.error.issues
    .map((issue) => `${issue.path.join('.') || 'config'}: ${issue.message}`)
    .join('；')
  return { ok: false, message }
}
