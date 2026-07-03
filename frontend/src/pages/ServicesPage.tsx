import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useEffect } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import { fetchPublicServices, queryKeys } from "../services/adminApi";
import { getApiErrorMessage } from "../services/api";
import SectionTitle from "../components/SectionTitle";
import Button from "../components/Button";
import ServiceImage from "../components/ServiceImage";
import useSEO from "../hooks/useSEO";


const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

const ServicesPage = () => {
  useSEO({
    title: "Dịch Vụ Tóc Chuyên Nghiệp — Salon Dương Chi",
    description:
      "Khám phá các dịch vụ cắt, uốn, nhuộm, duỗi, phục hồi tóc và gội đầu dưỡng sinh cao cấp tại Salon Dương Chi, Lộc Ninh, Bình Phước.",
    canonical: "/services",
    ogUrl: "/services",
  });

  const { data: services, isLoading, error } = useQuery({
    queryKey: [...queryKeys.publicServices],
    queryFn: fetchPublicServices,
  });

  useEffect(() => {
    if (!error) {
      return;
    }

    toast.error(getApiErrorMessage(error, "Ái chà, đường truyền vừa chợp mắt. Bạn thử lại nhé."));
  }, [error]);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-8">
      <div className="mb-16">
        <SectionTitle
          eyebrow="Dương Chi Salon"
          title="Trải Nghiệm & Cảm Xúc"
          description="Khám phá các liệu trình thiết kế tóc và chăm sóc da đầu cao cấp được chuẩn hóa cho phong cách của riêng bạn."
          align="center"
        />
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-neutral-200/60 bg-white/80 p-16 flex justify-center items-center shadow-sm">
          <LoadingSpinner label="Đang tải danh mục dịch vụ..." size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {(services || []).map((service) => (
            <article
              key={service._id}
              className="group relative overflow-hidden rounded-2xl border border-neutral-200/60 bg-white p-5 transition-all duration-300 hover:shadow-md hover:border-neutral-300/80 flex flex-col justify-between"
            >
              <div>
                <div className="overflow-hidden rounded-xl mb-4.5 aspect-[16/10] bg-slate-50 border border-neutral-100 relative">
                  <ServiceImage
                    src={service.imageUrl || service.image}
                    alt={service.name}
                    className="grayscale-[15%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500 ease-out"
                    aspectRatio="h-full w-full"
                  />
                </div>
                <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-taupe mb-1.5">{service.category}</p>
                <h2 className="mb-2 text-xl font-display text-charcoal font-normal group-hover:text-taupe transition-colors duration-300">
                  {service.name}
                </h2>
                <p className="mb-5 text-xs text-slate-400 font-light leading-relaxed min-h-[50px]">
                  {service.description || "Liệu trình chăm sóc tóc tận tâm chuyên nghiệp bởi đội ngũ stylist Dương Chi."}
                </p>
              </div>

              <div>
                <div className="mb-5 flex items-center justify-between border-t border-b border-neutral-100 py-3 text-xs text-slate-500 font-light">
                  <span>Giá: <span className="font-semibold text-charcoal">{formatCurrency(service.price || 0)}</span></span>
                  <span>Thời gian: <span className="font-medium text-charcoal">{service.durationMinutes || 0} phút</span></span>
                </div>
                <Button
                  to={`/services/${service._id}`}
                  variant="ghost"
                  className="w-full justify-center items-center rounded-full border border-neutral-200 text-xs font-medium text-slate-700 py-2 hover:bg-charcoal hover:text-white hover:border-charcoal transition-all duration-300"
                >
                  Khám Phá Trải Nghiệm
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      {!isLoading && (services || []).length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/30 p-12 text-center text-slate-400 text-sm">
          Chưa có dịch vụ nào xuất hiện ở đây cả, nhưng đừng lo, chúng sẽ sớm được cập nhật.
        </div>
      ) : null}
    </div>
  );
};

export default ServicesPage;
