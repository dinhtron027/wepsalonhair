import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../components/Button";
import LoadingSpinner from "../components/LoadingSpinner";
import api, { extractApiData, getApiErrorMessage } from "../services/api";
import ServiceImage from "../components/ServiceImage";

type Service = {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
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

const ServiceDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDetail = async () => {
      if (!slug) {
        setService(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await api.get(`/api/services/${slug}`);
        const payload = extractApiData<Service>(response);
        setService(payload);
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Khong the tai chi tiet dich vu"));
        setService(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadDetail();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20">
        <LoadingSpinner size="lg" label="Dang tai chi tiet dich vu..." />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-rose-400">Khong tim thay</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Dich vu khong ton tai</h1>
        <div className="mt-6 flex justify-center gap-3">
          <Button to="/services" variant="primary">
            Quay lai danh sach
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-white to-amber-50">
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-16 md:grid-cols-2 md:py-20">
          <div className="space-y-4">
            <Link to="/services" className="inline-flex items-center gap-2 text-sm text-rose-500 hover:text-rose-600">
              <ArrowLeft size={16} /> Quay lai danh sach
            </Link>
            <p className="text-xs uppercase tracking-[0.3em] text-rose-400">{service.category}</p>
            <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">{service.name}</h1>
            <p className="text-slate-600">{service.description}</p>
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-rose-400">Gia tu</p>
                <p className="text-3xl font-semibold text-rose-600">{formatCurrency(service.price)}</p>
              </div>
              <div className="h-12 w-px bg-rose-100" />
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-rose-400">Thoi gian</p>
                <p className="text-base font-semibold text-slate-800">{service.durationMinutes} phut</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button to="/booking" variant="primary">
                Dat lich ngay
              </Button>
              <Button to="/services" variant="ghost">
                Xem them dich vu
              </Button>
            </div>
          </div>
          <div className="overflow-hidden rounded-3xl border border-rose-100 bg-white/80 shadow-xl shadow-rose-100 relative min-h-[300px]">
            <ServiceImage src={service.imageUrl || service.image} alt={service.name} aspectRatio="h-full w-full" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServiceDetailPage;
