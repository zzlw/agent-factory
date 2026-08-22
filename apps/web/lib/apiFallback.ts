export function isServerUnavailable(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return true
  }
  const statusCode = (error as { statusCode?: number }).statusCode
  // 纯静态托管没有 Nitro Server，/api/... 会返回 404；
  // 网络错误时 statusCode 可能是 0 或 undefined。500 等业务错误不回落。
  return statusCode === 404 || statusCode === 0 || statusCode === undefined
}
