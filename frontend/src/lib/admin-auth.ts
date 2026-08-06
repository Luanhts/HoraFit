export const ADMIN_COOKIE = 'admin_session';

export async function getAdminSessionValue(password: string) {
  const data = new TextEncoder().encode(`horafit-admin:${password}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}
