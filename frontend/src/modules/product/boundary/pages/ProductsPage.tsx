import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ArrowRight, Package, Sparkles } from "lucide-react";
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

const CATEGORY_LABELS: Record<string, string> = {
  "": "Tất cả",
  "dau-goi": "Dầu gội",
  "dau-xa": "Dầu xả",
  "phuc-hoi": "Phục hồi tóc",
  "keo-sap": "Keo & Sáp",
  "nhuom": "Nhuộm tóc",
  "duong-am": "Dưỡng ẩm",
};

const ProductsPage = () => {
  const addToCart = useCartStore((state) => state.addToCart);
  const { products, isLoading, error } = useProductsController();
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    if (!error) return;
    toast.error(getApiErrorMessage(error, "Không thể tải danh sách sản phẩm"));
  }, [error]);

  // Trích xuất danh mục unique từ sản phẩm
  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
    return cats;
  }, [products]);

  // Lọc sản phẩm theo danh mục
  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return products;
    return products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/40 via-white to-amber-50/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-600 via-rose-500 to-amber-500 py-16 md:py-20">
        <div className="absolute inset-0">
          <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full bg-amber-300/20 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mx-auto mb-4 flex w-fit items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
              <Sparkles size={14} />
              <span>Sản phẩm chăm sóc tóc cao cấp</span>
            </div>
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">Cửa Hàng Sản Phẩm</h1>
            <p className="mx-auto max-w-xl text-rose-100">
              Khám phá bộ sưu tập sản phẩm chăm sóc tóc chuyên nghiệp từ Salon Dương Chi — được chọn lọc kỹ lưỡng cho từng loại tóc.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Category Filter */}
        {!isLoading && categories.length > 0 && (
          <motion.div
            className="mb-8 flex flex-wrap items-center gap-2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <button
              onClick={() => setSelectedCategory("")}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
                selectedCategory === ""
                  ? "bg-rose-500 text-white shadow-md shadow-rose-200"
                  : "border border-rose-100 bg-white text-slate-600 hover:border-rose-300 hover:text-rose-600"
              }`}
            >
              Tất cả ({products.length})
            </button>
            {categories.map((cat) => {
              const count = products.filter((p) => p.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
                    selectedCategory === cat
                      ? "bg-rose-500 text-white shadow-md shadow-rose-200"
                      : "border border-rose-100 bg-white text-slate-600 hover:border-rose-300 hover:text-rose-600"
                  }`}
                >
                  {CATEGORY_LABELS[cat] ?? cat} ({count})
                </button>
              );
            })}
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="rounded-3xl border border-rose-100 bg-white/80 p-16 text-center shadow-sm">
            <LoadingSpinner label="Đang tải sản phẩm..." size="lg" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            >
              {filteredProducts.map((product, index) => {
                const isOutOfStock = product.stock <= 0;
                const isLowStock = product.isLowStock();

                return (
                  <motion.article
                    key={product.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04, duration: 0.3 }}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-rose-100/60 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-100"
                  >
                    {/* Product Image */}
                    <Link to={`/products/${product.id}`} className="relative block aspect-[4/3] overflow-hidden bg-rose-50">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="text-rose-200" size={48} />
                        </div>
                      )}
                      {/* Badges */}
                      <div className="absolute left-3 top-3 flex flex-col gap-1.5">
                        {isOutOfStock && (
                          <span className="rounded-full bg-slate-700/80 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
                            Hết hàng
                          </span>
                        )}
                        {!isOutOfStock && isLowStock && (
                          <span className="rounded-full bg-amber-400/90 px-2.5 py-0.5 text-xs font-semibold text-amber-900 backdrop-blur-sm">
                            Sắp hết
                          </span>
                        )}
                      </div>
                    </Link>

                    {/* Product Info */}
                    <div className="flex flex-1 flex-col p-4">
                      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-rose-400">
                        {(CATEGORY_LABELS[product.category] ?? product.category) || "Chăm sóc tóc"}
                      </p>
                      <Link
                        to={`/products/${product.id}`}
                        className="mb-1 line-clamp-2 text-sm font-semibold text-slate-800 hover:text-rose-600"
                      >
                        {product.name}
                      </Link>
                      {product.description && (
                        <p className="mb-3 line-clamp-2 text-xs text-slate-500">
                          {product.description}
                        </p>
                      )}

                      <div className="mt-auto">
                        <p className="mb-3 text-lg font-bold text-rose-600">
                          {formatCurrency(product.price)}
                        </p>
                        <button
                          disabled={isOutOfStock}
                          onClick={() => {
                            addToCart(product.toDTO());
                            toast.success(`Đã thêm "${product.name}" vào giỏ hàng`);
                          }}
                          className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all ${
                            isOutOfStock
                              ? "cursor-not-allowed bg-slate-100 text-slate-400"
                              : "bg-rose-500 text-white hover:bg-rose-600 active:scale-95"
                          }`}
                        >
                          <ShoppingBag size={15} />
                          {isOutOfStock ? "Hết hàng" : "Thêm vào giỏ"}
                        </button>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Empty State */}
        {!isLoading && filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 rounded-2xl border border-dashed border-rose-200 bg-rose-50 p-12 text-center"
          >
            <Package className="mx-auto mb-3 text-rose-300" size={48} />
            <p className="font-medium text-slate-600">
              {selectedCategory
                ? `Không có sản phẩm nào trong danh mục này`
                : "Chưa có sản phẩm nào"}
            </p>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory("")}
                className="mt-3 text-sm font-semibold text-rose-500 hover:text-rose-600"
              >
                Xem tất cả sản phẩm
              </button>
            )}
          </motion.div>
        )}

        {/* CTA Banner */}
        {!isLoading && products.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-14 overflow-hidden rounded-3xl bg-gradient-to-r from-rose-500 to-amber-500 p-8 text-white shadow-xl shadow-rose-200 md:p-12"
          >
            <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium text-rose-100">Ưu đãi đặc biệt</p>
                <h3 className="mt-1 text-2xl font-bold md:text-3xl">Đặt lịch ngay, nhận ưu đãi!</h3>
                <p className="mt-2 max-w-md text-rose-100">
                  Kết hợp dịch vụ tại salon và mua sản phẩm chăm sóc về nhà để tóc luôn đẹp.
                </p>
              </div>
              <Link
                to="/booking"
                className="flex shrink-0 items-center gap-2 rounded-2xl bg-white px-6 py-3 font-semibold text-rose-600 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                Đặt lịch ngay <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
