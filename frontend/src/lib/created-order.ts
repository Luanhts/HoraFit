export function getCreatedOrderId(status: number, body: unknown): number | null {
  if (status !== 201 || typeof body !== 'object' || body === null || !('id' in body)) {
    return null;
  }

  const id = body.id;
  return typeof id === 'number' && Number.isSafeInteger(id) && id > 0 ? id : null;
}
