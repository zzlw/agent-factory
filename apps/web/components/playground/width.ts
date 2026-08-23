/** Playground 停靠栏与紧凑抽屉共用的宽度。改默认值只动这一处。 */
export const PLAYGROUND_DEFAULT_WIDTH = 384
export const PLAYGROUND_MIN_WIDTH = PLAYGROUND_DEFAULT_WIDTH
export const PLAYGROUND_MAX_WIDTH = 640

export function playgroundWidthStyle(width: number): string {
  return `--playground-width: ${width}px`
}
