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
    <div className="min-h-screen bg-[#FAF9F8]">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-neutral-200/60 bg-white py-16 md:py-20">
        <div className="relative mx-auto max-w-6xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              <Sparkles size={12} strokeWidth={1.5} />
              <span>Sản phẩm chăm sóc tóc cao cấp</span>
            </div>
            <h1 className="font-display text-4xl font-normal text-charcoal md:text-5xl tracking-tight">Cửa Hàng Sản Phẩm</h1>
            <p className="mx-auto max-w-xl text-sm leading-relaxed text-slate-500">
              Khám phá bộ sưu tập sản phẩm chăm sóc tóc chuyên nghiệp từ Salon Dương Chi — được chọn lọc kỹ lưỡng cho từng loại tóc.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-6 py-10">
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
              className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                selectedCategory === ""
                  ? "bg-charcoal text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-500 hover:border-slate-400 hover:text-slate-950"
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
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                    selectedCategory === cat
                      ? "bg-charcoal text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-500 hover:border-slate-400 hover:text-slate-950"
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
          <div className="rounded-xl border border-slate-200/60 bg-white p-16 text-center shadow-sm">
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
                    className="group relative flex flex-col overflow-hidden rounded-xl border border-neutral-200/60 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-neutral-300/80 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
                  >
                    {/* Product Image */}
                    <Link to={`/products/${product.id}`} className="relative block aspect-[4/3] overflow-hidden bg-slate-50 border-b border-slate-100">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="text-slate-300" size={40} strokeWidth={1.5} />
                        </div>
                      )}
                      {/* Badges */}
                      <div className="absolute left-3 top-3 flex flex-col gap-1.5">
                        {isOutOfStock && (
                          <span className="rounded bg-slate-900/80 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur-sm">
                            Hết hàng
                          </span>
                        )}
                        {!isOutOfStock && isLowStock && (
                          <span className="rounded bg-amber-400/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-900 backdrop-blur-sm">
                            Sắp hết
                          </span>
                        )}
                      </div>
                    </Link>

                    {/* Product Info */}
                    <div className="flex flex-1 flex-col p-5">
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-taupe">
                        {(CATEGORY_LABELS[product.category] ?? product.category) || "Chăm sóc tóc"}
                      </p>
                      <Link
                        to={`/products/${product.id}`}
                        className="mb-2 line-clamp-2 text-sm font-semibold text-slate-900 transition-colors hover:text-slate-600"
                      >
                        {product.name}
                      </Link>
                      {product.description && (
                        <p className="mb-4 line-clamp-2 text-xs text-slate-500 leading-relaxed">
                          {product.description}
                        </p>
                      )}

                      <div className="mt-auto pt-4 border-t border-slate-50">
                        <p className="mb-3 text-base font-semibold text-slate-900">
                          {formatCurrency(product.price)}
                        </p>
                        <button
                          disabled={isOutOfStock}
                          onClick={() => {
                            addToCart(product.toDTO());
                            toast.success(`Đã thêm "${product.name}" vào giỏ hàng`);
                          }}
                          className={`flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                            isOutOfStock
                              ? "cursor-not-allowed bg-slate-50 text-slate-400"
                              : "bg-charcoal text-white hover:bg-black active:scale-95 shadow-sm"
                          }`}
                        >
                          <ShoppingBag size={14} strokeWidth={1.5} />
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
            className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center"
          >
            <Package className="mx-auto mb-3 text-slate-300" size={40} strokeWidth={1.5} />
            <p className="text-sm font-medium text-slate-500">
              {selectedCategory
                ? `Không có sản phẩm nào trong danh mục này`
                : "Chưa có sản phẩm nào"}
            </p>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory("")}
                className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-600 hover:text-slate-900 underline underline-offset-4"
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
            className="mt-14 overflow-hidden rounded-2xl border border-neutral-200/60 bg-white p-8 md:p-12 hover:border-neutral-300/80 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300"
          >
            <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-taupe">Ưu đãi đặc biệt</p>
                <h3 className="text-2xl font-normal text-charcoal font-display md:text-3xl leading-tight">Đặt lịch ngay, nhận ưu đãi!</h3>
                <p className="max-w-md text-sm text-slate-500 leading-relaxed">
                  Kết hợp dịch vụ tại salon và mua sản phẩm chăm sóc về nhà để tóc luôn đẹp.
                </p>
              </div>
              <Link
                to="/booking"
                className="flex shrink-0 items-center gap-2 rounded-full bg-charcoal px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition hover:bg-black active:scale-95"
              >
                Đặt lịch ngay <ArrowRight size={14} strokeWidth={1.5} />
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
