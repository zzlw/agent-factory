export type ThemeColorName =
  | 'default'
  | 'blue'
  | 'green'
  | 'amber'
  | 'violet'
  | 'rose'
  | 'teal'
  | 'orange'
  | 'mono'

export interface ThemeColorOption {
  id: ThemeColorName
  label: string
}

export const THEME_COLOR_OPTIONS: ThemeColorOption[] = [
  { id: 'default', label: '默认' },
  { id: 'blue', label: '蓝色' },
  { id: 'green', label: '绿色' },
  { id: 'amber', label: '琥珀' },
  { id: 'violet', label: '紫罗兰' },
  { id: 'rose', label: '玫瑰' },
  { id: 'teal', label: '青色' },
  { id: 'orange', label: '橙色' },
  { id: 'mono', label: '单色' },
]

const THEME_COLOR_COOKIE = 'active_theme'
const THEME_CLASS_PREFIX = 'theme-'

export function useThemeColor() {
  const activeTheme = useCookie<ThemeColorName>(THEME_COLOR_COOKIE, {
    default: () => 'default',
    maxAge: 31536000,
  })

  function applyThemeClass() {
    if (import.meta.server) {
      return
    }
    const root = document.documentElement
    for (const option of THEME_COLOR_OPTIONS) {
      root.classList.remove(`${THEME_CLASS_PREFIX}${option.id}`)
    }
    if (activeTheme.value !== 'default') {
      root.classList.add(`${THEME_CLASS_PREFIX}${activeTheme.value}`)
    }
  }

  onMounted(applyThemeClass)
  watch(activeTheme, applyThemeClass)

  return {
    activeTheme,
    themeColorOptions: THEME_COLOR_OPTIONS,
  }
}
