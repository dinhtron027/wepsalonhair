import { motion } from "framer-motion";
import { ArrowRight, ShoppingBag } from "lucide-react";
import Button from "./Button";
import { ProductEntity } from "../store/useCartStore";

type ProductCardProps = {
  product: ProductEntity;
  onAddToCart: (product: ProductEntity) => void;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const productId = product._id || product.id || "";
  const isOutOfStock = typeof product.stock === "number" && product.stock <= 0;

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group flex flex-col overflow-hidden rounded-3xl border border-rose-100 bg-white/90 shadow-lg shadow-rose-100 backdrop-blur-xl"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <motion.img
          src={product.image || "https://placehold.co/600x400?text=San+pham"}
          alt={product.name}
          className="h-full w-full object-cover"
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.35 }}
        />
        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow">
          {product.category || "San pham"}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-slate-900 md:text-xl">{product.name}</h3>
          <p className="text-sm text-slate-600 line-clamp-2">
            {product.shortDescription || product.description || "San pham cham soc toc chinh hang."}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold text-rose-600 md:text-xl">{formatCurrency(product.price)}</div>
          <div className={`text-sm ${isOutOfStock ? "text-red-500" : "text-slate-500"}`}>
            {isOutOfStock ? "Het hang" : `Con ${product.stock ?? "-"} san pham`}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {productId ? (
            <Button to={`/products/${productId}`} variant="ghost" className="gap-2 px-4 py-2 text-xs md:text-sm">
              Xem chi tiet
              <ArrowRight size={16} />
            </Button>
          ) : null}
          <Button
            onClick={() => onAddToCart(product)}
            variant="primary"
            className="gap-2 px-4 py-2 text-xs md:text-sm"
          >
            <ShoppingBag size={16} />
            Them vao gio
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
