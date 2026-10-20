import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminApiKeyGuard } from '../../auth/admin-api-key.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { positiveIdSchema } from '../../schemas/id-schema';
import { createOrderSchema, type CreateOrderDto } from './dto/create-order.dto';
import {
  updateOrderStatusSchema,
  type UpdateOrderStatusDto,
} from './dto/update-order-status.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(
    @Body(new ZodValidationPipe(createOrderSchema))
    createOrderDto: CreateOrderDto,
  ) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  @UseGuards(AdminApiKeyGuard)
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  @UseGuards(AdminApiKeyGuard)
  findOne(@Param('id', new ZodValidationPipe(positiveIdSchema)) id: number) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(AdminApiKeyGuard)
  updateStatus(
    @Param('id', new ZodValidationPipe(positiveIdSchema)) id: number,
    @Body(new ZodValidationPipe(updateOrderStatusSchema))
    updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, updateOrderStatusDto.status);
  }
}
