import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingBag, Package, Star } from "lucide-react";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";
import useCartStore, { ProductEntity } from "../store/useCartStore";
import api, { extractApiData, getApiErrorMessage } from "../services/api";

type ProductResponse = {
  _id: string;
  name: string;
  price: number;
  description: string;
  stock: number;
  image: string;
  imageUrl?: string;
  category: string;
  isActive: boolean;
  lowStockThreshold?: number;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

const CATEGORY_LABELS: Record<string, string> = {
  "dau-goi": "Dầu gội",
  "dau-xa": "Dầu xả",
  "phuc-hoi": "Phục hồi tóc",
  "keo-sap": "Keo & Sáp",
  "nhuom": "Nhuộm tóc",
  "duong-am": "Dưỡng ẩm",
};

const mapApiProduct = (item: ProductResponse): ProductEntity => {
  const finalImage = item.imageUrl || item.image;
  return {
    _id: item._id,
    id: item._id,
    name: item.name,
    price: item.price,
    description: item.description,
    shortDescription: item.description,
    stock: item.stock,
    image: finalImage,
    imageUrl: finalImage,
    category: item.category,
    isActive: item.isActive,
  };
};

const ProductDetailPage = () => {
  // Route dùng param `:id` là MongoDB ObjectId
  const { slug: id } = useParams<{ slug: string }>();
  const { addToCart } = useCartStore();
  const [product, setProduct] = useState<ProductEntity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const loadDetail = async () => {
      if (!id) {
        setProduct(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await api.get(`/api/products/${id}`);
        const payload = extractApiData<ProductResponse>(response);
        setProduct(mapApiProduct(payload));
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Không thể tải chi tiết sản phẩm"));
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadDetail();
  }, [id]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-20 text-center">
        <LoadingSpinner size="lg" label="Đang tải sản phẩm..." />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-24 text-center space-y-6">
        <Package className="mx-auto mb-2 text-slate-300" size={48} strokeWidth={1.5} />
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-taupe">Không tìm thấy</p>
          <h1 className="text-3xl font-normal text-charcoal font-display">Sản phẩm không tồn tại</h1>
          <p className="text-sm text-slate-500">Sản phẩm có thể đã bị xóa hoặc đường dẫn không đúng.</p>
        </div>
        <div className="pt-4">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 active:scale-98"
          >
            <ArrowLeft size={16} strokeWidth={1.5} /> Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  const isOutOfStock = typeof product.stock === "number" && product.stock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error("Sản phẩm đã hết hàng");
      return;
    }
    addToCart(product, quantity);
    toast.success(`Đã thêm ${quantity} "${product.name}" vào giỏ hàng`);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F8] pb-20">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-neutral-200/60 bg-white">
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-14 md:grid-cols-2 md:py-20">
          {/* Left: Info */}
          <div className="flex flex-col justify-center space-y-6">
            <Link
              to="/products"
              className="inline-flex w-fit items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft size={14} strokeWidth={2} /> Quay lại sản phẩm
            </Link>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-taupe">
                {(CATEGORY_LABELS[product.category ?? ""] ?? product.category) || "Sản phẩm"}
              </p>
              <h1 className="font-display text-3xl font-normal text-charcoal md:text-4xl leading-tight">
                {product.name}
              </h1>
            </div>

            {product.description && (
              <p className="text-slate-600 text-sm leading-relaxed">{product.description}</p>
            )}

            {/* Price & Stock */}
            <div className="flex items-center gap-6 rounded-xl border border-slate-200 bg-slate-50/50 px-5 py-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Giá bán</p>
                <p className="text-2xl font-semibold text-charcoal">{formatCurrency(product.price)}</p>
              </div>
              <div className="h-12 w-px bg-slate-200" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Tồn kho</p>
                <p
                  className={`text-sm font-semibold ${
                    isOutOfStock ? "text-red-500" : "text-emerald-600"
                  }`}
                >
                  {isOutOfStock
                    ? "Hết hàng"
                    : typeof product.stock === "number"
                    ? `${product.stock} sản phẩm`
                    : "Đang cập nhật"}
                </p>
              </div>
            </div>

            {/* Rating placeholder */}
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={14} className="fill-amber-400 text-amber-400" />
              ))}
              <span className="ml-1 text-xs text-slate-500 font-medium">(Sản phẩm chính hãng)</span>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {!isOutOfStock && (
                <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-1 py-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-xs font-semibold text-slate-800">{quantity}</span>
                  <button
                    onClick={() =>
                      setQuantity((q) =>
                        typeof product.stock === "number" ? Math.min(product.stock, q + 1) : q + 1
                      )
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors"
                  >
                    +
                  </button>
                </div>
              )}

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex items-center gap-2 rounded-full px-6 py-3 text-xs font-semibold uppercase tracking-wider transition-all ${
                  isOutOfStock
                    ? "cursor-not-allowed bg-slate-50 text-slate-400"
                    : "bg-charcoal text-white hover:bg-black active:scale-95 shadow-sm"
                }`}
              >
                <ShoppingBag size={14} strokeWidth={1.5} />
                {isOutOfStock ? "Hết hàng" : "Thêm vào giỏ"}
              </button>

              <Link
                to="/cart"
                className="rounded-full border border-slate-200 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600 transition hover:bg-slate-50 active:scale-95"
              >
                Xem giỏ hàng
              </Link>
            </div>
          </div>

          {/* Right: Image */}
          <motion.div
            className="relative flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45 }}
          >
            <div className="relative h-full w-full overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-sm aspect-[4/3]">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-50">
                  <Package className="text-slate-300" size={48} strokeWidth={1.5} />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Back CTA */}
      <div className="mx-auto mt-10 max-w-6xl px-6">
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={14} strokeWidth={2} /> Tiếp tục mua sắm
        </Link>
      </div>
    </div>
  );
};

export default ProductDetailPage;
