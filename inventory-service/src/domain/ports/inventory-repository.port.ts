export const INVENTORY_REPOSITORY_PORT = Symbol('INVENTORY_REPOSITORY_PORT');

export interface ReserveItemInput {
  productId: string;
  quantity: number;
}

export interface InventoryItem {
  id: string;
  stockQuantity: number;
}

export interface CreateInventoryItemInput {
  id: string;
  stockQuantity: number;
}

export interface UpdateInventoryItemInput {
  id: string;
  stockQuantity: number;
}

export interface InventoryRepositoryPort {
  reserveAtomic(items: ReserveItemInput[]): Promise<void>;
  create(input: CreateInventoryItemInput): Promise<InventoryItem>;
  findAll(): Promise<InventoryItem[]>;
  findById(id: string): Promise<InventoryItem | null>;
  update(input: UpdateInventoryItemInput): Promise<InventoryItem | null>;
  deleteById(id: string): Promise<boolean>;
}
