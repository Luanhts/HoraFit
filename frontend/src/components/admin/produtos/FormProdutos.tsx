"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";

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
import { Category, Produto } from "@/types/produto";

export const produtoSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  sku: z.string().min(1, "SKU é obrigatório"),
  price: z.coerce
    .number({ invalid_type_error: "Insira um preço válido" })
    .positive("Preço deve ser maior que zero"),
  stock: z.coerce
    .number({ invalid_type_error: "Insira uma quantidade válida" })
    .int("Estoque deve ser um número inteiro")
    .min(0, "Estoque não pode ser negativo"),
  // coerce.number() converte a string do Select para número automaticamente
  categoryId: z.coerce
    .number({ invalid_type_error: "Selecione uma categoria" })
    .int()
    .min(1, "Selecione uma categoria"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  active: z.boolean().default(true),
});

export type ProdutoSchema = z.infer<typeof produtoSchema>;

type Props = {
  formId: string;
  // O pai decide o que fazer com os dados validados (criar ou editar)
  onSubmit: (data: ProdutoSchema) => void;
  // Só existe na edição — pré-popula o formulário com os dados atuais
  initialData?: Produto;
  categories: Category[];
};

export default function FormProdutos({
  formId,
  onSubmit,
  initialData,
  categories,
}: Props) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProdutoSchema>({
    resolver: zodResolver(produtoSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          sku: initialData.sku,
          price: Number(initialData.price), // Prisma retorna Decimal como string
          stock: initialData.stock,
          categoryId: initialData.categoryId,
          description: initialData.description ?? "",
          imageUrl: initialData.imageUrl ?? "",
          active: initialData.active,
        }
      : {
          name: "",
          sku: "",
          price: 0,
          stock: 0,
          description: "",
          imageUrl: "",
          active: true,
        },
  });

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(onSubmit)}
      className="flex-1 space-y-6"
    >
      {/* Imagem */}
      <div className="space-y-2">
        <Label>Imagem do Produto</Label>
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer">
          <Upload className="h-8 w-8 mb-2 text-gray-400" />
          <span className="text-sm">Cole a URL da imagem abaixo</span>
        </div>
        <Input {...register("imageUrl")} placeholder="https://exemplo.com/imagem.jpg" />
      </div>

      {/* Nome e SKU */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do Produto *</Label>
          <Input id="name" {...register("name")} placeholder="Ex: Shake Herbalife Baunilha" />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="sku">SKU *</Label>
          <Input id="sku" {...register("sku")} placeholder="Ex: HRB-001" />
          {errors.sku && (
            <p className="text-xs text-destructive">{errors.sku.message}</p>
          )}
        </div>
      </div>

      {/* Preço e Estoque */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Preço (R$) *</Label>
          <Input id="price" {...register("price")} type="number" step="0.01" placeholder="0.00" />
          {errors.price && (
            <p className="text-xs text-destructive">{errors.price.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="stock">Estoque *</Label>
          <Input id="stock" {...register("stock")} type="number" placeholder="0" />
          {errors.stock && (
            <p className="text-xs text-destructive">{errors.stock.message}</p>
          )}
        </div>
      </div>

      {/* Categoria — usa Controller porque o Select do Radix UI não é um input HTML nativo,
          então register() não consegue capturar seu valor automaticamente */}
      <div className="space-y-2">
        <Label>Categoria *</Label>
        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value ? String(field.value) : ""}
              onValueChange={(val) => field.onChange(Number(val))}
            >
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem
                    key={cat.id}
                    value={String(cat.id)}
                    className="cursor-pointer"
                  >
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.categoryId && (
          <p className="text-xs text-destructive">{errors.categoryId.message}</p>
        )}
      </div>

      {/* Descrição */}
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Descrição detalhada do produto..."
          className="resize-none h-24"
        />
      </div>

      {/* Produto Ativo — também usa Controller pelo mesmo motivo do Select */}
      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-100">
        <div className="space-y-0.5">
          <Label className="text-base font-semibold">Produto Ativo</Label>
          <p className="text-sm text-gray-500">O produto ficará visível na loja</p>
        </div>
        <Controller
          name="active"
          control={control}
          render={({ field }) => (
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              className="cursor-pointer"
            />
          )}
        />
      </div>
    </form>
  );
}
