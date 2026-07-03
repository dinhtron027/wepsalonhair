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
import useSEO from "../hooks/useSEO";
import { optimizeCloudinaryUrl } from "../utils/cloudinary";

// Optimized Unsplash URLs (WebP, kích thước phù hợp)
const HERO_IMG_MOBILE =
  "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=75&fm=webp";
const HERO_IMG_DESKTOP =
  "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80&fm=webp";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

const Home = () => {
  const { ref: heroRef, y, opacity } = useParallax();
  const addToCart = useCartStore((state) => state.addToCart);

  // SEO cho trang chủ
  useSEO({
    title: "Salon Dương Chi — Cắt, Uốn, Nhuộm & Chăm Sóc Tóc Chuyên Nghiệp",
    description:
      "Salon Dương Chi cung cấp dịch vụ cắt, uốn, nhuộm, duỗi, phục hồi tóc và gội đầu dưỡng sinh cao cấp tại Lộc Ninh, Bình Phước. Đặt lịch ngay hôm nay!",
    canonical: "/",
    ogUrl: "/",
  });

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
    imageUrl: item.imageUrl || "",
    durationMinutes: item.durationMinutes,
  }));

  // Chỉ lấy 4 sản phẩm đầu để hiển thị trên trang chủ
  const featuredProducts = (rawProducts || []).slice(0, 4);

  return (
    <div className="space-y-24 pb-24">
      {/* Hero */}
      <section ref={heroRef} className="relative min-h-0 md:min-h-[85vh] flex items-center overflow-hidden pt-20 pb-16 md:py-0">
        {/* Mobile hero background */}
        <div className="absolute inset-0 md:hidden">
          <motion.img
            src={HERO_IMG_MOBILE}
            alt="Không gian Salon Dương Chi"
            className="h-full w-full object-cover"
            style={{ opacity }}
            width={800}
            height={600}
            // fetchpriority="high" — không lazy, đây là LCP element
            loading="eager"
          />
          <div className="absolute inset-0 bg-cream/90 backdrop-blur-md" />
        </div>

        <div className="mx-auto flex w-full max-w-7xl flex-col-reverse items-center px-6 md:flex-row md:py-20">
          <div className="relative z-10 w-full pt-8 md:w-1/2 md:pr-16 md:pt-0">
            <h1 className="font-display text-5xl leading-[1.1] text-charcoal md:text-6xl lg:text-7xl">
              Nơi Suối Tóc<br /> Kể Câu Chuyện<br /> Của Riêng Bạn
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-slate-600">
              Tận hưởng không gian thư giãn tuyệt đối và để chuyên gia của chúng tôi thiết kế nên mái tóc tôn vinh trọn vẹn khí chất của bạn.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button to="/booking" variant="primary">
                Đặt lịch ngay
              </Button>
              <Button to="/services" variant="ghost">
                Khám phá dịch vụ
              </Button>
            </div>
          </div>

          {/* Desktop hero image — LCP element */}
          <div className="hidden md:block relative h-[50vh] w-full overflow-hidden rounded-2xl md:h-[70vh] md:w-1/2">
            <motion.img
              src={HERO_IMG_DESKTOP}
              alt="Không gian Salon Dương Chi — cắt uốn nhuộm tóc chuyên nghiệp"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ y }}
              width={1200}
              height={900}
              // fetchpriority="high" — LCP element, không lazy-load
              loading="eager"
              decoding="async"
            />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="mx-auto max-w-7xl space-y-12 px-6">
        <SectionTitle
          title="Hành Trình Đánh Thức Vẻ Đẹp"
          description="Mỗi dịch vụ tại Dương Chi được thiết kế tỉ mỉ để nuông chiều bản thân và đánh thức khí chất riêng biệt của bạn."
        />

        {isLoadingServices ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-100 bg-white p-10">
            <LoadingSpinner label="Đang tải dịch vụ..." size="lg" />
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
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center text-slate-500">
            Danh sách hiện đang tĩnh lặng. Chưa có dịch vụ nào xuất hiện ở đây cả.
          </div>
        ) : null}

        <div className="flex justify-center pt-4">
          <Button to="/services" variant="ghost">
            Xem tất cả dịch vụ
          </Button>
        </div>
      </section>

      {/* Featured Products Section */}
      {(isLoadingProducts || featuredProducts.length > 0) && (
        <section className="mx-auto max-w-7xl px-6">
          <div className="relative mb-10 flex items-center justify-center">
            <SectionTitle
              title="Sản Phẩm Khuyên Dùng"
              description="Những sản phẩm chăm sóc tóc được chuyên gia lựa chọn, giúp duy trì vẻ đẹp tinh tế mỗi ngày."
            />
            <Link
              to="/products"
              className="absolute right-0 bottom-2 hidden shrink-0 items-center gap-1.5 text-sm font-medium text-slate-900 transition-colors hover:text-slate-600 md:flex"
            >
              Xem tất cả <ArrowRight size={15} strokeWidth={1.5} />
            </Link>
          </div>

          {isLoadingProducts ? (
            <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-100 bg-white p-10">
              <LoadingSpinner label="Đang tải sản phẩm..." size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product, idx) => {
                const isOutOfStock = (product.stock ?? 1) <= 0;
                return (
                  <AnimatedContainer key={product._id} delay={idx * 0.05}>
                    <div className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-100 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                      <Link to={`/products/${product._id}`} className="relative block aspect-[4/3] overflow-hidden bg-slate-50">
                        {product.image ? (
                          <img
                            src={optimizeCloudinaryUrl(product.image, 400)}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            loading="lazy"
                            width={400}
                            height={300}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Package className="text-slate-300" size={40} strokeWidth={1.5} />
                          </div>
                        )}
                        {isOutOfStock && (
                          <span className="absolute left-3 top-3 rounded-md bg-slate-900/80 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-white backdrop-blur-sm">
                            Hết hàng
                          </span>
                        )}
                      </Link>
                      <div className="flex flex-1 flex-col p-5">
                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          {product.category || "Chăm sóc tóc"}
                        </p>
                        <Link
                          to={`/products/${product._id}`}
                          className="mb-4 line-clamp-2 text-sm font-semibold leading-relaxed text-slate-900 transition-colors hover:text-slate-600"
                        >
                          {product.name}
                        </Link>
                        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                          <span className="font-semibold text-slate-900">{formatCurrency(product.price)}</span>
                          <button
                            disabled={isOutOfStock}
                            onClick={() => {
                              addToCart(product);
                              toast.success(`Đã thêm "${product.name}" vào giỏ`);
                            }}
                            className={`flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-medium transition-all ${
                              isOutOfStock
                                ? "cursor-not-allowed bg-slate-50 text-slate-400"
                                : "bg-slate-900 text-white hover:bg-black active:scale-95"
                            }`}
                          >
                            <ShoppingBag size={14} strokeWidth={1.5} />
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

          <div className="mt-10 flex justify-center md:hidden">
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
