import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarPlus,
  FileClock,
  FlaskConical,
  Package,
  Sparkles,
  StickyNote,
  UserRound,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import LoadingSpinner from "../../LoadingSpinner";
import {
  addCustomerHairFormula,
  addCustomerNote,
  fetchAdminCustomerDetail,
  queryKeys,
} from "../../../services/adminApi";
import { getApiErrorMessage } from "../../../services/api";
import type { CustomerDetailSection } from "./CustomerCard";
import CustomerHistoryTable from "./CustomerHistoryTable";
import CustomerNotes from "./CustomerNotes";
import CustomerSegmentBadge from "./CustomerSegmentBadge";
import HairFormulaForm, { HairFormulaPayload } from "./HairFormulaForm";
import { formatCurrency, formatDate, formatDateTime } from "./customerFormatters";

type CustomerDetailModalProps = {
  customerId: string | null;
  initialSection: CustomerDetailSection;
  onClose: () => void;
  onRebook: () => void;
};

const tabItems: Array<{
  value: CustomerDetailSection;
  label: string;
  icon: typeof UserRound;
}> = [
  { value: "overview", label: "Hồ sơ", icon: UserRound },
  { value: "history", label: "Lịch sử", icon: FileClock },
  { value: "notes", label: "Ghi chú", icon: StickyNote },
  { value: "formulas", label: "Công thức màu", icon: FlaskConical },
  { value: "products", label: "Sản phẩm", icon: Package },
];

const CustomerDetailModal = ({
  customerId,
  initialSection,
  onClose,
  onRebook,
}: CustomerDetailModalProps) => {
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState<CustomerDetailSection>(initialSection);

  useEffect(() => {
    setActiveSection(initialSection);
  }, [customerId, initialSection]);

  const detailQuery = useQuery({
    queryKey: [...queryKeys.adminCustomerDetails, customerId],
    queryFn: () => fetchAdminCustomerDetail(customerId as string),
    enabled: Boolean(customerId),
  });

  const invalidateCustomerData = () => {
    queryClient.invalidateQueries({ queryKey: [...queryKeys.adminCustomers] });
    queryClient.invalidateQueries({
      queryKey: [...queryKeys.adminCustomerDetails, customerId],
    });
  };

  const noteMutation = useMutation({
    mutationFn: (payload: Parameters<typeof addCustomerNote>[1]) =>
      addCustomerNote(customerId as string, payload),
    onSuccess: () => {
      toast.success("Đã lưu ghi chú CRM");
      invalidateCustomerData();
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Không thể lưu ghi chú khách hàng")),
  });

  const formulaMutation = useMutation({
    mutationFn: (payload: HairFormulaPayload) =>
      addCustomerHairFormula(customerId as string, payload),
    onSuccess: () => {
      toast.success("Đã lưu công thức màu");
      invalidateCustomerData();
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Không thể lưu công thức màu")),
  });

  if (!customerId) return null;

  const customer = detailQuery.data;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-2 sm:p-4">
      <div className="flex max-h-[96vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 p-4 sm:p-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-600">
              Hồ sơ CRM salon
            </p>
            <h2 className="mt-1 truncate text-xl font-bold text-slate-900 sm:text-2xl">
              {customer?.fullName || "Đang tải khách hàng..."}
            </h2>
            {customer ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {customer.segments.map((segment) => (
                  <CustomerSegmentBadge key={segment} segment={segment} />
                ))}
              </div>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {customer ? (
              <button
                type="button"
                onClick={onRebook}
                disabled={!customer.phone}
                className="hidden items-center gap-2 rounded-xl bg-cyan-600 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-50 sm:inline-flex"
              >
                <CalendarPlus size={16} />
                Tạo lịch hẹn
              </button>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Đóng chi tiết khách hàng"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-slate-50 px-3 py-2">
          {tabItems.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveSection(tab.value)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${
                  activeSection === tab.value
                    ? "bg-white text-cyan-700 shadow-sm"
                    : "text-slate-600 hover:bg-white/70"
                }`}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <main className="flex-1 overflow-y-auto p-4 sm:p-5">
          {detailQuery.isLoading ? (
            <div className="py-16">
              <LoadingSpinner size="lg" label="Đang tải hồ sơ CRM..." />
            </div>
          ) : null}

          {detailQuery.isError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center">
              <p className="font-semibold text-rose-800">Không thể tải chi tiết khách hàng.</p>
              <button
                type="button"
                onClick={() => detailQuery.refetch()}
                className="mt-3 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Thử lại
              </button>
            </div>
          ) : null}

          {customer && activeSection === "overview" ? (
            <div className="space-y-5">
              <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Số lịch hẹn</p>
                  <p className="mt-2 text-2xl font-bold">{customer.totalAppointments}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Tổng chi tiêu</p>
                  <p className="mt-2 text-2xl font-bold">{formatCurrency(customer.totalSpent)}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Lần gần nhất</p>
                  <p className="mt-2 text-lg font-bold">{formatDate(customer.lastVisitAt)}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Ghi chú CRM</p>
                  <p className="mt-2 text-2xl font-bold">{customer.noteCount}</p>
                </div>
              </section>

              <section className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-4">
                  <h3 className="font-semibold text-slate-900">Thông tin cá nhân</h3>
                  <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-slate-500">Họ tên</dt>
                      <dd className="font-semibold text-slate-800">{customer.fullName}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Số điện thoại</dt>
                      <dd className="font-semibold text-slate-800">{customer.phone || "-"}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Email</dt>
                      <dd className="break-all font-semibold text-slate-800">
                        {customer.email || "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Thợ quen</dt>
                      <dd className="font-semibold text-slate-800">
                        {customer.preferredStaff || "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Ngày tạo hồ sơ</dt>
                      <dd className="font-semibold text-slate-800">
                        {formatDate(customer.createdAt)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Màu từng sử dụng</dt>
                      <dd className="font-semibold text-slate-800">
                        {customer.hairColorHistory.join(", ") || "-"}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-4">
                  <h3 className="flex items-center gap-2 font-semibold text-rose-900">
                    <Sparkles size={17} />
                    Gợi ý chăm sóc lại
                  </h3>
                  <ul className="mt-3 space-y-2 text-sm text-rose-800">
                    {customer.careSuggestions.map((suggestion) => (
                      <li key={suggestion} className="flex items-start gap-2">
                        <span>•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                  {customer.lastNote ? (
                    <div className="mt-4 rounded-lg bg-white/80 p-3 text-sm text-slate-700">
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        Ghi chú gần nhất
                      </p>
                      <p className="mt-1">{customer.lastNote}</p>
                    </div>
                  ) : null}
                </div>
              </section>
            </div>
          ) : null}

          {customer && activeSection === "history" ? (
            <CustomerHistoryTable history={customer.history} />
          ) : null}

          {customer && activeSection === "notes" ? (
            <CustomerNotes
              notes={customer.notes}
              isSaving={noteMutation.isPending}
              onSave={(payload) => noteMutation.mutate(payload)}
            />
          ) : null}

          {customer && activeSection === "formulas" ? (
            <div className="space-y-5">
              <HairFormulaForm
                history={customer.history}
                isSaving={formulaMutation.isPending}
                onSave={(payload) => formulaMutation.mutate(payload)}
              />
              <div className="grid gap-3 lg:grid-cols-2">
                {customer.hairFormulas.map((formula) => (
                  <article key={formula._id} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-slate-900">{formula.colorName}</p>
                        <p className="text-sm text-slate-500">{formula.serviceName}</p>
                      </div>
                      <span className="text-xs text-slate-500">
                        {formatDateTime(formula.createdAt)}
                      </span>
                    </div>
                    <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <dt className="text-slate-500">Công thức</dt>
                        <dd className="font-semibold text-slate-800">{formula.formula}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Oxy</dt>
                        <dd>{formula.oxidant || "-"}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Nền tóc</dt>
                        <dd>{formula.hairBaseLevel || "-"}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Trước khi làm</dt>
                        <dd>{formula.hairConditionBefore || "-"}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Sau khi làm</dt>
                        <dd>{formula.hairConditionAfter || "-"}</dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-slate-500">Chăm sóc tại nhà</dt>
                        <dd>{formula.aftercareAdvice || "-"}</dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
              {!customer.hairFormulas.length ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                  Chưa có công thức màu nào được lưu.
                </div>
              ) : null}
            </div>
          ) : null}

          {customer && activeSection === "products" ? (
            <div className="space-y-3">
              {customer.purchasedProducts.map((product, index) => (
                <article
                  key={`${product.orderId}-${product.productId}-${index}`}
                  className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{product.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Mua ngày {formatDate(product.purchasedAt)} · Số lượng {product.quantity}
                    </p>
                  </div>
                  <p className="font-bold text-slate-900">
                    {formatCurrency(product.price * product.quantity)}
                  </p>
                </article>
              ))}
              {!customer.purchasedProducts.length ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                  Chưa có sản phẩm đã mua.
                </div>
              ) : null}
            </div>
          ) : null}
        </main>

        {customer ? (
          <footer className="border-t border-slate-200 p-3 sm:hidden">
            <button
              type="button"
              onClick={onRebook}
              disabled={!customer.phone}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              <CalendarPlus size={16} />
              Tạo lịch hẹn
            </button>
          </footer>
        ) : null}
      </div>
    </div>
  );
};

export default CustomerDetailModal;
