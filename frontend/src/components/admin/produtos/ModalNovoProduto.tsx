"use client";

import { X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function ModalNovoProduto({ open, onClose }: Props) {
  if (!open) return null;

  return (
    // 1. Overlay escuro (Fundo)
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      
      {/* 2. Container Principal do Modal */}
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        
        {/* Cabeçalho (Fixo) */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Adicionar Novo Produto</h2>
          <Button 
            onClick={onClose} 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full cursor-pointer"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Conteúdo com Scroll (Formulário) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Imagem */}
          <div className="space-y-2">
            <Label>Imagem do Produto</Label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer">
              <Upload className="h-8 w-8 mb-2 text-gray-400" />
              <span className="text-sm">Arraste uma imagem ou cole a URL</span>
            </div>
            <Input placeholder="URL da imagem do produto" />
          </div>

          {/* Nome e SKU */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Produto *</Label>
              <Input id="nome" placeholder="Ex: Açaí Bowl Proteico" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input id="sku" placeholder="Ex: ACB-001" />
            </div>
          </div>

          {/* Preço e Estoque */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="preco">Preço (R$) *</Label>
              <Input id="preco" type="number" placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estoque">Estoque *</Label>
              <Input id="estoque" type="number" placeholder="0" />
            </div>
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select>
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem className="cursor-pointer" value="bowl">Bowls</SelectItem>
                <SelectItem className="cursor-pointer" value="bebida">Bebidas</SelectItem>
                <SelectItem className="cursor-pointer" value="sobremesa">Sobremesas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea 
              id="descricao" 
              placeholder="Descrição detalhada do produto..." 
              className="resize-none h-24" 
            />
          </div>

          {/* Informação Nutricional */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800">Informação Nutricional</h3>
            <div className="grid grid-cols-4 gap-3">
              <div className="space-y-1">
                <span className="text-xs text-gray-500 block mb-1">Calorias</span>
                <Input placeholder="kcal" className="pr-2" />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-gray-500 block mb-1">Proteínas</span>
                <Input placeholder="g" />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-gray-500 block mb-1">Carboidratos</span>
                <Input placeholder="g" />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-gray-500 block mb-1">Gorduras</span>
                <Input placeholder="g" />
              </div>
            </div>
          </div>

          {/* Produto Ativo (Último item do scroll) */}
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold">Produto Ativo</Label>
              <p className="text-sm text-gray-500">O produto ficará visível na loja</p>
            </div>
            <Switch className="cursor-pointer" />
          </div>

        </div> 
        {/* Fim da div overflow-y-auto */}

        {/* Rodapé do Modal (Fixo embaixo) */}
        <div className="p-6 border-t bg-gray-50 rounded-b-xl grid grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="w-full py-6 text-base font-medium cursor-pointer"
          >
            Cancelar
          </Button>
          <Button 
            className="w-full py-6 text-base font-medium bg-primary hover:bg-primary cursor-pointer"
          >
            Adicionar Produto
          </Button>
        </div>

      </div>
    </div>
  );
}