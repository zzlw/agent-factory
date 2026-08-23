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

export const THEME_COLOR_COOKIE = 'active_theme'
export const THEME_CLASS_PREFIX = 'theme-'

const CUSTOM_THEME_IDS = THEME_COLOR_OPTIONS.map((option) => option.id).filter(
  (id) => id !== 'default',
)

export function isCustomTheme(value: string | null | undefined): value is ThemeColorName {
  return CUSTOM_THEME_IDS.includes(value as ThemeColorName)
}

/** 首屏阻塞脚本：在首次绘制前把 cookie 里的色调写到 <html>，避免先闪默认色。 */
export const THEME_COLOR_BOOTSTRAP_SCRIPT = `(function(){try{var m=document.cookie.match(/(?:^|; )${THEME_COLOR_COOKIE}=([^;]*)/);if(!m)return;var t=decodeURIComponent(m[1]);try{t=JSON.parse(t)}catch(e){}if(${JSON.stringify(CUSTOM_THEME_IDS)}.indexOf(t)<0)return;document.documentElement.classList.add("${THEME_CLASS_PREFIX}"+t)}catch(e){}})()`

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
    if (isCustomTheme(activeTheme.value)) {
      root.classList.add(`${THEME_CLASS_PREFIX}${activeTheme.value}`)
    }
  }

  applyThemeClass()
  watch(activeTheme, applyThemeClass)

  return {
    activeTheme,
    themeColorOptions: THEME_COLOR_OPTIONS,
  }
}
