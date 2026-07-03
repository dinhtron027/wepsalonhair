import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import SectionTitle from "../components/SectionTitle";
import AnimatedContainer from "../components/AnimatedContainer";
import LoadingSpinner from "../components/LoadingSpinner";
import api, { extractApiData, getApiErrorMessage } from "../services/api";
import Button from "../components/Button";
import ServiceImage from "../components/ServiceImage";
import useSEO from "../hooks/useSEO";

type Service = {
  _id: string;
  name: string;
  slug: string;
  category: string;
  categorySlug: string;
  description: string;
  price: number;
  duration: number;
  durationMinutes: number;
  image?: string;
  imageUrl?: string;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

// Defined order of categories for presentation
const CATEGORY_ORDER = [
  { slug: "haircut", name: "Cắt & Tạo Kiểu Nữ" },
  { slug: "perm", name: "Uốn Tóc Nữ" },
  { slug: "straightening", name: "Duỗi Tóc Nữ" },
  { slug: "color", name: "Nhuộm Tóc Nữ" },
  { slug: "treatment", name: "Phục Hồi Tóc" },
  { slug: "shampoo", name: "Gội Đầu Dưỡng Sinh" },
  { slug: "combo", name: "Combo Làm Đẹp" }
];

const Pricing = () => {
  useSEO({
    title: "Bảng Giá Dịch Vụ Tóc — Salon Dương Chi",
    description:
      "Bảng giá các dịch vụ cắt, uốn, nhuộm, duỗi, phục hồi tóc và gội đầu dưỡng sinh tại Salon Dương Chi, Lộc Ninh, Bình Phước. Giá tham khảo công khai rõ ràng.",
    canonical: "/pricing",
    ogUrl: "/pricing",
  });
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true);
      try {
        const response = await api.get("/api/services");
        const payload = extractApiData<unknown>(response);
        setServices(Array.isArray(payload) ? (payload as Service[]) : []);
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Ái chà, đường truyền vừa chợp mắt. Bạn thử lại nhé."));
        setServices([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Group services by categorySlug
  const groupedServices = CATEGORY_ORDER.map((cat) => {
    const catServices = services.filter(
      (s) => s.categorySlug === cat.slug || s.category === cat.name
    );
    return {
      ...cat,
      services: catServices
    };
  }).filter((group) => group.services.length > 0);

  return (
    <div className="mx-auto max-w-5xl space-y-12 px-4 pb-24 pt-8">
      <SectionTitle
        eyebrow="Bảng Giá Dịch Vụ"
        title="Nghệ Thuật Chăm Sóc & Mức Giá"
        description="Thông tin chi tiết về từng dịch vụ thiết kế và chăm sóc tóc cao cấp tại Dương Chi Salon."
        align="left"
      />

      {isLoading ? (
        <AnimatedContainer className="p-16 border border-neutral-200/60 bg-white rounded-2xl shadow-sm flex justify-center items-center">
          <LoadingSpinner label="Đang tải bảng giá..." size="lg" />
        </AnimatedContainer>
      ) : (
        <div className="space-y-10">
          {groupedServices.map((group) => (
            <AnimatedContainer
              key={group.slug}
              className="overflow-hidden rounded-2xl border border-neutral-200/60 bg-white shadow-sm"
            >
              {/* Category Header */}
              <div className="bg-neutral-50/80 px-6 py-4.5 border-b border-neutral-200/60 flex justify-between items-center">
                <h3 className="text-sm font-medium text-charcoal uppercase tracking-wider font-sans">
                  {group.name}
                </h3>
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest bg-white border border-neutral-200/60 px-3 py-1 rounded-full">
                  {group.services.length} dịch vụ
                </span>
              </div>

              {/* Category Services List */}
              <div className="divide-y divide-neutral-100">
                {group.services.map((service) => {
                  const durationValue = service.duration || service.durationMinutes || 60;
                  return (
                    <div
                      key={service._id}
                      className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between hover:bg-neutral-50/20 transition-all duration-200 ease-out"
                    >
                      <div className="flex gap-4 flex-1 items-start">
                        <div className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100 border border-neutral-200/50">
                          <ServiceImage
                            src={service.imageUrl || service.image}
                            alt={service.name}
                            aspectRatio="h-full w-full"
                          />
                        </div>
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium text-charcoal">{service.name}</p>
                            <span className="text-slate-300 text-xs font-light hidden sm:inline">•</span>
                            <span className="text-xs text-slate-500 font-normal">{durationValue} phút</span>
                          </div>
                          <p className="text-xs text-slate-500 max-w-xl leading-relaxed font-light line-clamp-2">
                            {service.description || "Liệu trình chăm sóc tóc tận tâm chuyên nghiệp bởi đội ngũ stylist Dương Chi."}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-6 sm:min-w-[170px] border-t border-neutral-100 pt-3 sm:border-0 sm:pt-0">
                        <span className="text-sm font-medium text-charcoal">
                          {service.price ? formatCurrency(service.price) : "Liên hệ tư vấn"}
                        </span>
                        <Button
                          to={`/booking?service=${service.slug}`}
                          variant="ghost"
                          className="px-4 py-1.5 text-xs rounded-full border border-neutral-200 text-slate-700 hover:bg-charcoal hover:text-white hover:border-charcoal transition-all duration-200"
                        >
                          Đặt lịch
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </AnimatedContainer>
          ))}

          {services.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/30 p-12 text-center text-slate-400 text-sm">
              Danh sách dịch vụ hiện chưa có dữ liệu. Vui lòng quay lại sau.
            </div>
          ) : (
            <section className="rounded-xl border border-neutral-200/50 bg-neutral-50/20 p-5 text-center text-[11px] text-slate-500 leading-relaxed font-light">
              * Ghi chú: Mức giá hiển thị ở trên là **giá tham khảo**. Chi phí thực tế có thể thay đổi tùy thuộc vào độ dài, độ dày và tình trạng sức khỏe thực tế của mái tóc quý khách.
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default Pricing;
