import { useState } from "react";
import SectionTitle from "../components/SectionTitle";
import AnimatedContainer from "../components/AnimatedContainer";
import Button from "../components/Button";
import { newsPosts } from "../data/newsPosts";
import useSEO from "../hooks/useSEO";
import { optimizeCloudinaryUrl } from "../utils/cloudinary";


// Sub-component to handle image load errors gracefully
const BlogImage = ({ src, alt }: { src: string; alt: string }) => {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className="h-48 w-full bg-slate-50 flex flex-col items-center justify-center border-b border-slate-100 p-4 select-none">
        <svg
          className="w-10 h-10 text-slate-300 mb-2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375 0 1 1-.75 0 .375 0 0 1 .75 0z"
          />
        </svg>
        <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold font-sans">
          Dương Chi Salon
        </span>
      </div>
    );
  }

  return (
    <img
      src={optimizeCloudinaryUrl(src, 600)}
      alt={alt}
      onError={() => setError(true)}
      className="h-48 w-full object-cover group-hover:scale-105 transition duration-700 ease-out"
    />
  );
};

const News = () => {
  useSEO({
    title: "Blog & Cảm Hứng Tóc — Salon Dương Chi",
    description:
      "Khám phá các bài viết xu hướng tóc, mẹo chăm sóc tóc và cảm hứng làm đẹp từ Salon Dương Chi, Lộc Ninh, Bình Phước.",
    canonical: "/news",
    ogUrl: "/news",
  });
  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 space-y-16 pt-8">

      {/* Header */}
      <SectionTitle
        eyebrow="Tin tức & cảm hứng"
        title="Khám phá xu hướng tóc mới"
        description="Những xu hướng làm tóc mới, bí quyết chăm sóc tóc và câu chuyện làm đẹp được chia sẻ bởi stylist tại Salon Dương Chi."
        align="left"
      />

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {newsPosts.map((a, idx) => (
          <AnimatedContainer
            key={a.slug}
            delay={idx * 0.05}
            className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200/60 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-neutral-300/80 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
          >
            {/* Image */}
            <div className="overflow-hidden bg-slate-50 border-b border-slate-100">
              <BlogImage src={a.image} alt={a.title} />
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col p-6 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="uppercase tracking-wider text-taupe font-semibold">
                  {a.tag}
                </span>
                <span className="text-slate-500">{a.date}</span>
              </div>

              <h3 className="text-base font-semibold text-slate-900 leading-snug line-clamp-1 group-hover:text-charcoal transition-colors">
                {a.title}
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 flex-1">
                {a.desc}
              </p>

              <div className="pt-4 mt-auto border-t border-slate-50">
                <Button to={`/news/${a.slug}`} variant="ghost">
                  Đọc thêm
                </Button>
              </div>
            </div>
          </AnimatedContainer>
        ))}
      </div>

      {/* Bottom CTA */}
      <AnimatedContainer className="rounded-2xl border border-neutral-200/60 bg-white p-8 text-center hover:border-neutral-300/80 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300">
        <h3 className="text-xl font-semibold text-charcoal">
          Muốn cập nhật xu hướng tóc mới nhất?
        </h3>

        <p className="text-slate-600 mt-3 max-w-xl mx-auto text-sm leading-relaxed">
          Đội ngũ stylist tại Salon Dương Chi luôn cập nhật các xu hướng làm tóc
          mới nhất từ Hàn Quốc và Nhật Bản để mang đến những kiểu tóc hiện đại,
          phù hợp với phong cách của bạn.
        </p>

        <div className="mt-6 flex justify-center">
          <Button to="/booking" variant="primary">
            Đặt lịch làm tóc
          </Button>
        </div>
      </AnimatedContainer>
    </div>
  );
};

export default News;
