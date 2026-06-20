import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import SectionTitle from "../components/SectionTitle";
import Button from "../components/Button";
import AnimatedContainer from "../components/AnimatedContainer";
import ServiceCard, { ServiceCardData } from "../components/ServiceCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { fetchPublicServices, queryKeys } from "../services/adminApi";
import { getApiErrorMessage } from "../services/api";
import useParallax from "../hooks/useParallax";

const Home = () => {
  const { ref: heroRef, y, opacity } = useParallax();

  const {
    data: rawServices,
    isLoading: isLoadingServices,
    error: servicesError,
  } = useQuery({
    queryKey: [...queryKeys.publicServices],
    queryFn: fetchPublicServices,
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

  return (
    <div className="space-y-20 pb-20">
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
              Nơi Suối Tóc Kể Câu Chuyện<br/>Của Riêng Bạn
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

      <section className="mx-auto max-w-6xl space-y-10 px-4">
        <SectionTitle
          eyebrow="The Menu Của Cảm Xúc"
          title="Hành Trình Đánh Thức Vẻ Đẹp"
          description="Mỗi dịch vụ tại Dương Chí được thiết kế tỉ mỉ để nuông chiều bản thân và đánh thức khí chất riêng biệt của bạn."
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
    </div>
  );
};

export default Home;
