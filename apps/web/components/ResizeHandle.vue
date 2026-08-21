<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

/**
 * 分隔线交互热区：手势用系统原生 cursor（col-resize 的左右双箭头），
 * hover 时分界线染主色高亮（带过渡动画），active 常亮（拖拽中）。
 * mode：resize = 可拖拽（resizeStart 事件）；toggle = 点击切换（click 透传）。
 */
const props = withDefaults(defineProps<{
  mode?: 'resize' | 'toggle'
  active?: boolean
  class?: HTMLAttributes['class']
}>(), {
  mode: 'toggle',
  active: false,
})

const emit = defineEmits<{
  (e: 'resizeStart', event: PointerEvent): void
}>()

function onPointerDown(e: PointerEvent) {
  if (props.mode === 'resize') {
    emit('resizeStart', e)
  }
}
</script>

<template>
  <div
    :class="cn(
      // w-4（16px）热区：与侧栏 SidebarGroup 的 p-2（8px）对齐，三角光标区恰好铺到菜单按钮边缘，
      // 避免“手型 ↔ 三角”之间出现闪烁的中间地带；折叠态 icon 按钮距线 4px，重叠的 4px 边缘由分界线接管（可接受）
      'group/resizer absolute inset-y-0 left-0 z-20 w-4 -translate-x-1/2 cursor-col-resize',
      props.class,
    )"
    @pointerdown="onPointerDown"
  >
    <!-- 高亮线：骑在分界线上，默认透明，hover 染主色（200ms 过渡）；拖拽中常亮 -->
    <span
      :class="cn(
        'absolute inset-y-0 left-1/2 w-px -translate-x-1/2 transition-colors duration-200',
        props.active ? 'bg-primary/60' : 'bg-primary/0 group-hover/resizer:bg-primary/50',
      )"
    />
  </div>
</template>
