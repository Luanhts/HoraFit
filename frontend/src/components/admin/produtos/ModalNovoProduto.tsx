"use client";
import { Button } from "@/components/ui/button";
import React from "react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function ModalNovoProduto({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Adicionar Novo Produto</h2>
          <Button onClick={onClose} aria-label="Fechar" className="cursor-pointer">X</Button>
        </div>
        {/* Formulário / conteúdo do modal aqui */}
      </div>
    </div>
  );
}