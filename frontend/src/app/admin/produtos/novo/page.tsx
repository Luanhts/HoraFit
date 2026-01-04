"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductFormData } from "@/schemas/product-schema";
import { criarProdutoAction } from "@/actions/produto-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner"; // Opcional: para feedback visual

export default function NovoProdutoPage() {
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: "", description: "", price: 0, sku: "", stock: 0, categoryId: 1, active: true },
  });

  async function onSubmit(values: ProductFormData) {
    const result = await criarProdutoAction(values);
    if (result?.error) {
      toast.error(result.error);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-10">
      <div>
        <h1 className="text-3xl font-bold">Novo Produto</h1>
        <p className="text-muted-foreground">Preencha os dados abaixo para o catálogo da Hora Fit.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 bg-card p-6 rounded-xl border">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Produto</FormLabel>
                <FormControl><Input placeholder="Ex: Whey Protein" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço (R$)</FormLabel>
                  <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estoque Inicial</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU</FormLabel>
                <FormControl><Input placeholder="WHEY-001" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              className="flex-1 bg-primary hover:bg-primary/90 cursor-pointer"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Salvando..." : "Cadastrar Produto"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => window.history.back()}
              className="cursor-pointer border-secondary text-secondary hover:bg-secondary/10"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}