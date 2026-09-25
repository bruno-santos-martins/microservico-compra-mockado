import { Body, Controller, Get, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateProductUseCase } from '../../../application/use-cases/create-product.use-case';
import { ListProductsUseCase } from '../../../application/use-cases/list-products.use-case';
import { CreateProductDto, ProductListQueryDto } from './dto';

@Controller('products')
@UsePipes(new ValidationPipe({ transform: true }))
export class ProductController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly listProductsUseCase: ListProductsUseCase
  ) {}

  @Post()
  async create(@Body() dto: CreateProductDto) {
    return this.createProductUseCase.execute(dto);
  }

  @Get()
  async list(@Query() query: ProductListQueryDto) {
    return this.listProductsUseCase.execute(query.page ?? 1, query.limit ?? 10, query.search);
  }
}
