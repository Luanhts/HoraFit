export const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

if (!API_URL) {
  console.warn("Atenção: NEXT_PUBLIC_API_URL não está definida no arquivo .env");
}

export function getApiUrl() {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL não está configurada.");
  }

  return API_URL;
}
