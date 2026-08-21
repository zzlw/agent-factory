let mockFailNext = false

export function armMockFail(): void {
  mockFailNext = true
}

export function consumeMockFail(): boolean {
  const shouldFail = mockFailNext
  mockFailNext = false
  return shouldFail
}
