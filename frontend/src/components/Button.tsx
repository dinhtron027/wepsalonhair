import { Link } from "react-router-dom";
import { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  to?: string;
  onClick?: () => void;
  variant?: "primary" | "ghost";
  fullWidth?: boolean;
  className?: string;
};

const baseClasses =
  "inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

const variants = {
  primary:
    "bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-200 hover:shadow-[0_10px_35px_rgba(244,63,94,0.35)] focus:ring-rose-300",
  ghost:
    "bg-white/70 text-rose-500 border border-rose-100 hover:bg-rose-50 focus:ring-rose-200",
};

const Button = ({
  children,
  to,
  onClick,
  variant = "primary",
  fullWidth,
  className = "",
}: ButtonProps) => {
  const composed = `${baseClasses} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`;
  if (to) {
    return (
      <Link to={to} className={composed}>
        {children}
      </Link>
    );
  }
  return (
    <button className={composed} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
