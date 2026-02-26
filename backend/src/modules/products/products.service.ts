import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'prisma/prisma.service';

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
    } catch (error: any) {
      if (error?.code === 'P2002' && error?.meta?.target?.includes('sku')) {
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
        data: updateProductDto,
        include: { category: true },
      });
    } catch (error: any) {
      // P2025: registro não encontrado
      if (error?.code === 'P2025') {
        throw new NotFoundException(`Produto #${id} não encontrado.`);
      }
      // P2002: violação de unique constraint (SKU duplicado)
      if (error?.code === 'P2002' && error?.meta?.target?.includes('sku')) {
        throw new BadRequestException('Este SKU já está em uso.');
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.product.delete({ where: { id } });
      return { message: `Produto #${id} removido com sucesso.` };
    } catch (error: any) {
      if (error?.code === 'P2025') {
        throw new NotFoundException(`Produto #${id} não encontrado.`);
      }
      throw error;
    }
  }
}
