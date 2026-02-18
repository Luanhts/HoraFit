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
import { ca } from "zod/locales";
import ModalNovoProduto from "@/components/admin/produtos/ModalNovoProduto";
import ProdutosClient from "./ProdutosClient";

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

async function createProducts() {
  try {
    const res = await fetch(`${API_URL}/products/create-mock-products`, {
      method: 'POST',
    });
  
    return res.json();
  } catch (error) {
    console.error("Erro na requisição:", error);
  }
}
export default async function ProdutosPage() {
  const produtos = await getProdutos();

      return <ProdutosClient initialProdutos={produtos} />;
}
