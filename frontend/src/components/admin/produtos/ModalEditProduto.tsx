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
  // O produto a ser editado. Null quando o modal está fechado.
  produto: Produto | null;
  // Chamado com o produto atualizado para que o pai atualize a lista
  onSuccess: (produtoAtualizado: Produto) => void;
  categories: Category[];
};

export default function ModalEditProduto({
  open,
  onClose,
  produto,
  onSuccess,
  categories,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Não renderiza nada se o modal estiver fechado ou se não houver produto selecionado
  if (!open || !produto) return null;

  async function handleUpdate(data: ProdutoSchema) {
    if (!produto) return;
    setIsLoading(true);
    setApiError(null);

    try {
      const res = await fetch(`${API_URL}/products/${produto.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setApiError(body?.message ?? "Erro ao atualizar produto. Tente novamente.");
        return;
      }

      const produtoAtualizado: Produto = await res.json();
      onSuccess(produtoAtualizado);
      onClose();
    } catch {
      setApiError("Não foi possível conectar ao servidor.");
    } finally {
      setIsLoading(false);
    }
  }

  // Chave única baseada no id do produto garante que o formulário seja
  // recriado do zero quando um produto diferente é selecionado para edição,
  // evitando que defaultValues de um produto anterior persistam.
  const formKey = `form-edit-${produto.id}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">

        {/* Cabeçalho */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Editar Produto</h2>
            <p className="text-sm text-muted-foreground">{produto.name}</p>
          </div>
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
          {/* key={formKey} é o truque: ao trocar de produto, o React desmonta e
              remonta o FormProdutos, resetando o formulário com os novos defaultValues */}
          <FormProdutos
            key={formKey}
            formId={formKey}
            onSubmit={handleUpdate}
            initialData={produto}
            categories={categories}
          />
        </div>

        {/* Mensagem de erro da API */}
        {apiError && (
          <div className="mx-6 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">{apiError}</p>
          </div>
        )}

        {/* Rodapé */}
        <div className="p-6 border-t bg-gray-50 rounded-b-xl grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-full py-6 text-base font-medium cursor-pointer"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form={formKey}
            disabled={isLoading}
            className="w-full py-6 text-base font-medium bg-primary cursor-pointer"
          >
            {isLoading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>

      </div>
    </div>
  );
}
