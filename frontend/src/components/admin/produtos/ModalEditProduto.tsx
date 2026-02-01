import { Button } from "@/components/ui/button";

type Prop = {
    open: boolean;
    onClose: () => void;
}

export default function ModalEditProduto({ open, onClose }: Prop) {
    if (!open) return null;

    return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Editar Produto</h2>
          <Button onClick={onClose} aria-label="Fechar" className="cursor-pointer">X</Button>
        </div>
        {/* Formulário / conteúdo do modal aqui */}
      </div>
    </div>
    );
}