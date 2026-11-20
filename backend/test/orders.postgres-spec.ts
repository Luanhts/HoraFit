import { randomUUID } from 'node:crypto';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from '../src/modules/orders/orders.service';

const testDatabaseUrl = process.env.TEST_DATABASE_URL;

if (process.env.HORAFIT_INTEGRATION_DB !== '1' || !testDatabaseUrl) {
  throw new Error('Execute esta suíte somente pelo comando test:postgres.');
}

const parsedUrl = new URL(testDatabaseUrl);
if (
  parsedUrl.protocol !== 'postgresql:' ||
  parsedUrl.hostname !== '127.0.0.1' ||
  parsedUrl.username !== 'horafit_test' ||
  parsedUrl.pathname !== '/horafit_integration_test'
) {
  throw new Error(
    'A URL do banco de integração não corresponde ao banco local isolado.',
  );
}

describe('OrdersService com PostgreSQL real', () => {
  let prisma: PrismaService;
  let service: OrdersService;
  let categoryId: number | null = null;
  let customerName: string;

  beforeAll(async () => {
    prisma = new PrismaService({
      datasources: { db: { url: testDatabaseUrl } },
    });
    await prisma.$connect();
    service = new OrdersService(prisma);
  });

  afterAll(async () => {
    if (prisma) await prisma.$disconnect();
  });

  beforeEach(async () => {
    customerName = `Integração ${randomUUID()}`;
    const category = await prisma.category.create({
      data: { name: `Categoria ${randomUUID()}` },
    });
    categoryId = category.id;
  });

  afterEach(async () => {
    if (categoryId === null) return;
    await prisma.idempotencyRequest.deleteMany({
      where: { order: { customerName } },
    });
    await prisma.order.deleteMany({ where: { customerName } });
    await prisma.product.deleteMany({ where: { categoryId } });
    await prisma.category.delete({ where: { id: categoryId } });
    categoryId = null;
  });

  async function createProduct(price: string, stock: number) {
    if (categoryId === null) throw new Error('Categoria de teste ausente.');

    return prisma.product.create({
      data: {
        name: 'Produto de integração',
        sku: `INTEGRATION-${randomUUID()}`,
        price: new Prisma.Decimal(price),
        stock,
        categoryId,
      },
    });
  }

  function orderInput(items: Array<{ productId: number; quantity: number }>) {
    return { customerName, customerPhone: '41999999999', items };
  }

  it('cria pedido com valores exatos e baixa o estoque', async () => {
    const first = await createProduct('0.10', 3);
    const second = await createProduct('0.20', 1);

    const order = await service.create(
      orderInput([
        { productId: second.id, quantity: 1 },
        { productId: first.id, quantity: 3 },
      ]),
    );

    expect(order.total.toFixed(2)).toBe('0.50');
    expect(order.items).toHaveLength(2);
    expect(
      (await prisma.product.findUniqueOrThrow({ where: { id: first.id } }))
        .stock,
    ).toBe(0);
    expect(
      (await prisma.product.findUniqueOrThrow({ where: { id: second.id } }))
        .stock,
    ).toBe(0);
  });

  it('reverte a primeira baixa quando um item posterior falha', async () => {
    const first = await createProduct('10.00', 2);
    const second = await createProduct('20.00', 0);

    await expect(
      service.create(
        orderInput([
          { productId: first.id, quantity: 1 },
          { productId: second.id, quantity: 1 },
        ]),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(
      (await prisma.product.findUniqueOrThrow({ where: { id: first.id } }))
        .stock,
    ).toBe(2);
    expect(await prisma.order.count({ where: { customerName } })).toBe(0);
  });

  it('permite somente um pedido para a última unidade concorrente', async () => {
    const product = await createProduct('10.00', 1);
    const input = orderInput([{ productId: product.id, quantity: 1 }]);

    const outcomes = await Promise.allSettled([
      service.create(input),
      service.create(input),
    ]);

    expect(
      outcomes.filter((outcome) => outcome.status === 'fulfilled'),
    ).toHaveLength(1);
    expect(
      outcomes.filter((outcome) => outcome.status === 'rejected'),
    ).toHaveLength(1);
    expect(
      (await prisma.product.findUniqueOrThrow({ where: { id: product.id } }))
        .stock,
    ).toBe(0);
    expect(await prisma.order.count({ where: { customerName } })).toBe(1);
  });

  it('repõe estoque uma única vez em cancelamento repetido', async () => {
    const product = await createProduct('10.00', 2);
    const order = await service.create(
      orderInput([{ productId: product.id, quantity: 1 }]),
    );

    await service.updateStatus(order.id, OrderStatus.CANCELED);
    await service.updateStatus(order.id, OrderStatus.CANCELED);

    expect(
      (await prisma.product.findUniqueOrThrow({ where: { id: product.id } }))
        .stock,
    ).toBe(2);
    expect(
      (await prisma.order.findUniqueOrThrow({ where: { id: order.id } }))
        .status,
    ).toBe(OrderStatus.CANCELED);
  });

  it('conclui compras concorrentes com os mesmos produtos em ordem inversa', async () => {
    const first = await createProduct('10.00', 2);
    const second = await createProduct('20.00', 2);

    const outcomes = await Promise.allSettled([
      service.create(
        orderInput([
          { productId: first.id, quantity: 1 },
          { productId: second.id, quantity: 1 },
        ]),
      ),
      service.create(
        orderInput([
          { productId: second.id, quantity: 1 },
          { productId: first.id, quantity: 1 },
        ]),
      ),
    ]);

    expect(outcomes.every((outcome) => outcome.status === 'fulfilled')).toBe(
      true,
    );
    expect(
      (await prisma.product.findUniqueOrThrow({ where: { id: first.id } }))
        .stock,
    ).toBe(0);
    expect(
      (await prisma.product.findUniqueOrThrow({ where: { id: second.id } }))
        .stock,
    ).toBe(0);
    expect(await prisma.order.count({ where: { customerName } })).toBe(2);
  });

  it('retorna o mesmo pedido em retry e baixa o estoque uma vez', async () => {
    const product = await createProduct('10.00', 2);
    const key = randomUUID();
    const input = orderInput([{ productId: product.id, quantity: 1 }]);

    const first = await service.create(input, key);
    const retry = await service.create(input, key);

    expect(retry.id).toBe(first.id);
    expect(await prisma.order.count({ where: { customerName } })).toBe(1);
    expect(
      (await prisma.product.findUniqueOrThrow({ where: { id: product.id } }))
        .stock,
    ).toBe(1);
    const attempts = await prisma.idempotencyRequest.findMany({
      where: { orderId: first.id },
    });
    expect(attempts).toHaveLength(1);
    expect(attempts[0]).toMatchObject({ status: 'COMPLETED', httpStatus: 201 });
  });

  it('rejeita reutilizar a chave com outro payload', async () => {
    const product = await createProduct('10.00', 3);
    const key = randomUUID();
    await service.create(
      orderInput([{ productId: product.id, quantity: 1 }]),
      key,
    );

    await expect(
      service.create(orderInput([{ productId: product.id, quantity: 2 }]), key),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(await prisma.order.count({ where: { customerName } })).toBe(1);
    expect(
      (await prisma.product.findUniqueOrThrow({ where: { id: product.id } }))
        .stock,
    ).toBe(2);
  });

  it('deduplica submissões simultâneas com a mesma chave', async () => {
    const product = await createProduct('10.00', 1);
    const key = randomUUID();
    const input = orderInput([{ productId: product.id, quantity: 1 }]);

    const [first, second] = await Promise.all([
      service.create(input, key),
      service.create(input, key),
    ]);

    expect(second.id).toBe(first.id);
    expect(await prisma.order.count({ where: { customerName } })).toBe(1);
    expect(
      (await prisma.product.findUniqueOrThrow({ where: { id: product.id } }))
        .stock,
    ).toBe(0);
  });

  it('permite retry após falha transacional com a mesma chave', async () => {
    const product = await createProduct('10.00', 0);
    const key = randomUUID();
    const input = orderInput([{ productId: product.id, quantity: 1 }]);

    await expect(service.create(input, key)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(await prisma.idempotencyRequest.count()).toBe(0);

    await prisma.product.update({
      where: { id: product.id },
      data: { stock: 1 },
    });
    const order = await service.create(input, key);
    expect(order.items).toHaveLength(1);
    expect(await prisma.order.count({ where: { customerName } })).toBe(1);
  });
});
