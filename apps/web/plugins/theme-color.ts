import {
  isCustomTheme,
  THEME_CLASS_PREFIX,
  THEME_COLOR_BOOTSTRAP_SCRIPT,
} from '~/composables/useThemeColor'

export default defineNuxtPlugin(() => {
  const { activeTheme } = useThemeColor()
  const themeClass = isCustomTheme(activeTheme.value)
    ? `${THEME_CLASS_PREFIX}${activeTheme.value}`
    : undefined

  useHead({
    htmlAttrs: themeClass ? { class: themeClass } : {},
    script: [
      {
        key: 'theme-color-bootstrap',
        innerHTML: THEME_COLOR_BOOTSTRAP_SCRIPT,
        tagPosition: 'head',
      },
    ],
  })
})
