import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async create(createCategoryDto: { name: string }) {
    return await this.prisma.category.create({
      data: {
        name: createCategoryDto.name,
      },
    });
  }
}
