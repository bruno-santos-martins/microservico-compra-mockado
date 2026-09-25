export const INVENTORY_REPOSITORY_PORT = Symbol('INVENTORY_REPOSITORY_PORT');

export interface ReserveItemInput {
  productId: string;
  quantity: number;
}

export interface InventoryRepositoryPort {
  reserveAtomic(items: ReserveItemInput[]): Promise<void>;
}
