"use client";

type Props = {
  formId: string; // Para conectar com o botão do pai
  onSubmit: (data: Produto) => void; // O pai decide o que fazer com os dados
  initialData?: Produto; // Opcional: Só existe na edição
}

import { SubmitHandler, useForm } from "react-hook-form";

import { Upload } from "lucide-react";
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
import { Produto } from "@/types/produto";

export default function FormProdutos({ formId, onSubmit, initialData }: Props) {

    const { register, handleSubmit, reset } = useForm<Produto>({
    defaultValues: initialData || { // Valores padrão se for criação
      name: "",
      sku: "",
      price: 0,
      stock: 0
    }
  });

  return (
        <form id={formId} onSubmit={handleSubmit(onSubmit)} className="flex-1 p-6 space-y-6">
          
          {/* Imagem */}
          <div className="space-y-2">
            <Label>Imagem do Produto</Label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer">
              <Upload className="h-8 w-8 mb-2 text-gray-400" />
              <span className="text-sm">Arraste uma imagem ou cole a URL</span>
            </div>
            <Input {...register('imageUrl')} placeholder="URL da imagem do produto" />
          </div>

          {/* Nome e SKU */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Produto *</Label>
              <Input {...register('name')} placeholder="Ex: Açaí Bowl Proteico" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input {...register('sku')} placeholder="Ex: ACB-001" />
            </div>
          </div>

          {/* Preço e Estoque */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$) *</Label>
              <Input {...register('price')} type="number" placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Estoque *</Label>
              <Input {...register('stock')} type="number" placeholder="0" />
            </div>
          </div>

          {/* Categoria 
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
          </div>*/}

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea 
              {...register('description')} 
              placeholder="Descrição detalhada do produto..." 
              className="resize-none h-24" 
            />
          </div>

          {/* Informação Nutricional }
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800">Informação Nutricional</h3>
            <div className="grid grid-cols-4 gap-3">
              <div className="space-y-1">
                <span className="text-xs text-gray-500 block mb-1">Calorias</span>
                <Input  placeholder="kcal" className="pr-2" />
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
          </div>*/}

          {/* Produto Ativo (Último item do scroll) */}
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold">Produto Ativo</Label>
              <p className="text-sm text-gray-500">O produto ficará visível na loja</p>
            </div>
            <Switch {...register('active')} className="cursor-pointer" />
          </div>

        </form> 
  );
}