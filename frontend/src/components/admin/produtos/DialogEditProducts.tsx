import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onClose: () => void;
  productName?: string;
  formId: string;
};

export default function DialogEditProducts({
  open,
  onClose,
  productName,
  formId,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white p-5 rounded-lg shadow-lg w-full max-w-lg">
        <div className="flex flex-col mb-4">
          <h2 className="text-lg font-semibold">Editar produto?</h2>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja editar{" "}
            <span className="font-semibold text-gray">
              {productName ?? "este produto"}
            </span>{" "}
            do catálogo?
            <br />
            Esta ação não pode ser desfeita.
          </p>
          <div className="mt-2 flex gap-2 justify-end">
            <Button
              onClick={onClose}
              aria-label="Cancelar"
              variant="cancelBtn"
              className="cursor-pointer"
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              form={formId}
              onClick={onClose}
              aria-label="Confirmar Edição"
              variant="default"
              className="cursor-pointer"
            >
              Salvar Alterações
            </Button>
          </div>
        </div>
        {/* Formulário / conteúdo do modal aqui */}
      </div>
    </div>
  );
}
