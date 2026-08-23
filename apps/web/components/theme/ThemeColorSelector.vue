<script setup lang="ts">
import { Palette } from 'lucide-vue-next'

const { activeTheme, themeColorOptions } = useThemeColor()

const activeThemeLabel = computed(
  () => themeColorOptions.find((option) => option.id === activeTheme.value)?.label ?? '默认',
)
</script>

<template>
  <Select v-model="activeTheme">
    <SelectTrigger
      class="size-8 justify-center gap-1.5 px-0 text-xs lg:h-8 lg:w-28 lg:justify-between lg:px-2 [&_svg]:size-3.5 [&>svg:last-of-type]:hidden lg:[&>svg:last-of-type]:block"
      aria-label="切换主题色调"
    >
      <Palette class="shrink-0 text-muted-foreground" />
      <span class="hidden lg:inline">{{ activeThemeLabel }}</span>
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
