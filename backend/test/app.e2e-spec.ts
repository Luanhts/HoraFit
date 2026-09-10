import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../prisma/prisma.service';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  const originalAdminApiKey = process.env.ADMIN_API_KEY;
  const productResponse = {
    id: 1,
    name: 'Produto Teste',
    description: 'Descrição do produto teste',
    price: '10.00',
    sku: 'SKU-TESTE',
    stock: 10,
    imageUrl: null,
    active: true,
    categoryId: 1,
    category: { id: 1, name: 'Categoria Teste' },
  };
  const categoryResponse = { id: 1, name: 'Categoria Teste' };
  const orderResponse = {
    id: 1,
    customerName: 'Cliente Teste',
    customerPhone: '11999999999',
    customerEmail: null,
    notes: null,
    status: 'PENDING',
    total: '10.00',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [],
  };
  const prismaMock = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn(),
    product: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    category: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    order: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    process.env.ADMIN_API_KEY = 'test-admin-key';
    jest.clearAllMocks();
    prismaMock.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);
    prismaMock.product.findMany.mockResolvedValue([]);
    prismaMock.product.create.mockResolvedValue(productResponse);
    prismaMock.product.update.mockResolvedValue(productResponse);
    prismaMock.product.delete.mockResolvedValue(productResponse);
    prismaMock.category.findMany.mockResolvedValue([]);
    prismaMock.category.create.mockResolvedValue(categoryResponse);
    prismaMock.order.findMany.mockResolvedValue([orderResponse]);
    prismaMock.order.findUnique.mockResolvedValue(orderResponse);
    prismaMock.order.update.mockResolvedValue(orderResponse);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    process.env.ADMIN_API_KEY = originalAdminApiKey;
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!!!');
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((response) => {
        expect(response.body).toMatchObject({ status: 'ok', database: 'ok' });
      });
  });

  it('/products (GET) remains public', () => {
    return request(app.getHttpServer()).get('/products').expect(200).expect([]);
  });

  it('/orders (POST) remains public', () => {
    return request(app.getHttpServer())
      .post('/orders')
      .send({ items: [] })
      .expect(400);
  });

  it('/products (POST) blocks requests without admin API key', () => {
    return request(app.getHttpServer())
      .post('/products')
      .send({ name: 'Produto Teste' })
      .expect(401);
  });

  it('/products (POST) blocks requests with invalid admin API key', () => {
    return request(app.getHttpServer())
      .post('/products')
      .set('x-admin-api-key', 'wrong-key')
      .send({ name: 'Produto Teste' })
      .expect(401);
  });

  it('/products (POST) accepts requests with valid admin API key', () => {
    return request(app.getHttpServer())
      .post('/products')
      .set('x-admin-api-key', 'test-admin-key')
      .send({
        name: 'Produto Teste',
        description: 'Descrição do produto teste',
        price: 10,
        sku: 'SKU-TESTE',
        stock: 10,
        categoryId: 1,
        active: true,
      })
      .expect(201)
      .expect((response) => {
        expect(response.body).toMatchObject({ id: 1, sku: 'SKU-TESTE' });
      });
  });

  it('/categories (POST) blocks requests without admin API key', () => {
    return request(app.getHttpServer())
      .post('/categories')
      .send({ name: 'Categoria Teste' })
      .expect(401);
  });

  it('/categories (POST) accepts requests with valid admin API key', () => {
    return request(app.getHttpServer())
      .post('/categories')
      .set('x-admin-api-key', 'test-admin-key')
      .send({ name: 'Categoria Teste' })
      .expect(201)
      .expect((response) => {
        expect(response.body).toMatchObject({ id: 1, name: 'Categoria Teste' });
      });
  });

  it('/orders (GET) blocks requests without admin API key', () => {
    return request(app.getHttpServer()).get('/orders').expect(401);
  });

  it('/orders (GET) accepts requests with valid admin API key', () => {
    return request(app.getHttpServer())
      .get('/orders')
      .set('x-admin-api-key', 'test-admin-key')
      .expect(200)
      .expect((response) => {
        expect(response.body).toHaveLength(1);
      });
  });

  it('/orders/:id/status (PATCH) blocks requests without admin API key', () => {
    return request(app.getHttpServer())
      .patch('/orders/1/status')
      .send({ status: 'CONFIRMED' })
      .expect(401);
  });

  it('/orders/:id/status (PATCH) accepts requests with valid admin API key', () => {
    return request(app.getHttpServer())
      .patch('/orders/1/status')
      .set('x-admin-api-key', 'test-admin-key')
      .send({ status: 'CONFIRMED' })
      .expect(200)
      .expect((response) => {
        expect(response.body).toMatchObject({ id: 1 });
      });
  });
});
