<script setup lang="ts">
import { Palette } from 'lucide-vue-next'

const { activeTheme, themeColorOptions } = useThemeColor()
</script>

<template>
  <Select v-model="activeTheme">
    <SelectTrigger class="w-28 gap-1.5 text-xs [&_svg]:size-3.5" aria-label="切换主题色调">
      <Palette class="shrink-0 text-muted-foreground" />
      <SelectValue />
    </SelectTrigger>
    <SelectContent align="end">
      <SelectItem
        v-for="option in themeColorOptions"
        :key="option.id"
        :value="option.id"
        class="text-xs"
      >
        {{ option.label }}
      </SelectItem>
    </SelectContent>
  </Select>
</template>
