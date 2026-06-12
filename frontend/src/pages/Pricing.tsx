import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import SectionTitle from "../components/SectionTitle";
import AnimatedContainer from "../components/AnimatedContainer";
import LoadingSpinner from "../components/LoadingSpinner";
import api, { extractApiData, getApiErrorMessage } from "../services/api";

type Service = {
  _id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

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

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 pb-20">
      <SectionTitle
        eyebrow="Bảng Giá"
        title="Mức Giá Của Sự Hoàn Mỹ"
        description="Thông tin chi tiết về từng mức giá để bạn yên tâm tận hưởng những gì tuyệt vời nhất tại Dương Chí."
        align="left"
      />

      <AnimatedContainer className="overflow-hidden rounded-3xl border border-rose-100 bg-white/80 shadow-lg shadow-rose-100">
        {isLoading ? (
          <div className="p-10">
            <LoadingSpinner label="Đang tải trang thông tin..." size="lg" />
          </div>
        ) : (
          <div className="divide-y divide-rose-50">
            {services.map((service) => (
              <div key={service._id} className="flex flex-col gap-2 px-6 py-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{service.name}</p>
                  <p className="text-sm text-slate-600">
                    {service.description || "Nơi vẻ đẹp được chăm sóc bằng cả tâm huyết"} - {service.durationMinutes} phút
                  </p>
                </div>
                <span className="text-sm font-semibold text-rose-500">{formatCurrency(service.price)}</span>
              </div>
            ))}
            {services.length === 0 ? (
              <div className="px-6 py-8 text-center text-slate-600">Danh sách hiện đang tĩnh lặng. Chưa có dịch vụ nào xuất hiện ở đây cả.</div>
            ) : null}
          </div>
        )}
      </AnimatedContainer>
    </div>
  );
};

export default Pricing;
