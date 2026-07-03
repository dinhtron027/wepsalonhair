import api from "../../../services/api";
import { AuthService } from "../../../modules/auth/control/services/AuthService";
import { ProductService } from "../../../modules/product/control/services/ProductService";
import { LocalStorageAdapter } from "../../../shared/control/storage/LocalStorageAdapter";

const storage = new LocalStorageAdapter();

export const authService = new AuthService(api, storage);
export const productService = new ProductService(api);
