import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ShoppingBag, ArrowRight, Package } from "lucide-react";
import SectionTitle from "../components/SectionTitle";
import Button from "../components/Button";
import AnimatedContainer from "../components/AnimatedContainer";
import ServiceCard, { ServiceCardData } from "../components/ServiceCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { fetchPublicServices, fetchPublicProducts, queryKeys } from "../services/adminApi";
import { getApiErrorMessage } from "../services/api";
import useCartStore from "../store/useCartStore";
import useParallax from "../hooks/useParallax";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

const Home = () => {
  const { ref: heroRef, y, opacity } = useParallax();
  const addToCart = useCartStore((state) => state.addToCart);

  const {
    data: rawServices,
    isLoading: isLoadingServices,
    error: servicesError,
  } = useQuery({
    queryKey: [...queryKeys.publicServices],
    queryFn: fetchPublicServices,
  });

  const {
    data: rawProducts,
    isLoading: isLoadingProducts,
  } = useQuery({
    queryKey: [...queryKeys.publicProducts],
    queryFn: fetchPublicProducts,
  });

  if (servicesError) {
    toast.error(getApiErrorMessage(servicesError, "Ái chà, đường truyền vừa chợp mắt. Bạn thử lại nhé."));
  }

  const services: ServiceCardData[] = (rawServices || []).map((item) => ({
    _id: item._id,
    name: item.name,
    category: item.category,
    price: item.price,
    description: item.description,
    image: item.image || "",
    durationMinutes: item.durationMinutes,
  }));

  // Chỉ lấy 4 sản phẩm đầu để hiển thị trên trang chủ
  const featuredProducts = (rawProducts || []).slice(0, 4);

  return (
    <div className="space-y-20 pb-20">
      {/* Hero */}
      <section ref={heroRef} className="relative min-h-[70vh] overflow-hidden">
        <motion.img
          src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1800&q=80"
          alt="Salon hero"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ y, opacity }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-rose-100/70 via-white/70 to-white" />
        <div className="relative mx-auto flex min-h-[70vh] max-w-6xl items-center px-4">
          <div className="max-w-2xl space-y-6">
            <p className="text-xs uppercase tracking-[0.35em] text-rose-500">ĐÁNH THỨC VẺ ĐẸP ĐỘC BẢN</p>
            <h1 className="text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">
              Nơi Suối Tóc Kể Câu Chuyện<br className="hidden md:inline" />Của Riêng Bạn
            </h1>
            <p className="text-lg text-slate-700">
              Tận hưởng không gian thư giãn tuyệt đối và để những chuyên gia của chúng tôi thiết kế nên mái tóc tôn vinh trọn vẹn đường nét thanh tú trên khuôn mặt bạn.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button to="/booking" variant="primary">
                Tỏa Sáng Ngay Hôm Nay
              </Button>
              <Button to="/services" variant="ghost">
                Khám Phá Dịch Vụ
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="mx-auto max-w-6xl space-y-10 px-4">
        <SectionTitle
          eyebrow="The Menu Của Cảm Xúc"
          title="Hành Trình Đánh Thức Vẻ Đẹp"
          description="Mỗi dịch vụ tại Dương Chi được thiết kế tỉ mỉ để nuông chiều bản thân và đánh thức khí chất riêng biệt của bạn."
        />

        {isLoadingServices ? (
          <div className="rounded-3xl border border-rose-100 bg-white/80 p-10">
            <LoadingSpinner label="Đang dệt nên điều chờ đợi..." size="lg" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.slice(0, 6).map((service, idx) => (
              <AnimatedContainer key={service._id || idx} delay={idx * 0.05}>
                <ServiceCard service={service} />
              </AnimatedContainer>
            ))}
          </div>
        )}

        {!isLoadingServices && services.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-rose-200 bg-rose-50/60 p-6 text-center text-slate-600">
            Danh sách hiện đang tĩnh lặng. Chưa có dịch vụ nào xuất hiện ở đây cả.
          </div>
        ) : null}

        <div className="flex justify-center">
          <Button to="/services" variant="ghost">
            Xem tất cả dịch vụ
          </Button>
        </div>
      </section>

      {/* Featured Products Section */}
      {(isLoadingProducts || featuredProducts.length > 0) && (
        <section className="mx-auto max-w-6xl px-4">
          <div className="flex items-end justify-between">
            <SectionTitle
              eyebrow="Cửa Hàng"
              title="Sản Phẩm Nổi Bật"
              description="Những sản phẩm chăm sóc tóc được các chuyên gia khuyên dùng, giúp mái tóc luôn đẹp mọi ngày."
            />
            <Link
              to="/products"
              className="mb-1 hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-rose-500 hover:text-rose-600 md:flex"
            >
              Xem tất cả <ArrowRight size={15} />
            </Link>
          </div>

          {isLoadingProducts ? (
            <div className="mt-6 rounded-3xl border border-rose-100 bg-white/80 p-10">
              <LoadingSpinner label="Đang tải sản phẩm..." size="lg" />
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product, idx) => {
                const isOutOfStock = (product.stock ?? 1) <= 0;
                return (
                  <AnimatedContainer key={product._id} delay={idx * 0.05}>
                    <div className="group flex flex-col overflow-hidden rounded-2xl border border-rose-100/60 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-rose-100">
                      <Link to={`/products/${product._id}`} className="relative block aspect-[4/3] overflow-hidden bg-rose-50">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Package className="text-rose-200" size={40} />
                          </div>
                        )}
                        {isOutOfStock && (
                          <span className="absolute left-3 top-3 rounded-full bg-slate-700/80 px-2.5 py-0.5 text-xs font-semibold text-white">
                            Hết hàng
                          </span>
                        )}
                      </Link>
                      <div className="flex flex-1 flex-col p-4">
                        <p className="mb-1 text-xs font-medium uppercase tracking-wider text-rose-400">
                          {product.category || "Chăm sóc tóc"}
                        </p>
                        <Link
                          to={`/products/${product._id}`}
                          className="mb-2 line-clamp-2 text-sm font-semibold text-slate-800 hover:text-rose-600"
                        >
                          {product.name}
                        </Link>
                        <div className="mt-auto flex items-center justify-between">
                          <span className="font-bold text-rose-600">{formatCurrency(product.price)}</span>
                          <button
                            disabled={isOutOfStock}
                            onClick={() => {
                              addToCart(product);
                              toast.success(`Đã thêm "${product.name}" vào giỏ`);
                            }}
                            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                              isOutOfStock
                                ? "cursor-not-allowed bg-slate-100 text-slate-400"
                                : "bg-rose-500 text-white hover:bg-rose-600"
                            }`}
                          >
                            <ShoppingBag size={13} />
                            {isOutOfStock ? "Hết" : "Thêm"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </AnimatedContainer>
                );
              })}
            </div>
          )}

          <div className="mt-8 flex justify-center md:hidden">
            <Button to="/products" variant="ghost">
              Xem tất cả sản phẩm
            </Button>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
