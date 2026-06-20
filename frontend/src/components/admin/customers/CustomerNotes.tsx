import { useState } from "react";
import type { CustomerNote, CustomerNoteType } from "../../../services/adminApi";
import { formatDateTime, noteTypeLabels } from "./customerFormatters";

type CustomerNotesProps = {
  notes: CustomerNote[];
  isSaving: boolean;
  onSave: (payload: { note: string; type: CustomerNoteType }) => void;
};

const CustomerNotes = ({ notes, isSaving, onSave }: CustomerNotesProps) => {
  const [note, setNote] = useState("");
  const [type, setType] = useState<CustomerNoteType>("consultation");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!note.trim()) return;
    onSave({ note: note.trim(), type });
    setNote("");
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 p-4">
        <h4 className="font-semibold text-slate-900">Thêm ghi chú CRM</h4>
        <label className="mt-4 block text-sm">
          <span className="mb-1 block font-medium text-slate-600">Loại ghi chú</span>
          <select
            value={type}
            onChange={(event) => setType(event.target.value as CustomerNoteType)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-cyan-400"
          >
            {Object.entries(noteTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="mt-3 block text-sm">
          <span className="mb-1 block font-medium text-slate-600">Nội dung</span>
          <textarea
            required
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={6}
            placeholder="Ghi lại nhu cầu, tình trạng tóc, phản hồi hoặc lịch chăm sóc..."
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-cyan-400"
          />
        </label>
        <button
          type="submit"
          disabled={isSaving || !note.trim()}
          className="mt-3 w-full rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-60"
        >
          {isSaving ? "Đang lưu..." : "Lưu ghi chú"}
        </button>
      </form>

      <div className="space-y-3">
        {notes.map((item) => (
          <article key={item._id} className="rounded-xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                {noteTypeLabels[item.type]}
              </span>
              <span className="text-xs text-slate-500">{formatDateTime(item.createdAt)}</span>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
              {item.note}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Người tạo: {item.createdBy?.name || "Hệ thống"}
            </p>
          </article>
        ))}
        {!notes.length ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
            Chưa có ghi chú CRM.
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default CustomerNotes;
