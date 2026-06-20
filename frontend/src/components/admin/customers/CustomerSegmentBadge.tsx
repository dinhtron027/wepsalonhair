import type { CustomerSegment } from "../../../services/adminApi";

const segmentStyles: Record<CustomerSegment, { label: string; className: string }> = {
  new: {
    label: "Khách mới",
    className: "border-sky-200 bg-sky-50 text-sky-700",
  },
  regular: {
    label: "Khách quen",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  vip: {
    label: "VIP",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  inactive: {
    label: "Lâu chưa quay lại",
    className: "border-slate-200 bg-slate-100 text-slate-700",
  },
  high_value: {
    label: "Chi tiêu cao",
    className: "border-violet-200 bg-violet-50 text-violet-700",
  },
  color_customer: {
    label: "Hay nhuộm",
    className: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700",
  },
  treatment_needed: {
    label: "Nên phục hồi",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
};

type CustomerSegmentBadgeProps = {
  segment: CustomerSegment;
};

const CustomerSegmentBadge = ({ segment }: CustomerSegmentBadgeProps) => {
  const config = segmentStyles[segment];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
};

export default CustomerSegmentBadge;
