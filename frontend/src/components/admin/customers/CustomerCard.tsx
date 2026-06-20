import {
  CalendarPlus,
  Clipboard,
  Eye,
  FileClock,
  FlaskConical,
  Mail,
  MessageSquarePlus,
  Phone,
  Scissors,
  Sparkles,
  UserRound,
} from "lucide-react";
import toast from "react-hot-toast";
import type { CustomerEntity } from "../../../services/adminApi";
import CustomerSegmentBadge from "./CustomerSegmentBadge";
import { formatCurrency, formatDate } from "./customerFormatters";

export type CustomerDetailSection =
  | "overview"
  | "history"
  | "notes"
  | "formulas"
  | "products";

type CustomerCardProps = {
  customer: CustomerEntity;
  onOpen: (section: CustomerDetailSection) => void;
  onRebook: () => void;
};

const CustomerCard = ({ customer, onOpen, onRebook }: CustomerCardProps) => {
  const copyPhone = async () => {
    if (!customer.phone) return;
    await navigator.clipboard.writeText(customer.phone);
    toast.success("Đã sao chép số điện thoại");
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-cyan-200 hover:shadow-md">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 space-y-3 xl:max-w-sm">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-lg font-bold text-slate-900">{customer.fullName}</h3>
              {customer.segments.map((segment) => (
                <CustomerSegmentBadge key={segment} segment={segment} />
              ))}
            </div>

            <div className="mt-2 space-y-1 text-sm text-slate-500">
              <p className="flex items-center gap-2">
                <Phone size={14} />
                {customer.phone || "Chưa có số điện thoại"}
              </p>
              <p className="flex items-center gap-2 break-all">
                <Mail size={14} />
                {customer.email || "Chưa có email"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {customer.phone ? (
              <>
                <a
                  href={`tel:${customer.phone}`}
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                >
                  <Phone size={13} />
                  Gọi khách
                </a>
                <button
                  type="button"
                  onClick={copyPhone}
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                >
                  <Clipboard size={13} />
                  Sao chép SĐT
                </button>
              </>
            ) : null}
          </div>
        </div>

        <div className="grid flex-1 gap-3 sm:grid-cols-3 xl:max-w-2xl">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Số lịch hẹn</p>
            <p className="mt-1 text-lg font-bold text-slate-900">{customer.totalAppointments}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Tổng chi tiêu</p>
            <p className="mt-1 text-lg font-bold text-slate-900">
              {formatCurrency(customer.totalSpent)}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Lần gần nhất</p>
            <p className="mt-1 text-sm font-bold text-slate-900">
              {formatDate(customer.lastVisitAt)}
            </p>
            {customer.inactiveForDays !== null ? (
              <p className="mt-0.5 text-xs text-slate-500">
                {customer.inactiveForDays} ngày trước
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-100 p-3">
          <p className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Scissors size={14} />
            Dịch vụ gần nhất
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-800">
            {customer.latestService?.serviceName || "Chưa có"}
          </p>
        </div>
        <div className="rounded-xl border border-slate-100 p-3">
          <p className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <UserRound size={14} />
            Thợ quen
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-800">
            {customer.preferredStaff || "Chưa xác định"}
          </p>
        </div>
        <div className="rounded-xl border border-slate-100 p-3">
          <p className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <FlaskConical size={14} />
            Màu gần nhất
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-800">
            {customer.latestHairFormula?.colorName ||
              customer.hairColorHistory.at(-1) ||
              "Chưa có"}
          </p>
        </div>
        <div className="rounded-xl border border-slate-100 p-3">
          <p className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <MessageSquarePlus size={14} />
            Ghi chú gần nhất
          </p>
          <p className="mt-2 line-clamp-2 text-sm text-slate-700">
            {customer.lastNote || "Chưa có ghi chú CRM"}
          </p>
        </div>
      </div>

      {customer.careSuggestions[0] ? (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-100 bg-rose-50/70 p-3 text-sm text-rose-800">
          <Sparkles size={16} className="mt-0.5 shrink-0" />
          <span>{customer.careSuggestions[0]}</span>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={() => onOpen("overview")}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800"
        >
          <Eye size={15} />
          Xem chi tiết
        </button>
        <button
          type="button"
          onClick={onRebook}
          disabled={!customer.phone}
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CalendarPlus size={15} />
          Tạo lịch hẹn
        </button>
        <button
          type="button"
          onClick={() => onOpen("notes")}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <MessageSquarePlus size={15} />
          Ghi chú
        </button>
        <button
          type="button"
          onClick={() => onOpen("formulas")}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <FlaskConical size={15} />
          Công thức màu
        </button>
        <button
          type="button"
          onClick={() => onOpen("history")}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <FileClock size={15} />
          Xem lịch sử
        </button>
      </div>
    </article>
  );
};

export default CustomerCard;
