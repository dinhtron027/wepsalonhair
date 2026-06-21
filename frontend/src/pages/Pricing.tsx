import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import SectionTitle from "../components/SectionTitle";
import AnimatedContainer from "../components/AnimatedContainer";
import LoadingSpinner from "../components/LoadingSpinner";
import api, { extractApiData, getApiErrorMessage } from "../services/api";
import Button from "../components/Button";

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
    <div className="mx-auto max-w-6xl space-y-10 px-4 pb-20">
      <SectionTitle
        eyebrow="Bảng Giá"
        title="Mức Giá Của Sự Hoàn Mỹ"
        description="Thông tin chi tiết về từng mức giá dịch vụ tại Dương Chi để bạn yên tâm tận hưởng liệu trình chăm sóc tóc tốt nhất."
        align="left"
      />

      {isLoading ? (
        <AnimatedContainer className="p-10 border border-rose-100 bg-white/80 rounded-3xl shadow-lg shadow-rose-100">
          <LoadingSpinner label="Đang tải bảng giá..." size="lg" />
        </AnimatedContainer>
      ) : (
        <div className="space-y-8">
          {groupedServices.map((group) => (
            <AnimatedContainer
              key={group.slug}
              className="overflow-hidden rounded-3xl border border-rose-100 bg-white shadow-md shadow-rose-50"
            >
              {/* Category Header */}
              <div className="bg-rose-50/50 px-6 py-4 border-b border-rose-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wide">
                  {group.name}
                </h3>
                <span className="text-xs font-semibold text-rose-500 uppercase tracking-widest bg-white border border-rose-100 px-3 py-1 rounded-full">
                  {group.services.length} dịch vụ
                </span>
              </div>

              {/* Category Services List */}
              <div className="divide-y divide-rose-50">
                {group.services.map((service) => {
                  const durationValue = service.duration || service.durationMinutes || 60;
                  return (
                    <div
                      key={service._id}
                      className="flex flex-col gap-2 px-6 py-4 sm:flex-row sm:items-center sm:justify-between hover:bg-rose-50/10 transition duration-150"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-900">{service.name}</p>
                          <span className="text-slate-400 text-xs">•</span>
                          <span className="text-xs text-slate-500 font-medium">{durationValue} phút</span>
                        </div>
                        <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                          {service.description || "Liệu trình chăm sóc tóc tận tâm chuyên nghiệp bởi đội ngũ stylist Dương Chi."}
                        </p>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-4 min-w-[150px]">
                        <span className="text-sm font-bold text-rose-600">
                          {service.price ? formatCurrency(service.price) : "Liên hệ tư vấn"}
                        </span>
                        <Button
                          to={`/booking?service=${service.slug}`}
                          variant="ghost"
                          className="px-3 py-1 text-xs"
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
            <div className="rounded-3xl border border-dashed border-rose-200 bg-rose-50/40 p-10 text-center text-slate-600">
              Danh sách hiện đang tĩnh lặng. Chưa có dịch vụ nào xuất hiện ở đây cả.
            </div>
          ) : (
            <section className="rounded-2xl border border-rose-100 bg-rose-50/30 p-5 text-center text-xs text-slate-600 leading-relaxed">
              * Ghi chú: Mức giá hiển thị ở trên là **giá tham khảo**. Chi phí thực tế có thể thay đổi tùy thuộc vào độ dài, độ dày và tình trạng sức khỏe thực tế của mái tóc quý khách.
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default Pricing;
