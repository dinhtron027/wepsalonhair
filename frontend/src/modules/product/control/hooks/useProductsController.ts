import { useQuery } from "@tanstack/react-query";
import { productService } from "../../../../app/control/di/container";

export const useProductsController = () => {
  const productsQuery = useQuery({
    queryKey: ["public-products-instances"],
    queryFn: () => productService.listPublicProducts(),
  });

  return {
    products: productsQuery.data || [],
    isLoading: productsQuery.isLoading,
    error: productsQuery.error,
  };
};
