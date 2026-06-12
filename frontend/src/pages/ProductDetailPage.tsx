import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../components/Button";
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
  category: string;
  isActive: boolean;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

const mapApiProduct = (item: ProductResponse): ProductEntity => ({
  _id: item._id,
  id: item._id,
  name: item.name,
  price: item.price,
  description: item.description,
  shortDescription: item.description,
  stock: item.stock,
  image: item.image,
  category: item.category,
  isActive: item.isActive,
});

const ProductDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCartStore();
  const [product, setProduct] = useState<ProductEntity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDetail = async () => {
      if (!slug) {
        setProduct(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await api.get(`/api/products/${slug}`);
        const payload = extractApiData<ProductResponse>(response);
        setProduct(mapApiProduct(payload));
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Khong the tai chi tiet san pham"));
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadDetail();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20">
        <LoadingSpinner size="lg" label="Dang tai chi tiet san pham..." />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-rose-400">Khong tim thay</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">San pham khong ton tai</h1>
        <div className="mt-6 flex justify-center gap-3">
          <Button to="/products" variant="primary">
            Quay lai danh sach
          </Button>
        </div>
      </div>
    );
  }

  const isOutOfStock = typeof product.stock === "number" && product.stock <= 0;

  return (
    <div className="space-y-14 pb-20">
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-white to-amber-50">
        <div className="absolute inset-0">
          <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-rose-100 blur-3xl" />
          <div className="absolute right-10 top-10 h-72 w-72 rounded-full bg-amber-100 blur-3xl" />
        </div>
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-16 md:grid-cols-2 md:py-20">
          <div className="space-y-4">
            <Link to="/products" className="inline-flex items-center gap-2 text-sm text-rose-500 hover:text-rose-600">
              <ArrowLeft size={16} /> Quay lai danh sach
            </Link>
            <p className="text-xs uppercase tracking-[0.3em] text-rose-400">{product.category || "San pham"}</p>
            <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">{product.name}</h1>
            <p className="text-slate-600">{product.description || "Khong co mo ta."}</p>
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-rose-400">Gia</p>
                <p className="text-3xl font-semibold text-rose-600">{formatCurrency(product.price)}</p>
              </div>
              <div className="h-12 w-px bg-rose-100" />
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-rose-400">Ton kho</p>
                <p className={`text-base font-semibold ${isOutOfStock ? "text-red-500" : "text-slate-800"}`}>
                  {isOutOfStock ? "Het hang" : product.stock ?? "Dang cap nhat"}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="primary"
                onClick={() => {
                  if (isOutOfStock) {
                    toast.error("San pham het hang");
                    return;
                  }
                  addToCart(product);
                  toast.success("Da them vao gio hang");
                }}
                className="gap-2"
              >
                <ShoppingBag size={16} /> Them vao gio hang
              </Button>
              <Button to="/cart" variant="ghost">
                Xem gio hang
              </Button>
            </div>
          </div>

          <motion.div
            className="relative overflow-hidden rounded-3xl border border-rose-100 bg-white/80 shadow-xl shadow-rose-100 backdrop-blur-xl"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <img src={product.image || "https://placehold.co/900x700?text=San+pham"} alt={product.name} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent" />
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetailPage;
