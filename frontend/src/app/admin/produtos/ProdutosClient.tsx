"use client";
import React, { useState } from "react";
import ModalNovoProduto from "@/components/admin/produtos/ModalNovoProduto";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Produto } from "@/types/produto";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function ProdutosClient({ initialProdutos }: { initialProdutos: Produto[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Produtos</h1>
        </div>
        <Button onClick={() => setIsOpen(true)} className="bg-primary text-white gap-2 cursor-pointer">
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
             {initialProdutos.map((produto) => (
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
                     <Button variant="edit" size="icon" className="h-8 w-8 cursor-pointer">
                       <Edit className="h-4 w-4 text-muted-foreground" />
                     </Button>
                     <Button variant="remove" size="icon" className="h-8 w-8 cursor-pointer text-destructive">
                       <Trash2 className="h-4 w-4" />
                     </Button>
                   </div>
                 </TableCell>
               </TableRow>
             ))}
           </TableBody>
         </Table>
    </div>

      <ModalNovoProduto open={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}