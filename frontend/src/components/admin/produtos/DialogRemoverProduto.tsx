import { Button } from "@/components/ui/button";

type Props = {
    open: boolean;
    onClose: () => void;
    productName?: string;
    onConfirm?: () => void;
};

export default function DialogRemoverProduto({ open, onClose, productName, onConfirm }: Props) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white p-5 rounded-lg shadow-lg w-full max-w-lg">
        <div className="flex flex-col mb-4">
          <h2 className="text-lg font-semibold">Remover produto?</h2>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja remover <span className="font-semibold text-gray">{productName ?? "este produto"}</span> do catálogo?<br />
            Esta ação não pode ser desfeita.
            </p>
            <div className="mt-2 flex gap-2 justify-end">
          <Button onClick={onClose} aria-label="Cancelar" variant="secondaryBtn" className="cursor-pointer">Cancelar</Button>
          <Button onClick={() => (onConfirm ? onConfirm() : onClose())} aria-label="Remover" variant="removeBtn" className="cursor-pointer">Remover</Button>
            </div>
        </div>
        {/* Formulário / conteúdo do modal aqui */}
      </div>
    </div>
    );
}