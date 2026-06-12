import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/LoadingSpinner";
import {
  ServiceEntity,
  createAdminService,
  deleteAdminService,
  fetchAdminServices,
  queryKeys,
  updateAdminService,
} from "../../services/adminApi";
import { getApiErrorMessage } from "../../services/api";

type ServiceForm = {
  name: string;
  category: string;
  description: string;
  price: string;
  discount: string;
  durationMinutes: string;
  image: string;
  promoLabel: string;
  promoStartTime: string;
  promoEndTime: string;
  promoDiscount: string;
  promoDays: number[];
};

const categoryOptions = [
  "Chăm sóc tóc",
  "Hóa chất (uốn, duỗi, nhuộm)",
  "Gội dưỡng sinh",
  "Combo tiết kiệm",
];

const dayOptions = [
  { value: 0, label: "CN" },
  { value: 1, label: "T2" },
  { value: 2, label: "T3" },
  { value: 3, label: "T4" },
  { value: 4, label: "T5" },
  { value: 5, label: "T6" },
  { value: 6, label: "T7" },
];

const defaultForm: ServiceForm = {
  name: "",
  category: categoryOptions[0],
  description: "",
  price: "",
  discount: "0",
  durationMinutes: "60",
  image: "",
  promoLabel: "",
  promoStartTime: "",
  promoEndTime: "",
  promoDiscount: "",
  promoDays: [],
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

const toServicePayload = (form: ServiceForm) => {
  const shouldIncludeRule =
    form.promoStartTime && form.promoEndTime && Number(form.promoDiscount || 0) > 0;

  return {
    name: form.name,
    category: form.category,
    description: form.description,
    price: Number(form.price || 0),
    discount: Number(form.discount || 0),
    durationMinutes: Number(form.durationMinutes || 60),
    image: form.image,
    addons: [],
    pricingRules: shouldIncludeRule
      ? [
          {
            label: form.promoLabel || "Giờ vàng",
            daysOfWeek: form.promoDays,
            startTime: form.promoStartTime,
            endTime: form.promoEndTime,
            discountPercent: Number(form.promoDiscount || 0),
            isActive: true,
          },
        ]
      : [],
  };
};

const ServicesPage = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ServiceForm>(defaultForm);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  const { data: services, isLoading } = useQuery({
    queryKey: [...queryKeys.adminServices],
    queryFn: fetchAdminServices,
  });

  const createMutation = useMutation({
    mutationFn: createAdminService,
    onSuccess: () => {
      toast.success("Thành công: Tạo dịch vụ");
      setForm(defaultForm);
      queryClient.invalidateQueries({ queryKey: [...queryKeys.adminServices] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Thất bại: Không thể tạo dịch vụ"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { id: string; data: Partial<Omit<ServiceEntity, "_id">> }) =>
      updateAdminService(payload.id, payload.data),
    onSuccess: () => {
      toast.success("Thành công: Cập nhật dịch vụ");
      setForm(defaultForm);
      setEditingServiceId(null);
      queryClient.invalidateQueries({ queryKey: [...queryKeys.adminServices] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Thất bại: Không thể cập nhật dịch vụ"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminService,
    onSuccess: () => {
      toast.success("Thành công: Xóa dịch vụ");
      queryClient.invalidateQueries({ queryKey: [...queryKeys.adminServices] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Thất bại: Không thể xóa dịch vụ"));
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isEditing = Boolean(editingServiceId);

  const sortedServices = useMemo(
    () =>
      [...(services || [])].sort((a, b) => {
        if (a.category !== b.category) {
          return a.category.localeCompare(b.category, "vi");
        }
        return a.name.localeCompare(b.name, "vi");
      }),
    [services]
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const payload = toServicePayload(form);
    if (editingServiceId) {
      updateMutation.mutate({ id: editingServiceId, data: payload });
      return;
    }

    createMutation.mutate(payload);
  };

  const handleEdit = (service: ServiceEntity) => {
    const activeRule = (service.pricingRules || []).find((rule) => rule.isActive);

    setEditingServiceId(service._id);
    setForm({
      name: service.name,
      category: service.category,
      description: service.description || "",
      price: String(service.price || 0),
      discount: String(service.discount || 0),
      durationMinutes: String(service.durationMinutes || 60),
      image: service.image || "",
      promoLabel: activeRule?.label || "",
      promoStartTime: activeRule?.startTime || "",
      promoEndTime: activeRule?.endTime || "",
      promoDiscount: activeRule ? String(activeRule.discountPercent || 0) : "",
      promoDays: activeRule?.daysOfWeek || [],
    });
  };

  const handleDelete = (service: ServiceEntity) => {
    if (!window.confirm(`Xác nhận xóa dịch vụ "${service.name}"?`)) {
      return;
    }

    deleteMutation.mutate(service._id);
  };

  const togglePromoDay = (day: number) => {
    setForm((prev) => {
      const exists = prev.promoDays.includes(day);
      return {
        ...prev,
        promoDays: exists ? prev.promoDays.filter((item) => item !== day) : [...prev.promoDays, day],
      };
    });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold">{isEditing ? "Cập nhật dịch vụ" : "Tạo dịch vụ mới"}</h3>
        <p className="mt-1 text-sm text-slate-500">
          Quản lý danh mục dịch vụ, thời lượng và giá giờ vàng/khuyến mãi.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <input
            required
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            placeholder="Tên dịch vụ"
          />

          <select
            value={form.category}
            onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          >
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <input
            required
            type="number"
            min={0}
            value={form.price}
            onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            placeholder="Giá gốc"
          />

          <input
            type="number"
            min={0}
            max={100}
            value={form.discount}
            onChange={(event) => setForm((prev) => ({ ...prev, discount: event.target.value }))}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            placeholder="Giảm giá chung (%)"
          />

          <input
            required
            type="number"
            min={15}
            value={form.durationMinutes}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, durationMinutes: event.target.value }))
            }
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            placeholder="Thời lượng (phút)"
          />

          <input
            value={form.image}
            onChange={(event) => setForm((prev) => ({ ...prev, image: event.target.value }))}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            placeholder="Link hình ảnh"
          />

          <input
            value={form.promoLabel}
            onChange={(event) => setForm((prev) => ({ ...prev, promoLabel: event.target.value }))}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            placeholder="Nhãn giờ vàng (tuỳ chọn)"
          />

          <input
            type="number"
            min={0}
            max={100}
            value={form.promoDiscount}
            onChange={(event) => setForm((prev) => ({ ...prev, promoDiscount: event.target.value }))}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            placeholder="Giảm giá giờ vàng (%)"
          />

          <input
            type="time"
            value={form.promoStartTime}
            onChange={(event) => setForm((prev) => ({ ...prev, promoStartTime: event.target.value }))}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />

          <input
            type="time"
            value={form.promoEndTime}
            onChange={(event) => setForm((prev) => ({ ...prev, promoEndTime: event.target.value }))}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />

          <textarea
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm md:col-span-2"
            rows={3}
            placeholder="Mô tả dịch vụ"
          />

          <div className="rounded-xl border border-slate-200 px-3 py-2 text-sm md:col-span-2">
            <p className="text-slate-600">Ngày áp dụng giờ vàng</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {dayOptions.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => togglePromoDay(day.value)}
                  className={`rounded-lg px-2 py-1 text-xs font-semibold ${
                    form.promoDays.includes(day.value)
                      ? "bg-cyan-600 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 md:col-span-2 lg:col-span-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-70"
            >
              {isSubmitting ? "Đang xử lý..." : isEditing ? "Lưu cập nhật" : "Tạo dịch vụ"}
            </button>
            {isEditing ? (
              <button
                type="button"
                onClick={() => {
                  setEditingServiceId(null);
                  setForm(defaultForm);
                }}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Hủy chỉnh sửa
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold">Danh sách dịch vụ ({sortedServices.length})</h3>

        {isLoading ? (
          <div className="mt-6">
            <LoadingSpinner label="Đang tải dịch vụ..." />
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-2 py-2 font-semibold">Dịch vụ</th>
                  <th className="px-2 py-2 font-semibold">Danh mục</th>
                  <th className="px-2 py-2 font-semibold">Giá</th>
                  <th className="px-2 py-2 font-semibold">Thời lượng</th>
                  <th className="px-2 py-2 font-semibold">Khuyến mãi</th>
                  <th className="px-2 py-2 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {sortedServices.map((service) => (
                  <tr key={service._id} className="border-b border-slate-100">
                    <td className="px-2 py-3">
                      <p className="font-semibold text-slate-800">{service.name}</p>
                      <p className="text-xs text-slate-500 line-clamp-1">{service.description}</p>
                    </td>
                    <td className="px-2 py-3 text-slate-700">{service.category}</td>
                    <td className="px-2 py-3 text-slate-700">
                      {formatCurrency(service.price)}{" "}
                      {service.discount ? (
                        <span className="ml-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                          -{service.discount}%
                        </span>
                      ) : null}
                    </td>
                    <td className="px-2 py-3 text-slate-700">{service.durationMinutes} phút</td>
                    <td className="px-2 py-3 text-slate-700">
                      {service.pricingRules?.length ? service.pricingRules[0].label : "Không"}
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(service)}
                          className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(service)}
                          disabled={deleteMutation.isPending}
                          className="rounded-lg border border-rose-300 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-70"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {sortedServices.length === 0 ? (
              <p className="mt-4 rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                Chưa có dịch vụ nào.
              </p>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
};

export default ServicesPage;
