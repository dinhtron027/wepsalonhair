import type { CustomerHistoryItem } from "../../../services/adminApi";
import {
  bookingStatusLabels,
  formatCurrency,
  formatDate,
} from "./customerFormatters";

type CustomerHistoryTableProps = {
  history: CustomerHistoryItem[];
};

const CustomerHistoryTable = ({ history }: CustomerHistoryTableProps) => {
  if (!history.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
        Khách hàng chưa có lịch sử dịch vụ.
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto rounded-xl border border-slate-200 md:block">
        <table className="min-w-[1200px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-3 font-semibold">Ngày giờ</th>
              <th className="px-3 py-3 font-semibold">Dịch vụ</th>
              <th className="px-3 py-3 font-semibold">Nhóm</th>
              <th className="px-3 py-3 font-semibold">Thợ</th>
              <th className="px-3 py-3 font-semibold">Màu / Công thức</th>
              <th className="px-3 py-3 font-semibold">Tình trạng tóc</th>
              <th className="px-3 py-3 font-semibold">Trạng thái</th>
              <th className="px-3 py-3 font-semibold">Chi phí</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item.bookingId} className="border-t border-slate-100 align-top">
                <td className="whitespace-nowrap px-3 py-3 text-slate-700">
                  {formatDate(item.date)} {item.time}
                </td>
                <td className="px-3 py-3">
                  <p className="font-semibold text-slate-800">{item.serviceName}</p>
                  {item.note ? <p className="mt-1 text-xs text-slate-500">{item.note}</p> : null}
                </td>
                <td className="px-3 py-3 text-slate-600">{item.serviceCategory || "-"}</td>
                <td className="px-3 py-3 text-slate-600">{item.stylist || "-"}</td>
                <td className="max-w-xs px-3 py-3 text-slate-600">
                  <p className="font-medium text-slate-800">{item.hairColorUsed || "-"}</p>
                  {item.formula ? <p className="mt-1 text-xs">{item.formula}</p> : null}
                  {item.oxidant ? <p className="mt-1 text-xs">Oxy: {item.oxidant}</p> : null}
                </td>
                <td className="max-w-xs px-3 py-3 text-xs text-slate-600">
                  <p>Trước: {item.hairConditionBefore || "-"}</p>
                  <p className="mt-1">Sau: {item.hairConditionAfter || "-"}</p>
                </td>
                <td className="px-3 py-3">
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                    {bookingStatusLabels[item.status]}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-3 font-semibold text-slate-800">
                  {formatCurrency(item.totalPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {history.map((item) => (
          <article key={item.bookingId} className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{item.serviceName}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {formatDate(item.date)} · {item.time} · {item.stylist || "Chưa có thợ"}
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">
                {bookingStatusLabels[item.status]}
              </span>
            </div>
            <dl className="mt-3 grid gap-2 text-xs text-slate-600">
              <div>
                <dt className="font-semibold text-slate-800">Nhóm dịch vụ</dt>
                <dd>{item.serviceCategory || "-"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-800">Màu / công thức</dt>
                <dd>{item.hairColorUsed || "-"}</dd>
                {item.formula ? <dd>{item.formula}</dd> : null}
              </div>
              <div>
                <dt className="font-semibold text-slate-800">Tình trạng tóc</dt>
                <dd>Trước: {item.hairConditionBefore || "-"}</dd>
                <dd>Sau: {item.hairConditionAfter || "-"}</dd>
              </div>
            </dl>
            <p className="mt-3 border-t border-slate-100 pt-3 text-sm font-bold text-slate-900">
              {formatCurrency(item.totalPrice)}
            </p>
          </article>
        ))}
      </div>
    </>
  );
};

export default CustomerHistoryTable;
