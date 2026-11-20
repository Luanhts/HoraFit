import {
  Body,
  BadRequestException,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AdminApiKeyGuard } from '../../auth/admin-api-key.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { positiveIdSchema } from '../../schemas/id-schema';
import {
  createOrderSchema,
  idempotencyKeySchema,
  type CreateOrderDto,
} from './dto/create-order.dto';
import {
  updateOrderStatusSchema,
  type UpdateOrderStatusDto,
} from './dto/update-order-status.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(ThrottlerGuard)
  create(
    @Body(new ZodValidationPipe(createOrderSchema))
    createOrderDto: CreateOrderDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    const parsedKey = idempotencyKeySchema.safeParse(idempotencyKey);
    if (!parsedKey.success) {
      throw new BadRequestException('Idempotency-Key deve ser um UUID válido.');
    }
    return this.ordersService.create(createOrderDto, parsedKey.data);
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
