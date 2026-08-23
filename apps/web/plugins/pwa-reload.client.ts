import { toast } from 'vue-sonner'

export default defineNuxtPlugin(() => {
  const { $pwa } = useNuxtApp()

  watch(
    () => $pwa?.needRefresh,
    (needRefresh) => {
      if (!needRefresh) {
        return
      }
      toast.info('发现新版本', {
        description: '刷新以加载最新工作台',
        duration: Number.POSITIVE_INFINITY,
        action: {
          label: '刷新',
          onClick: () => {
            void $pwa?.updateServiceWorker(true)
          },
        },
      })
    },
  )
})
