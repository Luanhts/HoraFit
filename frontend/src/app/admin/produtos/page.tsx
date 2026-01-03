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

const produtos = [
  { id: 1, nome: "Smoothie Dragon Fruit", sku: "SMT-001", estoque: 45, preco: "R$ 18.90", status: "Ativo", img: "https://images.unsplash.com/photo-1553531384-cc64ac80f931?w=100&h=100&fit=crop" },
  { id: 2, nome: "Açaí Bowl Proteico", sku: "ACB-002", estoque: 32, preco: "R$ 22.50", status: "Ativo", img: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=100&h=100&fit=crop" },
  { id: 3, nome: "Shake de Chocolate Fit", sku: "SHK-003", estoque: 5, preco: "R$ 16.90", status: "Ativo", img: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=100&h=100&fit=crop" },
  { id: 4, nome: "Bowl de Frutas", sku: "BWL-004", estoque: 0, preco: "R$ 19.90", status: "Inativo", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=100&h=100&fit=crop" },
];

export default function ProdutosPage() {
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
                    src={produto.img} 
                    alt={produto.nome} 
                    className="h-12 w-12 rounded-lg object-cover border" 
                  />
                </TableCell>
                <TableCell className="font-medium">{produto.nome}</TableCell>
                <TableCell className="text-muted-foreground">{produto.sku}</TableCell>
                <TableCell>
                  <span className={produto.estoque <= 5 ? "text-orange-600 font-bold" : ""}>
                    {produto.estoque}
                  </span>
                </TableCell>
                <TableCell className="font-bold">{produto.preco}</TableCell>
                <TableCell>
                  <Badge className={
                    produto.status === "Ativo" 
                    ? "bg-primary/20 text-primary hover:bg-primary/30" 
                    : "bg-secondary/20 text-secondary hover:bg-secondary/30"
                  }>
                    {produto.status}
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
