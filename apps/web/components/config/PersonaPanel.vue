<script setup lang="ts">
const agentStore = useAgentStore()
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>人设与开场</CardTitle>
      <CardDescription>定义 Agent 的身份、开场方式与行为边界。</CardDescription>
    </CardHeader>
    <CardContent class="grid gap-6 @2xl:grid-cols-2">
      <div class="space-y-2">
        <Label for="agent-name">名称</Label>
        <Input id="agent-name" v-model="agentStore.config.name" aria-label="Agent 名称" />
      </div>

      <div class="space-y-2">
        <Label for="agent-description">用途描述</Label>
        <Textarea
          id="agent-description"
          v-model="agentStore.config.description"
          rows="3"
        />
      </div>

      <div class="space-y-2 @2xl:col-span-2">
        <Label for="system-prompt">System Prompt</Label>
        <Textarea
          id="system-prompt"
          v-model="agentStore.config.systemPrompt"
          rows="10"
          class="font-mono"
        />
      </div>

      <div class="space-y-2 @2xl:col-span-2">
        <Label for="first-message">First Message</Label>
        <Textarea
          id="first-message"
          v-model="agentStore.config.firstMessage"
          rows="5"
        />
      </div>
    </CardContent>
  </Card>
</template>
