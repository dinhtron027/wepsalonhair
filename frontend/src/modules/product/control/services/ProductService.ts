import type { AxiosInstance } from "axios";
import { BaseApiService } from "../../../../shared/control/api/BaseApiService";
import { Product, type ProductDTO } from "../../entity/Product";
import type { IProductService } from "../ports/IProductService";

export class ProductService extends BaseApiService implements IProductService {
  constructor(http: AxiosInstance) {
    super(http);
  }

  public async listPublicProducts(): Promise<Product[]> {
    const rows = await this.get<ProductDTO[]>("/api/products");
    return rows.map((row) => Product.fromDTO(row));
  }
}
