import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AdminApiKeyGuard } from '../../auth/admin-api-key.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  createCategorySchema,
  type CreateCategoryDto,
} from './dto/create-category.dto';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Post()
  @UseGuards(AdminApiKeyGuard)
  create(
    @Body(new ZodValidationPipe(createCategorySchema))
    createCategoryDto: CreateCategoryDto,
  ) {
    return this.categoriesService.create(createCategoryDto);
  }
}
