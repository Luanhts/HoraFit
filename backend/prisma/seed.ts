// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando o seed do banco de dados...');

  // O seed pode ser executado em produção sem apagar catálogo ou pedidos já criados.
  async function findOrCreateCategory(name: string) {
    const category = await prisma.category.findFirst({ where: { name } });
    return category ?? prisma.category.create({ data: { name } });
  }

  const catSuplementos = await findOrCreateCategory('Suplementos');
  const catRoupas = await findOrCreateCategory('Moda Fitness');
  const catAcessorios = await findOrCreateCategory('Acessórios');

  console.log('📁 Categorias criadas.');

  // 3. Criar Produtos
  const products = [
    {
      name: 'Whey Protein Isolado',
      description: 'Proteína de alta pureza para recuperação muscular.',
      price: 199.9, // O Prisma converte float para Decimal automaticamente
      sku: 'WHEY-ISO-900',
      stock: 50,
      categoryId: catSuplementos.id, // Ligando à categoria criada acima
      active: true,
    },
    {
      name: 'Creatina Monohidratada',
      description: 'Potencialize seus treinos com mais força.',
      price: 89.9,
      sku: 'CREA-MONO-300',
      stock: 100,
      categoryId: catSuplementos.id,
      active: true,
    },
    {
      name: 'Camiseta DryFit',
      description: 'Tecido leve que absorve o suor.',
      price: 49.9,
      sku: 'CAM-DRY-BLK-M',
      stock: 200,
      categoryId: catRoupas.id,
      active: true,
    },
    {
      name: 'Halteres 5kg (Par)',
      description: 'Par de halteres emborrachados.',
      price: 120.0,
      sku: 'HALT-05KG',
      stock: 10,
      categoryId: catAcessorios.id,
      active: true,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      create: product,
      // Produtos existentes são preservados: o seed só inclui os que ainda não existem.
      update: {},
    });
  }

  console.log('📦 Produtos criados com sucesso!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
