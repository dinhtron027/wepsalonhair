import { motion } from "framer-motion";
import { ArrowRight, CalendarClock } from "lucide-react";
import Button from "./Button";

export type ServiceCardData = {
  _id?: string;
  id?: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  image?: string;
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
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group flex flex-col overflow-hidden rounded-3xl border border-rose-100 bg-white/90 shadow-lg shadow-rose-100 backdrop-blur-xl"
      id={serviceId ? `card-${serviceId}` : undefined}
    >
      <div className="relative h-56 overflow-hidden">
        <motion.img
          src={service.image || "https://placehold.co/800x500?text=Dich+vu"}
          alt={service.name}
          className="h-full w-full object-cover"
          whileHover={{ scale: 1.06 }}
          transition={{ duration: 0.35 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 shadow-md shadow-rose-100">
            {service.category || "Dich vu"}
          </span>
          <span className="rounded-full bg-rose-500/90 px-3 py-1 text-xs font-semibold text-white shadow-lg shadow-rose-200">
            Gia tu {formatCurrency(service.price)}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-rose-400">Dich vu chuyen nghiep</p>
          <h3 className="text-lg font-semibold text-slate-900 md:text-xl">{service.name}</h3>
          <p className="line-clamp-2 text-sm text-slate-600">{service.description || "Khong co mo ta chi tiet."}</p>
        </div>

        <div className="flex items-center justify-between text-sm text-slate-600">
          <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-2 text-rose-600 shadow-sm">
            <CalendarClock size={16} /> {service.durationMinutes || 60} phut
          </span>
          <span className="font-semibold text-rose-600">{formatCurrency(service.price)}</span>
        </div>

        <div className="flex flex-wrap gap-3">
          {serviceId ? (
            <Button to={`/services/${serviceId}`} variant="ghost" className="gap-2 px-4 py-2 text-xs md:text-sm">
              Xem chi tiet
              <ArrowRight size={16} />
            </Button>
          ) : null}
          <Button to="/booking" variant="primary" className="px-4 py-2 text-xs md:text-sm">
            Dat lich
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ServiceCard;
