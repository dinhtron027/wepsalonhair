import { useState } from "react";
import type { CustomerHistoryItem } from "../../../services/adminApi";

export type HairFormulaPayload = {
  appointmentId?: string;
  serviceName?: string;
  colorName: string;
  formula: string;
  oxidant?: string;
  hairBaseLevel?: string;
  hairConditionBefore?: string;
  hairConditionAfter?: string;
  aftercareAdvice?: string;
};

type HairFormulaFormProps = {
  history: CustomerHistoryItem[];
  isSaving: boolean;
  onSave: (payload: HairFormulaPayload) => void;
};

const defaultForm: HairFormulaPayload = {
  appointmentId: "",
  serviceName: "",
  colorName: "",
  formula: "",
  oxidant: "",
  hairBaseLevel: "",
  hairConditionBefore: "",
  hairConditionAfter: "",
  aftercareAdvice: "",
};

const inputClass =
  "w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-100";

const HairFormulaForm = ({ history, isSaving, onSave }: HairFormulaFormProps) => {
  const [form, setForm] = useState<HairFormulaPayload>(defaultForm);
  const update = (key: keyof HairFormulaPayload, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSave(form);
    setForm(defaultForm);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-fuchsia-100 bg-fuchsia-50/30 p-4">
      <div>
        <h4 className="font-semibold text-slate-900">Cập nhật công thức màu & tình trạng tóc</h4>
        <p className="mt-1 text-sm text-slate-500">
          Lưu đủ nền tóc, oxy và đánh giá trước/sau để lần làm tiếp theo có thể tái tạo chính xác.
        </p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="text-sm md:col-span-2">
          <span className="mb-1 block font-medium text-slate-600">Gắn với lịch hẹn</span>
          <select
            value={form.appointmentId || ""}
            onChange={(event) => {
              const historyItem = history.find((item) => item.bookingId === event.target.value);
              setForm((prev) => ({
                ...prev,
                appointmentId: event.target.value,
                serviceName: historyItem?.serviceName || prev.serviceName,
              }));
            }}
            className={inputClass}
          >
            <option value="">Không gắn lịch hẹn cụ thể</option>
            {history.map((item) => (
              <option key={item.bookingId} value={item.bookingId}>
                {new Date(item.date).toLocaleDateString("vi-VN")} - {item.serviceName}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-600">Tên dịch vụ</span>
          <input
            value={form.serviceName || ""}
            onChange={(event) => update("serviceName", event.target.value)}
            placeholder="Nhuộm balayage, phủ bạc..."
            className={inputClass}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-600">Tên màu *</span>
          <input
            required
            value={form.colorName}
            onChange={(event) => update("colorName", event.target.value)}
            placeholder="Ví dụ: Nâu lạnh ánh khói"
            className={inputClass}
          />
        </label>
        <label className="text-sm md:col-span-2">
          <span className="mb-1 block font-medium text-slate-600">Công thức màu *</span>
          <textarea
            required
            value={form.formula}
            onChange={(event) => update("formula", event.target.value)}
            rows={3}
            placeholder="Tỷ lệ màu, mix tone, thời gian lưu thuốc..."
            className={inputClass}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-600">Oxy / Oxidant</span>
          <input
            value={form.oxidant || ""}
            onChange={(event) => update("oxidant", event.target.value)}
            placeholder="Oxy 3%, 6%..."
            className={inputClass}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-600">Nền tóc</span>
          <input
            value={form.hairBaseLevel || ""}
            onChange={(event) => update("hairBaseLevel", event.target.value)}
            placeholder="Nền 5, nền 8..."
            className={inputClass}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-600">Tình trạng tóc trước khi làm</span>
          <textarea
            value={form.hairConditionBefore || ""}
            onChange={(event) => update("hairConditionBefore", event.target.value)}
            rows={3}
            className={inputClass}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-600">Tình trạng tóc sau khi làm</span>
          <textarea
            value={form.hairConditionAfter || ""}
            onChange={(event) => update("hairConditionAfter", event.target.value)}
            rows={3}
            className={inputClass}
          />
        </label>
        <label className="text-sm md:col-span-2">
          <span className="mb-1 block font-medium text-slate-600">Lời khuyên chăm sóc tại nhà</span>
          <textarea
            value={form.aftercareAdvice || ""}
            onChange={(event) => update("aftercareAdvice", event.target.value)}
            rows={3}
            className={inputClass}
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="mt-4 rounded-xl bg-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-fuchsia-700 disabled:opacity-60"
      >
        {isSaving ? "Đang lưu..." : "Lưu công thức màu"}
      </button>
    </form>
  );
};

export default HairFormulaForm;
