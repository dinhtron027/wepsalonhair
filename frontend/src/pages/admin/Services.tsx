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
  uploadImage,
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
  "Cắt & Tạo Kiểu Nữ",
  "Uốn Tóc Nữ",
  "Duỗi Tóc Nữ",
  "Nhuộm Tóc Nữ",
  "Phục Hồi Tóc",
  "Gội Đầu Dưỡng Sinh",
  "Combo Làm Đẹp",
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

const toServicePayload = (form: ServiceForm, enablePromo: boolean) => {
  const shouldIncludeRule =
    enablePromo && form.promoStartTime && form.promoEndTime && Number(form.promoDiscount || 0) > 0;

  return {
    name: form.name,
    category: form.category,
    description: form.description,
    price: Number(form.price || 0),
    discount: Number(form.discount || 0),
    durationMinutes: Number(form.durationMinutes || 60),
    image: form.image,
    imageUrl: form.image,
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
  const [enablePromo, setEnablePromo] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ServiceForm | "promoTime" | "promoDays" | "general", string>>>({});
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isFormCollapsed, setIsFormCollapsed] = useState(true);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước tệp vượt quá giới hạn (Tối đa 5MB)");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Chỉ chấp nhận ảnh định dạng JPG, PNG hoặc WEBP");
      return;
    }

    try {
      setIsUploadingImage(true);
      const res = await uploadImage(file, "services");
      setForm((prev) => ({ ...prev, image: res.imageUrl }));
      toast.success("Tải hình ảnh lên thành công!");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Không thể tải hình ảnh lên server"));
    } finally {
      setIsUploadingImage(false);
      event.target.value = "";
    }
  };

  const { data: services, isLoading } = useQuery({
    queryKey: [...queryKeys.adminServices],
    queryFn: fetchAdminServices,
  });

  const createMutation = useMutation({
    mutationFn: createAdminService,
    onSuccess: () => {
      toast.success("Thành công: Tạo dịch vụ");
      setForm(defaultForm);
      setEnablePromo(false);
      setErrors({});
      setIsFormCollapsed(true);
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
      setEnablePromo(false);
      setErrors({});
      setIsFormCollapsed(true);
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
    setErrors({});

    const newErrors: Partial<Record<keyof ServiceForm | "promoTime" | "promoDays" | "general", string>> = {};

    // 1. Validate Tên dịch vụ
    if (!form.name.trim()) {
      newErrors.name = "Tên dịch vụ không được để trống";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Tên dịch vụ phải có ít nhất 2 ký tự";
    }

    // 2. Validate Danh mục
    if (!form.category) {
      newErrors.category = "Vui lòng chọn danh mục";
    }

    // 3. Validate Giá gốc
    const priceNum = Number(form.price);
    if (form.price === "") {
      newErrors.price = "Giá gốc không được để trống";
    } else if (isNaN(priceNum) || priceNum < 0) {
      newErrors.price = "Giá gốc phải là số lớn hơn hoặc bằng 0";
    }

    // 4. Validate Giảm giá chung
    const discountNum = Number(form.discount);
    if (isNaN(discountNum) || discountNum < 0 || discountNum > 100) {
      newErrors.discount = "Giảm giá chung phải từ 0% đến 100%";
    }

    // 5. Validate Thời lượng
    const durationNum = Number(form.durationMinutes);
    if (form.durationMinutes === "") {
      newErrors.durationMinutes = "Thời lượng không được để trống";
    } else if (isNaN(durationNum) || !Number.isInteger(durationNum) || durationNum < 15) {
      newErrors.durationMinutes = "Thời lượng phải là số nguyên tối thiểu 15 phút";
    }

    // 6. Validate Link hình ảnh (nếu nhập)
    if (form.image.trim()) {
      try {
        new URL(form.image.trim());
      } catch {
        newErrors.image = "Đường dẫn hình ảnh không hợp lệ (phải bắt đầu bằng http:// hoặc https://)";
      }
    }

    // 7. Validate Giờ vàng / Khuyến mãi (nếu bật)
    if (enablePromo) {
      const promoDiscountNum = Number(form.promoDiscount);
      if (form.promoDiscount === "") {
        newErrors.promoDiscount = "Vui lòng nhập mức giảm giá giờ vàng";
      } else if (isNaN(promoDiscountNum) || promoDiscountNum <= 0 || promoDiscountNum > 100) {
        newErrors.promoDiscount = "Giảm giá giờ vàng phải từ 1% đến 100%";
      }

      if (!form.promoStartTime) {
        newErrors.promoStartTime = "Vui lòng chọn giờ bắt đầu giờ vàng";
      }

      if (!form.promoEndTime) {
        newErrors.promoEndTime = "Vui lòng chọn giờ kết thúc giờ vàng";
      }

      if (form.promoStartTime && form.promoEndTime) {
        if (form.promoStartTime >= form.promoEndTime) {
          newErrors.promoTime = "Giờ kết thúc phải sau giờ bắt đầu";
        }
      }

      if (form.promoDays.length === 0) {
        newErrors.promoDays = "Vui lòng chọn ít nhất một ngày áp dụng trong tuần";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Vui lòng kiểm tra lại thông tin nhập liệu!");
      return;
    }

    const payload = toServicePayload(form, enablePromo);
    if (editingServiceId) {
      updateMutation.mutate({ id: editingServiceId, data: payload });
      return;
    }

    createMutation.mutate(payload);
  };

  const handleEdit = (service: ServiceEntity) => {
    const activeRule = (service.pricingRules || []).find((rule) => rule.isActive);

    setEditingServiceId(service._id);
    setEnablePromo(Boolean(activeRule));
    setErrors({});
    setIsFormCollapsed(false);
    setForm({
      name: service.name,
      category: service.category,
      description: service.description || "",
      price: String(service.price || 0),
      discount: String(service.discount || 0),
      durationMinutes: String(service.durationMinutes || 60),
      image: service.imageUrl || service.image || "",
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
    <div className="space-y-6 font-sans">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{isEditing ? "Cập nhật dịch vụ" : "Tạo dịch vụ mới"}</h3>
            <p className="mt-1 text-xs text-slate-400">
              Quản lý danh mục dịch vụ, thời lượng và giá giờ vàng/khuyến mãi.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsFormCollapsed((prev) => !prev)}
            className="md:hidden rounded-lg bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 text-xs font-semibold transition-all duration-150 flex items-center justify-center gap-1.5"
            style={{ minHeight: "44px" }}
          >
            {isFormCollapsed ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                <span>Mở Form</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14" />
                </svg>
                <span>Đóng Form</span>
              </>
            )}
          </button>
        </div>

        <form onSubmit={handleSubmit} className={`mt-5 space-y-6 ${isFormCollapsed ? "hidden md:block" : "block"}`}>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Cột trái: Thông tin dịch vụ */}
            <div className="space-y-6">
              {/* Nhóm 1: Thông tin cơ bản */}
              <div className="rounded-xl border border-slate-200/60 p-5 bg-slate-50/30 space-y-4">
                <h4 className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider border-b border-slate-200/60 pb-2">1. Thông tin cơ bản</h4>
                
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="name" className="text-xs font-medium text-slate-700">Tên dịch vụ <span className="text-rose-500">*</span></label>
                  <input
                    id="name"
                    required
                    value={form.name}
                    onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                    className={`rounded-lg border ${errors.name ? 'border-rose-400 focus:ring-rose-200/20' : 'border-slate-200 focus:border-slate-400 focus:ring-slate-400/20'} px-3.5 py-2 text-sm focus:outline-none focus:ring-2`}
                    placeholder="Ví dụ: Cắt layer nữ, Uốn sóng lơi..."
                  />
                  {errors.name && <span className="text-xs text-rose-500 font-medium">{errors.name}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="category" className="text-xs font-medium text-slate-700">Danh mục dịch vụ <span className="text-rose-500">*</span></label>
                  <select
                    id="category"
                    value={form.category}
                    onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                    className={`rounded-lg border ${errors.category ? 'border-rose-400' : 'border-slate-200 focus:border-slate-400 focus:ring-slate-400/20'} px-3.5 py-2 text-sm focus:outline-none focus:ring-2`}
                  >
                    {categoryOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {errors.category && <span className="text-xs text-rose-500 font-medium">{errors.category}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="description" className="text-xs font-medium text-slate-700">Mô tả dịch vụ</label>
                  <textarea
                    id="description"
                    value={form.description}
                    onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                    className="rounded-lg border border-slate-200 focus:border-slate-400 focus:ring-slate-400/20 px-3.5 py-2 text-sm focus:outline-none focus:ring-2"
                    rows={3}
                    placeholder="Mô tả ngắn về dịch vụ..."
                  />
                </div>
              </div>

              {/* Nhóm 2: Giá & Thời lượng */}
              <div className="rounded-xl border border-slate-200/60 p-5 bg-slate-50/30 space-y-4">
                <h4 className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider border-b border-slate-200/60 pb-2">2. Giá & Thời lượng</h4>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="price" className="text-xs font-medium text-slate-700">Giá gốc (VNĐ) <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <input
                        id="price"
                        required
                        type="number"
                        min={0}
                        value={form.price}
                        onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
                        className={`w-full rounded-lg border ${errors.price ? 'border-rose-400' : 'border-slate-200 focus:border-slate-400 focus:ring-slate-400/20'} pl-3.5 pr-12 py-2 text-sm focus:outline-none focus:ring-2`}
                        placeholder="Ví dụ: 350000"
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-medium text-slate-400">VNĐ</span>
                    </div>
                    {errors.price && <span className="text-xs text-rose-500 font-medium">{errors.price}</span>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="discount" className="text-xs font-medium text-slate-700">Giảm giá chung (%)</label>
                    <div className="relative">
                      <input
                        id="discount"
                        type="number"
                        min={0}
                        max={100}
                        value={form.discount}
                        onChange={(event) => setForm((prev) => ({ ...prev, discount: event.target.value }))}
                        className={`w-full rounded-lg border ${errors.discount ? 'border-rose-400' : 'border-slate-200 focus:border-slate-400 focus:ring-slate-400/20'} pl-3.5 pr-8 py-2 text-sm focus:outline-none focus:ring-2`}
                        placeholder="Ví dụ: 10"
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-medium text-slate-400">%</span>
                    </div>
                    {errors.discount && <span className="text-xs text-rose-500 font-medium">{errors.discount}</span>}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="durationMinutes" className="text-xs font-medium text-slate-700">Thời lượng thực hiện (phút) <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <input
                      id="durationMinutes"
                      required
                      type="number"
                      min={15}
                      value={form.durationMinutes}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, durationMinutes: event.target.value }))
                      }
                      className={`w-full rounded-lg border ${errors.durationMinutes ? 'border-rose-400' : 'border-slate-200 focus:border-slate-400 focus:ring-slate-400/20'} pl-3.5 pr-12 py-2 text-sm focus:outline-none focus:ring-2`}
                      placeholder="Ví dụ: 60"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-medium text-slate-400">phút</span>
                  </div>
                  {errors.durationMinutes && <span className="text-xs text-rose-500 font-medium">{errors.durationMinutes}</span>}
                </div>
              </div>

              {/* Nhóm 3: Hình ảnh */}
              <div className="rounded-xl border border-slate-200/60 p-5 bg-slate-50/30 space-y-4">
                <h4 className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider border-b border-slate-200/60 pb-2">3. Hình ảnh</h4>
                
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-medium text-slate-700">Ảnh dịch vụ</span>
                  
                  {/* Preview và file upload picker */}
                  <div className="flex items-center gap-4">
                    {form.image ? (
                      <div className="relative group w-16 h-16 flex-shrink-0">
                        <img
                          src={form.image}
                          alt="Xem trước ảnh dịch vụ"
                          className="w-16 h-16 rounded-lg object-cover border border-slate-200 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, image: "" }))}
                          className="absolute -top-1.5 -right-1.5 rounded-full bg-slate-900 text-white p-1 hover:bg-slate-800 transition-colors shadow-sm"
                          title="Xóa ảnh"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-slate-100 border border-dashed border-slate-350 flex flex-col items-center justify-center text-slate-400 text-[9px] font-semibold flex-shrink-0">
                        Không ảnh
                      </div>
                    )}

                    <div className="flex-1 space-y-1.5">
                      <label
                        htmlFor="image-file-input"
                        className={`inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer shadow-sm active:bg-slate-100 transition-all ${isUploadingImage ? 'opacity-50 pointer-events-none' : ''}`}
                      >
                        {isUploadingImage ? 'Đang tải ảnh...' : form.image ? 'Thay đổi ảnh' : 'Tải ảnh thiết bị'}
                      </label>
                      <input
                        id="image-file-input"
                        type="file"
                        accept="image/*"
                        disabled={isUploadingImage}
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <p className="text-[10px] text-slate-400">Hỗ trợ JPG, PNG, WEBP. Tối đa 5MB.</p>
                    </div>
                  </div>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink mx-3 text-slate-400 text-[9px] uppercase font-semibold tracking-wider">Hoặc nhập URL</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <input
                      id="image"
                      value={form.image}
                      onChange={(event) => setForm((prev) => ({ ...prev, image: event.target.value }))}
                      className={`rounded-lg border ${errors.image ? 'border-rose-400' : 'border-slate-200 focus:border-slate-400 focus:ring-slate-400/20'} px-3.5 py-2 text-sm focus:outline-none focus:ring-2`}
                      placeholder="Dán link ảnh thủ công"
                    />
                    {errors.image && <span className="text-xs text-rose-550 font-medium">{errors.image}</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Cột phải: Cấu hình giờ vàng */}
            <div className="space-y-6">
              {/* Nhóm 4: Khuyến mãi Giờ vàng */}
              <div className="rounded-xl border border-slate-200/60 p-5 bg-slate-50/30 space-y-4 h-full">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <h4 className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">4. Khuyến mãi giờ vàng</h4>
                  <label className="inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={enablePromo}
                      onChange={(e) => {
                        setEnablePromo(e.target.checked);
                        if (!e.target.checked) {
                          // Reset các trường promo
                          setForm((prev) => ({
                            ...prev,
                            promoLabel: "",
                            promoStartTime: "",
                            promoEndTime: "",
                            promoDiscount: "",
                            promoDays: [],
                          }));
                          // Xóa lỗi liên quan đến promo
                          setErrors((prev) => {
                            const newErrs = { ...prev };
                            delete newErrs.promoLabel;
                            delete newErrs.promoStartTime;
                            delete newErrs.promoEndTime;
                            delete newErrs.promoDiscount;
                            delete newErrs.promoTime;
                            delete newErrs.promoDays;
                            return newErrs;
                          });
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div className="relative w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-slate-900"></div>
                    <span className="ms-2 text-xs font-semibold text-slate-600">Kích hoạt</span>
                  </label>
                </div>
                
                <p className="text-[11px] text-slate-400 leading-relaxed font-light">
                  Khuyến mãi giờ vàng cho phép đặt giá ưu đãi đặc biệt cho dịch vụ vào các khung giờ thấp điểm trong ngày để thu hút khách hàng.
                </p>

                <div className={`space-y-4 transition-all duration-200 ${enablePromo ? 'opacity-100' : 'opacity-40 pointer-events-none select-none'}`}>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="promoLabel" className="text-xs font-medium text-slate-700">Tên chương trình giờ vàng {enablePromo && <span className="text-rose-500">*</span>}</label>
                    <input
                      id="promoLabel"
                      disabled={!enablePromo}
                      value={form.promoLabel}
                      onChange={(event) => setForm((prev) => ({ ...prev, promoLabel: event.target.value }))}
                      className="rounded-lg border border-slate-200 px-3.5 py-2 text-sm focus:border-slate-400 focus:ring-slate-400/20 disabled:bg-slate-100"
                      placeholder="Ví dụ: Ưu đãi buổi sáng..."
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="promoDiscount" className="text-xs font-medium text-slate-700">Mức giảm giá giờ vàng (%) {enablePromo && <span className="text-rose-500">*</span>}</label>
                    <div className="relative">
                      <input
                        id="promoDiscount"
                        disabled={!enablePromo}
                        type="number"
                        min={1}
                        max={100}
                        value={form.promoDiscount}
                        onChange={(event) => setForm((prev) => ({ ...prev, promoDiscount: event.target.value }))}
                        className={`w-full rounded-lg border ${errors.promoDiscount ? 'border-rose-400' : 'border-slate-200 focus:border-slate-400 focus:ring-slate-400/20'} pl-3.5 pr-8 py-2 text-sm focus:outline-none focus:ring-2 disabled:bg-slate-100`}
                        placeholder="Ví dụ: 15"
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-medium text-slate-400">%</span>
                    </div>
                    {errors.promoDiscount && <span className="text-xs text-rose-500 font-medium">{errors.promoDiscount}</span>}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="promoStartTime" className="text-xs font-medium text-slate-700">Giờ bắt đầu {enablePromo && <span className="text-rose-500">*</span>}</label>
                      <input
                        id="promoStartTime"
                        disabled={!enablePromo}
                        type="time"
                        value={form.promoStartTime}
                        onChange={(event) => setForm((prev) => ({ ...prev, promoStartTime: event.target.value }))}
                        className={`rounded-lg border ${errors.promoStartTime ? 'border-rose-400' : 'border-slate-200 focus:border-slate-400 focus:ring-slate-400/20'} px-3.5 py-2 text-sm focus:outline-none focus:ring-2 disabled:bg-slate-100`}
                      />
                      {errors.promoStartTime && <span className="text-xs text-rose-500 font-medium">{errors.promoStartTime}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="promoEndTime" className="text-xs font-medium text-slate-700">Giờ kết thúc {enablePromo && <span className="text-rose-500">*</span>}</label>
                      <input
                        id="promoEndTime"
                        disabled={!enablePromo}
                        type="time"
                        value={form.promoEndTime}
                        onChange={(event) => setForm((prev) => ({ ...prev, promoEndTime: event.target.value }))}
                        className={`rounded-lg border ${errors.promoEndTime || errors.promoTime ? 'border-rose-400' : 'border-slate-200 focus:border-slate-400 focus:ring-slate-400/20'} px-3.5 py-2 text-sm focus:outline-none focus:ring-2 disabled:bg-slate-100`}
                      />
                      {errors.promoEndTime && <span className="text-xs text-rose-500 font-medium">{errors.promoEndTime}</span>}
                    </div>
                  </div>
                  {errors.promoTime && <p className="text-xs text-rose-500 font-medium mt-1">{errors.promoTime}</p>}
                  
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-slate-700">Ngày áp dụng {enablePromo && <span className="text-rose-500">*</span>}</span>
                    <div className={`rounded-xl border ${errors.promoDays ? 'border-rose-400' : 'border-slate-200/60'} p-3 bg-white`}>
                      <span className="text-[10px] text-slate-400 block mb-2">Chọn những ngày trong tuần áp dụng:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {dayOptions.map((day) => (
                          <button
                            key={day.value}
                            type="button"
                            disabled={!enablePromo}
                            onClick={() => togglePromoDay(day.value)}
                            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                              form.promoDays.includes(day.value)
                                ? "bg-slate-900 text-white"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50"
                            }`}
                          >
                            {day.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {errors.promoDays && <span className="text-xs text-rose-500 font-medium">{errors.promoDays}</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hộp nút Submit / Huỷ chỉnh sửa */}
          <div className="flex items-center gap-3 border-t border-slate-200/60 pt-5">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-slate-900 hover:bg-slate-800 transition-colors px-6 py-2 text-xs font-semibold text-white disabled:opacity-70 shadow-sm"
            >
              {isSubmitting ? "Đang xử lý..." : isEditing ? "Cập nhật dịch vụ" : "Tạo dịch vụ"}
            </button>
            {isEditing ? (
              <button
                type="button"
                onClick={() => {
                  setEditingServiceId(null);
                  setForm(defaultForm);
                  setEnablePromo(false);
                  setErrors({});
                  setIsFormCollapsed(true);
                }}
                className="rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors px-5 py-2.5 text-xs font-semibold text-slate-600"
                style={{ minHeight: "40px" }}
              >
                Hủy chỉnh sửa
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Danh sách dịch vụ ({sortedServices.length})</h3>

        {isLoading ? (
          <div className="mt-6 flex justify-center py-6">
            <LoadingSpinner label="Đang tải dịch vụ..." size="sm" />
          </div>
        ) : (
          <div className="mt-4">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full text-left text-xs">
                <thead className="border-b border-slate-200 text-slate-400 font-medium uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-3 py-3 font-semibold">Dịch vụ</th>
                    <th className="px-3 py-3 font-semibold">Danh mục</th>
                    <th className="px-3 py-3 font-semibold">Giá gốc</th>
                    <th className="px-3 py-3 font-semibold">Thời lượng</th>
                    <th className="px-3 py-3 font-semibold">Giờ vàng</th>
                    <th className="px-3 py-3 font-semibold text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedServices.map((service) => (
                    <tr key={service._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-3">
                          {service.imageUrl || service.image ? (
                            <img
                              src={service.imageUrl || service.image}
                              alt={service.name}
                              className="w-8 h-8 rounded object-cover flex-shrink-0 border border-slate-100"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded bg-slate-150/70 flex items-center justify-center flex-shrink-0 text-slate-400 font-semibold text-[9px]">
                              Ảnh
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-slate-900">{service.name}</p>
                            <p className="text-[11px] text-slate-400 line-clamp-1 max-w-[250px] font-light mt-0.5">{service.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-slate-650">
                        <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          {service.category}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-slate-700 font-medium">
                        {formatCurrency(service.price)}
                        {service.discount ? (
                          <span className="ml-1.5 rounded bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700">
                            -{service.discount}%
                          </span>
                        ) : null}
                      </td>
                      <td className="px-3 py-3.5 text-slate-500 font-light">{service.durationMinutes} phút</td>
                      <td className="px-3 py-3.5 text-slate-500">
                        {service.pricingRules?.length && service.pricingRules[0].label ? (
                          <span className="inline-flex rounded bg-slate-100 border border-slate-200/60 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                            {service.pricingRules[0].label} (-{service.pricingRules[0].discountPercent}%)
                          </span>
                        ) : (
                          <span className="text-slate-400 font-light">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(service)}
                            className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(service)}
                            disabled={deleteMutation.isPending}
                            className="rounded-md border border-rose-200 bg-white px-2.5 py-1 text-[11px] font-medium text-rose-600 hover:bg-rose-50/50 transition-colors disabled:opacity-50"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="block md:hidden space-y-4">
              {sortedServices.map((service) => (
                <div key={service._id} className="p-4 rounded-xl border border-slate-200/65 bg-slate-50/30 space-y-3">
                  <div className="flex items-start gap-3">
                    {service.imageUrl || service.image ? (
                      <img
                        src={service.imageUrl || service.image}
                        alt={service.name}
                        className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border border-slate-200/50"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-400 font-semibold text-[10px] border border-slate-200/50">
                        Ảnh
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-semibold text-slate-900 text-xs line-clamp-1">{service.name}</h4>
                        <span className="inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-550 flex-shrink-0">
                          {service.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 font-light leading-normal">{service.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] border-t border-slate-200/40 pt-3 text-slate-500 font-light">
                    <div>
                      <p className="text-slate-400">Giá gốc</p>
                      <p className="font-semibold text-slate-800 mt-0.5 text-xs">
                        {formatCurrency(service.price)}
                        {service.discount ? (
                          <span className="ml-1.5 rounded bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700">
                            -{service.discount}%
                          </span>
                        ) : null}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">Thời lượng</p>
                      <p className="font-semibold text-slate-850 mt-0.5 text-xs">{service.durationMinutes} phút</p>
                    </div>
                  </div>

                  {service.pricingRules?.length && service.pricingRules[0].label ? (
                    <div className="text-[10px] bg-slate-50 border border-slate-250/50 rounded-lg p-2 flex items-center justify-between font-light">
                      <span className="text-slate-500">Khuyến mãi áp dụng:</span>
                      <span className="bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded text-[9px]">
                        {service.pricingRules[0].label} (-{service.pricingRules[0].discountPercent}%)
                      </span>
                    </div>
                  ) : null}

                  <div className="flex gap-2 justify-end border-t border-slate-200/40 pt-3">
                    <button
                      onClick={() => handleEdit(service)}
                      className="flex-1 text-center rounded-lg border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 active:bg-slate-100 transition flex items-center justify-center gap-1"
                      style={{ minHeight: "40px" }}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(service)}
                      disabled={deleteMutation.isPending}
                      className="flex-1 text-center rounded-lg border border-rose-200 bg-white py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50/50 active:bg-rose-100 disabled:opacity-50 transition flex items-center justify-center gap-1"
                      style={{ minHeight: "40px" }}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {sortedServices.length === 0 ? (
              <p className="mt-4 rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
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
