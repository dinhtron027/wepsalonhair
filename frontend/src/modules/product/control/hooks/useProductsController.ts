import { useQuery } from "@tanstack/react-query";
import { productService } from "../../../../app/control/di/container";
import { queryKeys } from "../../../../services/adminApi";

export const useProductsController = () => {
  const productsQuery = useQuery({
    queryKey: [...queryKeys.publicProducts],
    queryFn: () => productService.listPublicProducts(),
  });

  return {
    products: productsQuery.data || [],
    isLoading: productsQuery.isLoading,
    error: productsQuery.error,
  };
};
