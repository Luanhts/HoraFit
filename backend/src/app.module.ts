import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PrismaService } from 'prisma/prisma.service';

function getPositiveIntegerEnv(name: string, fallback: number) {
  const rawValue = process.env[name];

  if (rawValue === undefined) return fallback;

  const value = Number(rawValue);

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} deve ser um número inteiro positivo.`);
  }

  return value;
}

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      useFactory: () => [
        {
          name: 'orders',
          ttl: getPositiveIntegerEnv('ORDER_RATE_LIMIT_WINDOW_MS', 60_000),
          limit: getPositiveIntegerEnv('ORDER_RATE_LIMIT_MAX', 10),
        },
      ],
    }),
    ProductsModule,
    CategoriesModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
