import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CreateInventoryItemUseCase } from '../../application/use-cases/create-inventory-item.use-case';
import { DeleteInventoryItemUseCase } from '../../application/use-cases/delete-inventory-item.use-case';
import { GetInventoryItemUseCase } from '../../application/use-cases/get-inventory-item.use-case';
import { ListInventoryItemsUseCase } from '../../application/use-cases/list-inventory-items.use-case';
import { UpdateInventoryItemUseCase } from '../../application/use-cases/update-inventory-item.use-case';
import {
  CreateInventoryItemDto,
  InventoryItemResponseDto,
  UpdateInventoryItemDto,
} from './dto/inventory.dto';

@ApiTags('inventory')
@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly createInventoryItemUseCase: CreateInventoryItemUseCase,
    private readonly listInventoryItemsUseCase: ListInventoryItemsUseCase,
    private readonly getInventoryItemUseCase: GetInventoryItemUseCase,
    private readonly updateInventoryItemUseCase: UpdateInventoryItemUseCase,
    private readonly deleteInventoryItemUseCase: DeleteInventoryItemUseCase
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a product inventory record' })
  @ApiCreatedResponse({ description: 'Inventory created.', type: InventoryItemResponseDto })
  @ApiConflictResponse({ description: 'Product already exists in inventory.' })
  async create(@Body() dto: CreateInventoryItemDto): Promise<InventoryItemResponseDto> {
    return this.createInventoryItemUseCase.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List inventory records' })
  @ApiOkResponse({ description: 'Inventory list.', type: InventoryItemResponseDto, isArray: true })
  async list(): Promise<InventoryItemResponseDto[]> {
    return this.listInventoryItemsUseCase.execute();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get inventory by product id' })
  @ApiParam({ name: 'id', description: 'Product id' })
  @ApiOkResponse({ description: 'Inventory record.', type: InventoryItemResponseDto })
  @ApiNotFoundResponse({ description: 'Product was not found in inventory.' })
  async getById(@Param('id') id: string): Promise<InventoryItemResponseDto> {
    return this.getInventoryItemUseCase.execute(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update stock quantity by product id' })
  @ApiParam({ name: 'id', description: 'Product id' })
  @ApiOkResponse({ description: 'Inventory updated.', type: InventoryItemResponseDto })
  @ApiNotFoundResponse({ description: 'Product was not found in inventory.' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateInventoryItemDto
  ): Promise<InventoryItemResponseDto> {
    return this.updateInventoryItemUseCase.execute({ id, stockQuantity: dto.stockQuantity });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete inventory by product id' })
  @ApiParam({ name: 'id', description: 'Product id' })
  @ApiNoContentResponse({ description: 'Inventory deleted.' })
  @ApiNotFoundResponse({ description: 'Product was not found in inventory.' })
  async delete(@Param('id') id: string): Promise<void> {
    await this.deleteInventoryItemUseCase.execute(id);
  }
}
