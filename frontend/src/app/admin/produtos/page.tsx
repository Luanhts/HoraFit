import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { API_URL } from "@/lib/api";
import { Produto } from "@/types/produto";

async function getProdutos(): Promise<Produto[]> {
  try {
    const res = await fetch(`${API_URL}/products`, {
      cache: 'no-store' // Para garantir que pegue dados novos do seu NestJS
    });

    if (!res.ok) throw new Error('Erro ao buscar dados');
    
    return res.json();
  } catch (error) {
    console.error("Erro na requisição:", error);
    return []; // Retorna lista vazia se o backend estiver fora do ar
  }
}

export default async function ProdutosPage() {
  const produtos = await getProdutos();

  return (
    <div className="space-y-6">
      {/* Cabeçalho com o Rosa da Marca */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Produtos</h1>
          <p className="text-muted-foreground">Gerencie seu catálogo de produtos</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white gap-2 cursor-pointer">
          <Plus className="h-4 w-4" /> Adicionar Novo Produto
        </Button>
      </div>

      {/* Container da Tabela Estilizado */}
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
                    src={produto.imageUrl || '/placeholder-image.png'} 
                    alt={produto.name} 
                    className="h-12 w-12 rounded-lg object-cover border" 
                  />
                </TableCell>
                <TableCell className="font-medium">
                  <div>
                    {produto.name}
                    <div className="text-[10px] text-muted-foreground">{produto.category.name}</div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{produto.sku}</TableCell>
                <TableCell>
                  <span className={produto.stock <= 5 ? "text-orange-600 font-bold" : ""}>
                    {produto.stock}
                  </span>
                </TableCell>
                <TableCell className="font-bold">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(produto.price))}
                </TableCell>
                <TableCell>
                  <Badge className={
                    produto.active 
                    ? "bg-primary/20 text-primary hover:bg-primary/30" 
                    : "bg-secondary/20 text-secondary hover:bg-secondary/30"
                  }>
                    {produto.active ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                      <Edit className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
