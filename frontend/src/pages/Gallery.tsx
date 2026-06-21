import { useMemo, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import SectionTitle from "../components/SectionTitle";
import GalleryCard from "../components/GalleryCard";
import AnimatedContainer from "../components/AnimatedContainer";
import { beforeAfter, galleryItems } from "../constant/data";
import useSalonStore from "../store";

const Gallery = () => {
  const { filter, setFilter } = useSalonStore();
  const [active, setActive] = useState(filter);

  const categories = useMemo(
    () => ["Tất cả", "Tóc ngắn", "Tóc dài", "Tóc nhuộm", "Tóc uốn"],
    []
  );
  const filtered = useMemo(() => {
    if (active === "Tất cả") return galleryItems;
    return galleryItems.filter((i) => i.category === active);
  }, [active]);

  const updateFilter = (cat: string) => {
    setActive(cat);
    setFilter(cat);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 space-y-14">
      <SectionTitle
        eyebrow="Tuyển Tập"
        title="Tuyển Tập Dấu Ấn Thanh Xuân"
        description="Lưu giữ những tác phẩm nghệ thuật trên từng lọn tóc. Cảm nhận nhịp đập của xu hướng qua lăng kính mềm mại, tự nhiên đầy nét thơ của Dương Chi."
        align="left"
      />

      <div className="flex flex-wrap gap-3">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => updateFilter(cat)}
            className={`rounded-full border px-4 py-2 text-sm transition-all ${
              active === cat
                ? "border-rose-300 bg-rose-50 text-rose-600 shadow-sm"
                : "border-rose-100 bg-white text-slate-700 hover:border-rose-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {filtered.map((item, idx) => (
          <AnimatedContainer key={`${item.src}-${idx}`} delay={idx * 0.03}>
            <GalleryCard src={item.src} alt={item.alt} label={item.category} />
          </AnimatedContainer>
        ))}
      </div>

      <section className="space-y-6">
        <SectionTitle
          eyebrow="Sự Khác Biệt"
          title="Phiên Bản Rạng Rỡ Nhất Của Chính Mình"
          description="Không cần ánh đèn flash hay filter cầu kì, sự lột xác tự nhiên ánh lên từ độ bóng khỏe thực sự của mái tóc."
          align="left"
        />
        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 4200 }}
          slidesPerView={1}
          spaceBetween={20}
          className="rounded-3xl border border-rose-100 bg-white/70 p-4 shadow-lg shadow-rose-100"
        >
          {beforeAfter.map((pair, idx) => (
            <SwiperSlide key={idx}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="overflow-hidden rounded-2xl">
                  <img
                    src={pair.before}
                    alt="Before style"
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
                <div className="overflow-hidden rounded-2xl">
                  <img
                    src={pair.after}
                    alt="After style"
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>
    </div>
  );
};

export default Gallery;
