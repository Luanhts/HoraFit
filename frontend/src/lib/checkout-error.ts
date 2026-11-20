const fallbackMessage = 'Não foi possível finalizar o pedido.';

export function getCheckoutErrorMessages(body: unknown): string[] {
  if (typeof body !== 'object' || body === null) return [fallbackMessage];

  if ('errors' in body && Array.isArray(body.errors)) {
    const details = body.errors
      .filter(
        (issue): issue is { message: string } =>
          typeof issue === 'object' &&
          issue !== null &&
          'message' in issue &&
          typeof issue.message === 'string' &&
          issue.message.trim().length > 0,
      )
      .map((issue) => issue.message.trim())
      .slice(0, 5);

    if (details.length > 0) return details;
  }

  if ('message' in body && typeof body.message === 'string' && body.message.trim()) {
    return [body.message.trim()];
  }

  return [fallbackMessage];
}
