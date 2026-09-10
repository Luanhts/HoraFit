import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AdminApiKeyGuard } from '../../auth/admin-api-key.guard';
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
  create(@Body() createCategoryDto: { name: string }) {
    return this.categoriesService.create(createCategoryDto);
  }
}
