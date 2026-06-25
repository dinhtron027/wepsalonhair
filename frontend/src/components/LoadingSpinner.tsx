type LoadingSpinnerProps = {
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeMap = {
  sm: "h-4 w-4 border-[1.5px]",
  md: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-2",
};

const LoadingSpinner = ({ label, size = "md", className = "" }: LoadingSpinnerProps) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 text-slate-500 ${className}`}>
      <span className={`${sizeMap[size]} animate-spin rounded-full border-slate-200 border-t-slate-800`} />
      {label ? <span className="text-sm font-medium tracking-wide">{label}</span> : null}
    </div>
  );
};

export default LoadingSpinner;
