import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CreateProductUseCase } from '../../../application/use-cases/create-product.use-case';
import { ListProductsUseCase } from '../../../application/use-cases/list-products.use-case';
import { GetProductUseCase } from '../../../application/use-cases/get-product.use-case';
import { UpdateProductUseCase } from '../../../application/use-cases/update-product.use-case';
import { DeleteProductUseCase } from '../../../application/use-cases/delete-product.use-case';
import { CreateProductDto, ProductListQueryDto, UpdateProductDto } from './dto';

@ApiTags('products')
@Controller('products')
@UsePipes(new ValidationPipe({ transform: true }))
export class ProductController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly listProductsUseCase: ListProductsUseCase,
    private readonly getProductUseCase: GetProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create product' })
  @ApiCreatedResponse({ description: 'Product created.' })
  async create(@Body() dto: CreateProductDto) {
    return this.createProductUseCase.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List products' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiOkResponse({ description: 'Paginated products list.' })
  async list(@Query() query: ProductListQueryDto) {
    return this.listProductsUseCase.execute(query.page ?? 1, query.limit ?? 10, query.search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by id' })
  @ApiParam({ name: 'id', description: 'Product id' })
  @ApiOkResponse({ description: 'Product found.' })
  @ApiNotFoundResponse({ description: 'Product not found.' })
  async getById(@Param('id') id: string) {
    return this.getProductUseCase.execute(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product by id' })
  @ApiParam({ name: 'id', description: 'Product id' })
  @ApiOkResponse({ description: 'Product updated.' })
  @ApiNotFoundResponse({ description: 'Product not found.' })
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.updateProductUseCase.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete product by id' })
  @ApiParam({ name: 'id', description: 'Product id' })
  @ApiNoContentResponse({ description: 'Product deleted.' })
  @ApiNotFoundResponse({ description: 'Product not found.' })
  async delete(@Param('id') id: string): Promise<void> {
    await this.deleteProductUseCase.execute(id);
  }
}
