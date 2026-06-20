import {
  CircleDollarSign,
  Crown,
  RotateCcw,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import type { CustomerSummary } from "../../../services/adminApi";
import { formatCurrency } from "./customerFormatters";

type CustomerSummaryCardsProps = {
  summary?: CustomerSummary;
};

const CustomerSummaryCards = ({ summary }: CustomerSummaryCardsProps) => {
  const cards = [
    {
      label: "Tổng khách hàng",
      value: summary?.totalCustomers || 0,
      icon: Users,
      className: "bg-slate-900 text-white",
    },
    {
      label: "Khách mới",
      value: summary?.newCustomers || 0,
      icon: UserPlus,
      className: "bg-sky-50 text-sky-800",
    },
    {
      label: "Khách VIP",
      value: summary?.vipCustomers || 0,
      icon: Crown,
      className: "bg-amber-50 text-amber-800",
    },
    {
      label: "Lâu chưa quay lại",
      value: summary?.inactiveCustomers || 0,
      icon: RotateCcw,
      className: "bg-violet-50 text-violet-800",
    },
    {
      label: "Doanh thu khách hàng",
      value: formatCurrency(summary?.totalRevenue || 0),
      icon: CircleDollarSign,
      className: "bg-emerald-50 text-emerald-800",
    },
    {
      label: "Cần chăm sóc lại",
      value: summary?.followUpCustomers || 0,
      icon: Sparkles,
      className: "bg-rose-50 text-rose-800",
    },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <article key={card.label} className={`rounded-2xl p-4 shadow-sm ${card.className}`}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium opacity-75">{card.label}</p>
              <Icon size={17} className="shrink-0 opacity-75" />
            </div>
            <p className="mt-3 text-xl font-bold">{card.value}</p>
          </article>
        );
      })}
    </section>
  );
};

export default CustomerSummaryCards;
