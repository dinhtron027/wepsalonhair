/**
 * AddressFormModal
 * Professional Vietnamese address entry form with cascading selects.
 * Uses provinces.open-api.vn for live administrative data.
 */
import { useEffect, useState, useRef } from "react";
import {
  X,
  Home,
  Briefcase,
  ChevronDown,
  Loader2,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import type { AddressEntity } from "../services/adminApi";
import { useVietnamAddress } from "../hooks/useVietnamAddress";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AddressFormPayload = Omit<AddressEntity, "_id" | "userId">;

type Props = {
  /** If provided, the modal is in edit mode */
  editingAddress?: AddressEntity | null;
  /** Whether this is the first address (auto-sets isDefault) */
  isFirstAddress?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: AddressFormPayload) => void;
  isLoading?: boolean;
};

// ---------------------------------------------------------------------------
// Small sub-component: stylised select with loading / disabled state
// ---------------------------------------------------------------------------

type SelectFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { code: number | string; name: string }[];
  isLoading?: boolean;
  disabled?: boolean;
  placeholder: string;
  required?: boolean;
};

function SelectField({
  label,
  value,
  onChange,
  options,
  isLoading,
  disabled,
  placeholder,
  required,
}: SelectFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || isLoading}
          required={required}
          className={`
            w-full appearance-none rounded-xl border px-3.5 py-2.5 text-sm
            outline-none transition pr-10
            ${
              disabled || isLoading
                ? "bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-white border-slate-200 text-slate-800 hover:border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            }
          `}
        >
          <option value="" disabled>
            {isLoading ? "Đang tải..." : placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt.code} value={String(opt.code)}>
              {opt.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <Loader2 size={14} className="animate-spin text-slate-400" />
          ) : (
            <ChevronDown size={14} className="text-slate-400" />
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small sub-component: text input
// ---------------------------------------------------------------------------

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
  type?: string;
  hint?: string;
};

function TextField({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = "text",
  hint,
}: TextFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition hover:border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 placeholder:text-slate-400"
      />
      {hint && (
        <p className="text-[10px] text-slate-400 leading-relaxed">{hint}</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function AddressFormModal({
  editingAddress,
  isFirstAddress = false,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: Props) {
  // Contact info
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  // Address structure
  const {
    provinces,
    districts,
    wards,
    selectedProvinceCode,
    selectedDistrictCode,
    provinceName,
    districtName,
    wardName,
    handleProvinceChange,
    handleDistrictChange,
    handleWardChange,
    reset: resetCascade,
    prefill,
  } = useVietnamAddress();

  const [street, setStreet] = useState("");
  const [detail, setDetail] = useState("");
  const [type, setType] = useState<"home" | "office">("home");
  const [isDefault, setIsDefault] = useState(false);

  // Pre-fill when editing or reset when opening for new
  const prevOpenRef = useRef(false);
  useEffect(() => {
    const justOpened = isOpen && !prevOpenRef.current;
    prevOpenRef.current = isOpen;

    if (!justOpened) return;

    if (editingAddress) {
      setFullName(editingAddress.fullName);
      setPhone(editingAddress.phone);
      setStreet(editingAddress.street);
      setDetail(editingAddress.detail || "");
      setType(editingAddress.type ?? "home");
      setIsDefault(editingAddress.isDefault ?? false);
      // Prefill cascading selects after provinces are loaded
      prefill(editingAddress.province, editingAddress.district, editingAddress.ward);
    } else {
      setFullName("");
      setPhone("");
      setStreet("");
      setDetail("");
      setType("home");
      setIsDefault(isFirstAddress);
      resetCascade();
    }
  }, [isOpen, editingAddress, isFirstAddress, prefill, resetCascade]);

  // When provinces load and we're editing, re-attempt prefill (province codes needed for cascading)
  useEffect(() => {
    if (editingAddress && isOpen && provinces.data.length > 0) {
      prefill(editingAddress.province, editingAddress.district, editingAddress.ward);
    }
  }, [provinces.data, editingAddress, isOpen, prefill]);

  // After districts load in edit mode, auto-select the matching district
  useEffect(() => {
    if (editingAddress && isOpen && districts.data.length > 0 && !selectedDistrictCode) {
      const matched = districts.data.find(
        (d) => d.name === editingAddress.district || d.name.toLowerCase() === editingAddress.district.toLowerCase()
      );
      if (matched) {
        handleDistrictChange(matched.code, matched.name);
      }
    }
  }, [districts.data, editingAddress, isOpen, selectedDistrictCode, handleDistrictChange]);

  // After wards load in edit mode, auto-select the matching ward
  useEffect(() => {
    if (editingAddress && isOpen && wards.data.length > 0 && !wardName) {
      const matched = wards.data.find(
        (w) => w.name === editingAddress.ward || w.name.toLowerCase() === editingAddress.ward.toLowerCase()
      );
      if (matched) {
        handleWardChange(matched.name);
      }
    }
  }, [wards.data, editingAddress, isOpen, wardName, handleWardChange]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) return;
    if (!phone.trim()) return;
    if (!provinceName.trim()) return;
    if (!districtName.trim()) return;
    if (!wardName.trim()) return;
    if (!street.trim()) return;

    onSubmit({
      fullName: fullName.trim(),
      phone: phone.trim(),
      province: provinceName,
      district: districtName,
      ward: wardName,
      street: street.trim(),
      detail: detail.trim(),
      type,
      isDefault,
      fullAddress: "",
      lat: undefined,
      lng: undefined,
    });
  };

  if (!isOpen) return null;

  const isEditMode = !!editingAddress;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-slate-950/50 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-[slideUp_0.25s_cubic-bezier(0.16,1,0.3,1)]"
        style={{ maxHeight: "92dvh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-rose-50 flex items-center justify-center">
              <MapPin size={15} className="text-rose-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isEditMode ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {isEditMode
                  ? "Chỉnh sửa thông tin giao hàng"
                  : "Địa chỉ sẽ được lưu cho lần sau"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition text-slate-500 hover:text-slate-700"
          >
            <X size={14} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Section: Contact info */}
          <div>
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-[0.14em] mb-3">
              Thông tin liên hệ
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField
                label="Họ và tên"
                value={fullName}
                onChange={setFullName}
                placeholder="Nguyễn Văn A"
                required
              />
              <TextField
                label="Số điện thoại"
                value={phone}
                onChange={setPhone}
                placeholder="0912 345 678"
                type="tel"
                required
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-slate-150" />

          {/* Section: Location */}
          <div>
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-[0.14em] mb-3">
              Địa chỉ giao hàng
            </p>
            <div className="space-y-4">
              {/* Province */}
              <SelectField
                label="Tỉnh / Thành phố"
                value={selectedProvinceCode ? String(selectedProvinceCode) : ""}
                onChange={(val) => {
                  const code = Number(val);
                  const prov = provinces.data.find((p) => p.code === code);
                  if (prov) handleProvinceChange(prov.code, prov.name);
                }}
                options={provinces.data.map((p) => ({
                  code: p.code,
                  name: p.name,
                }))}
                isLoading={provinces.isLoading}
                placeholder="-- Chọn tỉnh / thành phố --"
                required
              />

              {/* District */}
              <SelectField
                label="Quận / Huyện"
                value={selectedDistrictCode ? String(selectedDistrictCode) : ""}
                onChange={(val) => {
                  const code = Number(val);
                  const dist = districts.data.find((d) => d.code === code);
                  if (dist) handleDistrictChange(dist.code, dist.name);
                }}
                options={districts.data.map((d) => ({
                  code: d.code,
                  name: d.name,
                }))}
                isLoading={districts.isLoading}
                disabled={!selectedProvinceCode}
                placeholder={
                  selectedProvinceCode
                    ? "-- Chọn quận / huyện --"
                    : "Chọn tỉnh trước"
                }
                required
              />

              {/* Ward */}
              <SelectField
                label="Phường / Xã / Thị trấn"
                value={wardName}
                onChange={(val) => handleWardChange(val)}
                options={wards.data.map((w) => ({
                  code: w.name,
                  name: w.name,
                }))}
                isLoading={wards.isLoading}
                disabled={!selectedDistrictCode}
                placeholder={
                  selectedDistrictCode
                    ? "-- Chọn phường / xã --"
                    : "Chọn quận/huyện trước"
                }
                required
              />

              {/* Street */}
              <TextField
                label="Đường, số nhà, thôn/ấp"
                value={street}
                onChange={setStreet}
                placeholder="Ví dụ: Số 12, Ấp 1, Quốc lộ 13"
                required
                hint="Nhập đầy đủ để hệ thống tính phí vận chuyển chính xác."
              />

              {/* Detail */}
              <TextField
                label="Ghi chú thêm (Không bắt buộc)"
                value={detail}
                onChange={setDetail}
                placeholder="Gần ngã tư, màu cổng, số tầng..."
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-slate-150" />

          {/* Section: Type + Default */}
          <div>
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-[0.14em] mb-3">
              Loại địa chỉ
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setType("home")}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition ${
                  type === "home"
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Home size={13} />
                Nhà riêng
              </button>
              <button
                type="button"
                onClick={() => setType("office")}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition ${
                  type === "office"
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Briefcase size={13} />
                Văn phòng
              </button>
            </div>

            {(!editingAddress || !editingAddress.isDefault) && (
              <label className="mt-4 flex items-center gap-3 cursor-pointer select-none group">
                <div
                  onClick={() => setIsDefault((v) => !v)}
                  className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition flex-shrink-0 ${
                    isDefault
                      ? "border-rose-500 bg-rose-500"
                      : "border-slate-300 bg-white group-hover:border-slate-400"
                  }`}
                >
                  {isDefault && <CheckCircle2 size={12} className="text-white" />}
                </div>
                <span className="text-xs font-medium text-slate-600">
                  Đặt làm địa chỉ mặc định
                </span>
              </label>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-4 border-t border-slate-100 shrink-0 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition active:scale-[0.98]"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 rounded-xl bg-slate-950 py-3 text-sm font-bold text-white hover:bg-slate-800 transition disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 size={14} className="animate-spin" />}
            {isLoading ? "Đang lưu..." : isEditMode ? "Lưu thay đổi" : "Thêm địa chỉ"}
          </button>
        </div>
      </form>
    </div>
  );
}
