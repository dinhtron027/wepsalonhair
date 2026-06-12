import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useEffect } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import { fetchPublicServices, queryKeys } from "../services/adminApi";
import { getApiErrorMessage } from "../services/api";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

const ServicesPage = () => {
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
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-10 text-center text-4xl font-bold text-rose-500">The Menu Của Cảm Xúc</h1>

      {isLoading ? (
        <div className="rounded-3xl border border-rose-100 bg-white/80 p-10">
          <LoadingSpinner label="Đang dệt nên điều chờ đợi..." size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {(services || []).map((service) => (
            <article
              key={service._id}
              className="rounded-2xl border border-rose-100 bg-white p-6 shadow-md transition hover:shadow-xl"
            >
              {service.image ? (
                <img
                  src={service.image}
                  alt={service.name}
                  className="mb-4 h-44 w-full rounded-xl object-cover"
                />
              ) : null}
              <p className="text-xs uppercase tracking-[0.2em] text-rose-400">{service.category}</p>
              <h2 className="mb-2 text-2xl font-semibold">{service.name}</h2>
              <p className="mb-4 min-h-[72px] text-slate-600">
                {service.description || "Hãy đến và cảm nhận sự thăng hoa mà dịch vụ này mang lại."}
              </p>
              <div className="mb-4 flex items-center justify-between font-bold text-rose-500">
                <span>{formatCurrency(service.price || 0)}</span>
                <span>{service.durationMinutes || 0} phút</span>
              </div>
              <Link
                to={`/services/${service._id}`}
                className="inline-flex rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 transition"
              >
                Khám Phá Trải Nghiệm
              </Link>
            </article>
          ))}
        </div>
      )}

      {!isLoading && (services || []).length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-rose-200 bg-rose-50 p-6 text-center text-slate-600">
          Chưa có dịch vụ nào xuất hiện ở đây cả, nhưng đừng lo, chúng sẽ sớm được cập nhật.
        </div>
      ) : null}
    </div>
  );
};

export default ServicesPage;
