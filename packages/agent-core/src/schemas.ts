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
