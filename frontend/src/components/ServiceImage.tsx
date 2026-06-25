import { useState } from "react";

type ServiceImageProps = {
  src?: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
};

export const ServiceImage = ({
  src,
  alt,
  className = "",
  aspectRatio = "aspect-[16/10]"
}: ServiceImageProps) => {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div
        className={`w-full h-full bg-slate-50 flex flex-col items-center justify-center p-3 select-none ${aspectRatio} ${className}`}
      >
        <svg
          className="w-8 h-8 text-slate-300 mb-1.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
          />
        </svg>
        <span className="text-[9px] uppercase tracking-widest text-slate-400 font-medium text-center font-sans">
          Dương Chi Salon
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className={`w-full h-full object-cover transition-transform duration-500 ease-out ${aspectRatio} ${className}`}
      loading="lazy"
    />
  );
};

export default ServiceImage;
