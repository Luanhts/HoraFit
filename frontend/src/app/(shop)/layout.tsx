import Footer from "@/components/shop/Footer";
import Navbar from "@/components/shop/Navbar";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* A Toolbar fica fixa no topo de todas as páginas da loja */}
      <Navbar />
      <div className="flex-1">{children}</div>

      <Footer />
    </div>
  );
}
