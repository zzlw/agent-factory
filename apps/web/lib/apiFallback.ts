export function isServerUnavailable(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return true
  }
  const statusCode = (error as { statusCode?: number }).statusCode
  // 静态托管（GitHub Pages）没有 Nitro Server，/api/... 会返回 404；
  // 网络错误时 statusCode 可能是 0 或 undefined。500 等业务错误不回落，保持失败可感知。
  return statusCode === 404 || statusCode === 0 || statusCode === undefined
}
