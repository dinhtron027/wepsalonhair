import { CalendarClock } from "lucide-react";
import Button from "./Button";
import ServiceImage from "./ServiceImage";

export type ServiceCardData = {
  _id?: string;
  id?: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  image?: string;
  imageUrl?: string;
  durationMinutes?: number;
};

type ServiceCardProps = {
  service: ServiceCardData;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

const ServiceCard = ({ service }: ServiceCardProps) => {
  const serviceId = service._id || service.id || "";

  return (
    <div
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
      id={serviceId ? `card-${serviceId}` : undefined}
    >
      <div className="relative h-60 overflow-hidden bg-slate-50">
        <ServiceImage
          src={service.imageUrl || service.image}
          alt={service.name}
          className="group-hover:scale-105"
          aspectRatio="h-full w-full"
        />
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className="rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-800 shadow-sm backdrop-blur-md">
            {service.category || "Dịch vụ"}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4">
          <h3 className="mb-2 text-xl font-semibold leading-tight text-slate-900">{service.name}</h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-slate-500">{service.description || "Chưa có mô tả chi tiết."}</p>
        </div>

        <div className="mb-6 flex items-center justify-between border-y border-slate-100 py-3 text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <CalendarClock size={15} strokeWidth={1.5} />
            <span className="font-medium">{service.durationMinutes || 60} phút</span>
          </div>
          <span className="font-semibold text-slate-900">{formatCurrency(service.price)}</span>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-3">
          {serviceId ? (
            <Button to={`/services/${serviceId}`} variant="ghost" className="px-3 py-2.5 text-xs">
              Chi tiết
            </Button>
          ) : (
            <div />
          )}
          <Button to="/booking" variant="primary" className="px-3 py-2.5 text-xs">
            Đặt lịch
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
