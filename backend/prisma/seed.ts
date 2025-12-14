// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando o seed do banco de dados...')

  // 1. Limpar o banco antes de começar (Ordem importa por causa das chaves estrangeiras!)
  // Apagamos produtos primeiro, depois categorias.
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  console.log('🧹 Banco limpo com sucesso.')

  // 2. Criar Categorias
  const catSuplementos = await prisma.category.create({
    data: { name: 'Suplementos' }
  })

  const catRoupas = await prisma.category.create({
    data: { name: 'Moda Fitness' }
  })

  const catAcessorios = await prisma.category.create({
    data: { name: 'Acessórios' }
  })

  console.log('📁 Categorias criadas.')

  // 3. Criar Produtos
  await prisma.product.createMany({
    data: [
      {
        name: 'Whey Protein Isolado',
        description: 'Proteína de alta pureza para recuperação muscular.',
        price: 199.90, // O Prisma converte float para Decimal automaticamente
        sku: 'WHEY-ISO-900',
        stock: 50,
        categoryId: catSuplementos.id, // Ligando à categoria criada acima
        active: true
      },
      {
        name: 'Creatina Monohidratada',
        description: 'Potencialize seus treinos com mais força.',
        price: 89.90,
        sku: 'CREA-MONO-300',
        stock: 100,
        categoryId: catSuplementos.id,
        active: true
      },
      {
        name: 'Camiseta DryFit',
        description: 'Tecido leve que absorve o suor.',
        price: 49.90,
        sku: 'CAM-DRY-BLK-M',
        stock: 200,
        categoryId: catRoupas.id,
        active: true
      },
      {
        name: 'Halteres 5kg (Par)',
        description: 'Par de halteres emborrachados.',
        price: 120.00,
        sku: 'HALT-05KG',
        stock: 10,
        categoryId: catAcessorios.id,
        active: true
      }
    ]
  })

  console.log('📦 Produtos criados com sucesso!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })