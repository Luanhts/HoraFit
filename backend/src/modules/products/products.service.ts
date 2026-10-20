import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import type { CreateProductDto } from './dto/create-product.dto';
import type { UpdateProductDto } from './dto/update-product.dto';

function isPrismaError(
  error: unknown,
  code: string,
): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === code
  );
}

function isDuplicateSkuError(error: unknown) {
  if (!isPrismaError(error, 'P2002')) return false;

  const target = error.meta?.target;
  return Array.isArray(target)
    ? target.includes('sku')
    : typeof target === 'string' && target.includes('sku');
}

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    try {
      return await this.prisma.product.create({
        data: {
          name: createProductDto.name,
          description: createProductDto.description,
          price: createProductDto.price,
          sku: createProductDto.sku,
          stock: createProductDto.stock ?? 0,
          imageUrl: createProductDto.imageUrl,
          // ?? preserva o false. "|| true" converteria false para true (bug)
          active: createProductDto.active ?? true,
          categoryId: createProductDto.categoryId,
        },
        include: { category: true },
      });
    } catch (error: unknown) {
      if (isDuplicateSkuError(error)) {
        throw new BadRequestException('Este SKU já está em uso.');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.product.findMany({
      include: { category: true },
    });
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      throw new NotFoundException(`Produto #${id} não encontrado.`);
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    try {
      return await this.prisma.product.update({
        where: { id },
        data: {
          name: updateProductDto.name,
          description: updateProductDto.description,
          price: updateProductDto.price,
          sku: updateProductDto.sku,
          stock: updateProductDto.stock,
          imageUrl: updateProductDto.imageUrl,
          active: updateProductDto.active,
          categoryId: updateProductDto.categoryId,
        },
        include: { category: true },
      });
    } catch (error: unknown) {
      // P2025: registro não encontrado
      if (isPrismaError(error, 'P2025')) {
        throw new NotFoundException(`Produto #${id} não encontrado.`);
      }
      // P2002: violação de unique constraint (SKU duplicado)
      if (isDuplicateSkuError(error)) {
        throw new BadRequestException('Este SKU já está em uso.');
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.product.delete({ where: { id } });
      return { message: `Produto #${id} removido com sucesso.` };
    } catch (error: unknown) {
      if (isPrismaError(error, 'P2025')) {
        throw new NotFoundException(`Produto #${id} não encontrado.`);
      }
      throw error;
    }
  }
}
