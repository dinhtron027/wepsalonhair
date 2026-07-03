import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import { newsPosts } from "../data/newsPosts";
import SectionTitle from "../components/SectionTitle";
import { optimizeCloudinaryUrl } from "../utils/cloudinary";


const NewsDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = newsPosts.find((p) => p.slug === slug);
  const [imageError, setImageError] = useState(false);

  if (!post) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-24 text-center space-y-6">
        <SectionTitle
          title="Không tìm thấy bài viết"
          description="Bài viết bạn đang tìm kiếm không tồn tại hoặc đã được gỡ bỏ."
        />
        <div className="pt-6">
          <Link
            to="/news"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 active:scale-98"
          >
            <ArrowLeft size={16} strokeWidth={1.5} />
            Quay lại trang tin tức
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-4xl px-6 pb-24 pt-8 space-y-10">
      {/* Navigation & Header */}
      <div className="space-y-6">
        <Link
          to="/news"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={14} strokeWidth={2} />
          Quay lại Blog / Cảm hứng
        </Link>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
            <span className="inline-flex items-center gap-1 text-taupe font-semibold uppercase tracking-wider">
              <Tag size={12} strokeWidth={2} />
              {post.tag}
            </span>
            <span className="h-3 w-px bg-slate-200" />
            <span className="inline-flex items-center gap-1">
              <Calendar size={12} strokeWidth={1.5} />
              {post.date}
            </span>
          </div>

          <h1 className="font-display text-4xl leading-[1.15] text-charcoal md:text-5xl font-normal tracking-tight">
            {post.title}
          </h1>
        </div>
      </div>

      {/* Hero Image / Placeholder */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 aspect-[16/9] md:aspect-[21/9]">
        {imageError ? (
          <div className="h-full w-full bg-slate-50 flex flex-col items-center justify-center p-6 select-none">
            <svg
              className="w-16 h-16 text-slate-200 mb-3"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375 0 11-.75 0 .375 0 01.75 0z"
              />
            </svg>
            <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold font-sans">
              Dương Chi Salon
            </span>
          </div>
        ) : (
          <img
            src={optimizeCloudinaryUrl(post.image, 1200)}
            alt={post.title}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover transition-transform duration-700 ease-out"
          />
        )}
      </div>

      {/* Article Content */}
      <div className="mx-auto max-w-3xl text-slate-700 leading-relaxed space-y-6 pt-4 text-base font-sans">
        {post.content.map((paragraph, index) => (
          <p key={index} className="text-justify md:text-left">
            {paragraph}
          </p>
        ))}
      </div>
    </article>
  );
};

export default NewsDetail;
