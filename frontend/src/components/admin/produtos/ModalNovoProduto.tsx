"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import FormProdutos, { ProdutoSchema } from "./FormProdutos";
import { Category, Produto } from "@/types/produto";
import { API_URL } from "@/lib/api";

type Props = {
  open: boolean;
  onClose: () => void;
  // Chamado com o produto criado para que o pai atualize a lista sem recarregar a página
  onSuccess: (novoProduto: Produto) => void;
  categories: Category[];
};

export default function ModalNovoProduto({
  open,
  onClose,
  onSuccess,
  categories,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  if (!open) return null;

  // Esta função é chamada pelo FormProdutos somente depois que o Zod valida os dados.
  // Aqui é onde a lógica de rede vive — separada da lógica de UI do formulário.
  async function handleCreate(data: ProdutoSchema) {
    setIsLoading(true);
    setApiError(null);

    try {
      const res = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        // O backend lança BadRequestException com mensagem específica (ex: SKU duplicado)
        setApiError(body?.message ?? "Erro ao criar produto. Tente novamente.");
        return;
      }

      const novoProduto: Produto = await res.json();
      onSuccess(novoProduto);
      onClose();
    } catch {
      setApiError("Não foi possível conectar ao servidor.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Adicionar Novo Produto
          </h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full cursor-pointer"
            aria-label="Fechar"
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Corpo scrollável */}
        <div className="flex-1 overflow-y-auto p-6">
          <FormProdutos
            formId="form-create"
            onSubmit={handleCreate}
            categories={categories}
          />
        </div>

        {/* Mensagem de erro da API (ex: SKU duplicado) */}
        {apiError && (
          <div className="mx-6 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">{apiError}</p>
          </div>
        )}

        {/* Rodapé */}
        <div className="p-6 border-t bg-gray-50 rounded-b-xl grid grid-cols-2 gap-4">
          <Button
            variant="secondaryBtn"
            onClick={onClose}
            disabled={isLoading}
            className="w-full py-6 text-base font-medium cursor-pointer"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="form-create"
            disabled={isLoading}
            className="w-full py-6 text-base font-medium bg-primary cursor-pointer"
          >
            {isLoading ? "Salvando..." : "Adicionar Produto"}
          </Button>
        </div>
      </div>
    </div>
  );
}
