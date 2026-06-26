import React from "react";
import { BookingStatus } from "../../../services/adminApi";
import { statusLabelMap } from "./dateUtils";

type BookingStatusBadgeProps = {
  status: BookingStatus;
  className?: string;
};

const statusStyles: Record<
  BookingStatus,
  { bg: string; text: string; border: string; dot: string }
> = {
  pending: {
    bg: "bg-amber-50 dark:bg-amber-950/20",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800/40",
    dot: "bg-amber-500",
  },
  confirmed: {
    bg: "bg-blue-50 dark:bg-blue-950/20",
    text: "text-blue-700 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800/40",
    dot: "bg-blue-500",
  },
  in_service: {
    bg: "bg-teal-50 dark:bg-teal-950/20",
    text: "text-teal-700 dark:text-teal-400",
    border: "border-teal-200 dark:border-teal-800/40",
    dot: "bg-teal-500",
  },
  completed: {
    bg: "bg-emerald-50 dark:bg-emerald-950/20",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800/40",
    dot: "bg-emerald-500",
  },
  cancelled: {
    bg: "bg-rose-50 dark:bg-rose-950/20",
    text: "text-rose-700 dark:text-rose-400",
    border: "border-rose-200 dark:border-rose-800/40",
    dot: "bg-rose-500",
  },
};

const BookingStatusBadge: React.FC<BookingStatusBadgeProps> = ({ status, className = "" }) => {
  const styles = statusStyles[status] || statusStyles.pending;
  const label = statusLabelMap[status] || status;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles.bg} ${styles.text} ${styles.border} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
      {label}
    </span>
  );
};

export default BookingStatusBadge;
