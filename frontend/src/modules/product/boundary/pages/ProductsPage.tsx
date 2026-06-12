import { useEffect } from "react";
import toast from "react-hot-toast";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import { getApiErrorMessage } from "../../../../services/api";
import useCartStore from "../../../../store/useCartStore";
import { useProductsController } from "../../control/hooks/useProductsController";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

const ProductsPage = () => {
  const addToCart = useCartStore((state) => state.addToCart);
  const { products, isLoading, error } = useProductsController();

  useEffect(() => {
    if (!error) {
      return;
    }

    toast.error(getApiErrorMessage(error, "That bai: Khong the tai san pham"));
  }, [error]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-10 text-center text-4xl font-bold text-rose-500">San pham cua chung toi</h1>

      {isLoading ? (
        <div className="rounded-3xl border border-rose-100 bg-white/80 p-10">
          <LoadingSpinner label="Dang tai san pham..." size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
          {products.map((product) => (
            <article
              key={product.id}
              className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm transition hover:shadow-lg"
            >
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="mb-4 h-48 w-full rounded-xl object-cover"
                />
              ) : null}
              <h2 className="mb-1 text-lg font-semibold">{product.name}</h2>
              <p className="mb-4 text-sm text-slate-500">{product.category || "Cham soc toc"}</p>
              <p className="mb-4 font-bold text-rose-500">{formatCurrency(product.price)}</p>
              <button
                onClick={() => {
                  addToCart(product.toDTO());
                  toast.success("Thanh cong: Da them vao gio");
                }}
                className="w-full rounded-lg bg-rose-50 py-2 font-semibold text-rose-600 transition hover:bg-rose-100"
              >
                Them vao gio
              </button>
            </article>
          ))}
        </div>
      )}

      {!isLoading && products.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-rose-200 bg-rose-50 p-6 text-center text-slate-600">
          Chua co san pham nao.
        </div>
      ) : null}
    </div>
  );
};

export default ProductsPage;
