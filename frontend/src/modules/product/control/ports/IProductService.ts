import type { Product } from "../../entity/Product";

export interface IProductService {
  listPublicProducts(): Promise<Product[]>;
}
