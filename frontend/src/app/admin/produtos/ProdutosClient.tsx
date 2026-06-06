"use client";

import React, { useState } from "react";
import ModalNovoProduto from "@/components/admin/produtos/ModalNovoProduto";
import ModalEditProduto from "@/components/admin/produtos/ModalEditProduto";
import DialogRemoverProduto from "@/components/admin/produtos/DialogRemoverProduto";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Category, Produto } from "@/types/produto";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { API_URL } from "@/lib/api";
import DialogEditProducts from "@/components/admin/produtos/DialogEditProducts";
import { set } from "zod";

type Props = {
  initialProdutos: Produto[];
  // Categorias vêm do servidor, evitando um fetch extra no cliente
  categories: Category[];
};

export default function ProdutosClient({ initialProdutos, categories }: Props) {
  const [produtos, setProdutos] = useState<Produto[]>(initialProdutos);
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // Adiciona o produto criado no topo da lista sem precisar recarregar a página
  function handleCreateSuccess(novoProduto: Produto) {
    setProdutos((prev) => [novoProduto, ...prev]);
  }

  // Substitui o produto editado na lista pelo dado mais recente do servidor
  function handleUpdateSuccess(produtoAtualizado: Produto) {
    setProdutos((prev) =>
      prev.map((p) => (p.id === produtoAtualizado.id ? produtoAtualizado : p))
    );
  }

  function handleOpenEdit(produto: Produto) {
    setSelectedProduto(produto);
    setIsEditModalOpen(true);
  }

  function handleCloseEdit() {
    setIsEditModalOpen(false);
    setIsEditDialogOpen(false);
    setSelectedProduto(null);
  }

  function handleOpenDelete(produto: Produto) {
    setSelectedProduto(produto);
    setIsDeleteDialogOpen(true);
  }

  function handleCloseDelete() {
    setIsDeleteDialogOpen(false);
    setSelectedProduto(null);
  }

  async function handleRemove(id?: string | number) {
    if (id == null) return handleCloseDelete();
    setIsRemoving(true);

    try {
      const res = await fetch(`${API_URL ?? ""}/products/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Falha ao remover produto:", text);
        alert("Erro ao remover produto.");
        return;
      }

      setProdutos((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      alert("Erro ao remover produto.");
    } finally {
      setIsRemoving(false);
      handleCloseDelete();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Produtos</h1>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-primary text-white gap-2 cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Adicionar Novo Produto
        </Button>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-6">Todos os Produtos</h2>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Imagem</TableHead>
              <TableHead>Nome do Produto</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Estoque</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {produtos.map((produto) => (
              <TableRow key={produto.id}>
                <TableCell>
                  <img
                    src={produto.imageUrl || "/placeholder-image.png"}
                    alt={produto.name}
                    className="h-12 w-12 rounded-lg object-cover border"
                  />
                </TableCell>
                <TableCell className="font-medium">
                  <div>
                    {produto.name}
                    <div className="text-[10px] text-muted-foreground">
                      {produto.category.name}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{produto.sku}</TableCell>
                <TableCell>
                  <span className={produto.stock <= 5 ? "text-orange-600 font-bold" : ""}>
                    {produto.stock}
                  </span>
                </TableCell>
                <TableCell className="font-bold">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(Number(produto.price))}
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      produto.active
                        ? "bg-primary/20 text-primary hover:bg-primary/30"
                        : "bg-secondary/20 text-secondary hover:bg-secondary/30"
                    }
                  >
                    {produto.active ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={() => handleOpenEdit(produto)}
                      variant="edit"
                      size="icon"
                      className="h-8 w-8 cursor-pointer"
                    >
                      <Edit className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button
                      onClick={() => handleOpenDelete(produto)}
                      variant="remove"
                      size="icon"
                      className="h-8 w-8 cursor-pointer text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ModalNovoProduto
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
        categories={categories}
      />

      <ModalEditProduto
        open={isEditModalOpen}
        onClose={handleCloseEdit}
        produto={selectedProduto}
        onSuccess={handleUpdateSuccess}
        categories={categories}
      />

      <DialogRemoverProduto
        open={isDeleteDialogOpen}
        onClose={handleCloseDelete}
        productName={selectedProduto?.name}
        onConfirm={async () => await handleRemove(selectedProduto?.id)}
      />
    </div>
  );
}
