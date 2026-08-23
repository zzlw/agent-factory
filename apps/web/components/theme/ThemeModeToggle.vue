<script setup lang="ts">
import { Moon, Sun } from 'lucide-vue-next'

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

function toggleColorMode() {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}
</script>

<template>
  <Button
    variant="ghost"
    size="icon"
    class="size-8"
    aria-label="切换明暗模式"
    @click="toggleColorMode"
  >
    <Sun class="size-4 dark:hidden" />
    <Moon class="hidden size-4 dark:block" />
  </Button>
</template>
