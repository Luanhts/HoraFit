export const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  console.warn("Atenção: NEXT_PUBLIC_API_URL não está definida no arquivo .env");
}