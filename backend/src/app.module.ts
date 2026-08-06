import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { OrdersModule } from './modules/orders/orders.module';

@Module({
  imports: [ProductsModule, CategoriesModule, OrdersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
