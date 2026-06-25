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
  "inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-300 ease-out active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2";

const variants = {
  primary:
    "bg-slate-900 text-white hover:bg-black shadow-[0_4px_12px_rgba(0,0,0,0.05)]",
  ghost:
    "bg-transparent text-slate-900 border border-slate-200 hover:bg-slate-50",
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
