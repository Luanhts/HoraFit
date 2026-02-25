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
import FormProdutos from "./FormProdutos";
import { Produto } from "@/types/produto";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function ModalNovoProduto({ open, onClose }: Props) {
  if (!open) return null;

  const handleCreate = (data: Produto) => {
    console.log("Criando novo:", data);
    // api.post('/produtos', data)...
    onClose();
  };

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

        {/* Corpo do Modal (Scrollável) */}
        <div className="flex-1 overflow-y-auto p-6">
          <FormProdutos 
          formId="form-create"
          onSubmit={handleCreate}
          />
        </div>

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
          type="submit"
          form="form-create"
          className="w-full py-6 text-base font-medium bg-primary cursor-pointer"
          >
            Adicionar Produto
          </Button>
        </div>

      </div>
    </div>
  );
}