"use server";

import { API_URL } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function criarProdutoAction(data: any) {
  const response = await fetch(`${API_URL}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    return { error: "Falha ao criar produto no servidor." };
  }

  // Limpa o cache da listagem para mostrar o novo produto
  revalidatePath("/admin/produtos");
  redirect("/admin/produtos");
}