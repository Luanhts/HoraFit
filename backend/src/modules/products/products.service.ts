import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const created = await this.prisma.product.create({
        data: {
          name: createProductDto.name,
          description: createProductDto.description,
          price: createProductDto.price,
          sku: createProductDto.sku,
          stock: (createProductDto as any).stock || 0,
          imageUrl: createProductDto.imageUrl,
          active: (createProductDto as any).active || true,
          categoryId: createProductDto.categoryId,
    }, 
    include: { category: true},
  });
  return created;
} catch (error: any) {
      // Prisma unique constraint error code P2002 for duplicate fields (e.g., sku)
      if (error?.code === 'P2002' && error?.meta?.target?.includes('sku')) {
        throw new BadRequestException('SKU already exists');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.product.findMany({ 
      include: { category: true } 
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
