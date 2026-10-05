// A API é acessada por Server Components e Route Handlers. Em produção, prefira
// API_URL para não expor o endereço interno do backend ao navegador. Mantemos a
// variável NEXT_PUBLIC_API_URL como compatibilidade para ambientes já existentes.
export const API_URL = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL)?.replace(/\/$/, "");

export function getApiUrl() {
  if (!API_URL) {
    throw new Error("API_URL não está configurada.");
  }

  return API_URL;
}
