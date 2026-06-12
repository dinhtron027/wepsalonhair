type LoadingSpinnerProps = {
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeMap = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-10 w-10 border-4",
};

const LoadingSpinner = ({ label, size = "md", className = "" }: LoadingSpinnerProps) => {
  return (
    <div className={`flex items-center justify-center gap-2 text-slate-600 ${className}`}>
      <span className={`${sizeMap[size]} animate-spin rounded-full border-rose-500 border-t-transparent`} />
      {label ? <span className="text-sm">{label}</span> : null}
    </div>
  );
};

export default LoadingSpinner;
