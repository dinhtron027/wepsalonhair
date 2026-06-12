import SectionTitle from "../components/SectionTitle";
import AnimatedContainer from "../components/AnimatedContainer";
import Button from "../components/Button";

const articles = [
  {
    title: "Xu hướng màu trà sữa 2026",
    date: "01/03/2026",
    tag: "Xu hướng tóc",
    desc: "Gam màu trà sữa beige – mocha đang trở thành xu hướng nổi bật trong năm 2026. Sự kết hợp giữa sắc nâu nhẹ và ánh beige tạo hiệu ứng tóc bóng mượt, phù hợp với làn da châu Á và dễ dàng phối hợp với nhiều phong cách thời trang.",
    image: "/images/news/hair-trend.jpg",
  },
  {
    title: "Kỹ thuật uốn S-wave ẩm mượt",
    date: "20/02/2026",
    tag: "Kỹ thuật làm tóc",
    desc: "Uốn S-wave mang đến những lọn tóc mềm mại và tự nhiên. Nhờ kỹ thuật kiểm soát nhiệt hiện đại và dưỡng chất phục hồi, mái tóc giữ được độ bóng khỏe, hạn chế khô xơ và giữ nếp lâu hơn.",
    image: "/images/news/perm-style.jpg",
  },
  {
    title: "Chăm sóc tóc mùa nóng",
    date: "10/02/2026",
    tag: "Chăm sóc tóc",
    desc: "Thời tiết nóng có thể khiến tóc khô, dễ gãy và nhanh phai màu. Một số bước đơn giản như chống UV cho tóc, dưỡng ẩm thường xuyên và chọn dầu gội phù hợp sẽ giúp mái tóc luôn mềm mượt.",
    image: "/images/news/hair-care.jpg",
  },
];

const News = () => {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 space-y-14">

      {/* Header */}
      <SectionTitle
        eyebrow="Tin tức & cảm hứng"
        title="Khám phá xu hướng tóc mới"
        description="Những xu hướng làm tóc mới, bí quyết chăm sóc tóc và câu chuyện làm đẹp được chia sẻ bởi stylist tại Salon Duong Chi."
        align="left"
      />

      {/* Articles */}
      <div className="grid gap-6 md:grid-cols-3">
        {articles.map((a, idx) => (
          <AnimatedContainer
            key={a.title}
            delay={idx * 0.05}
            className="group overflow-hidden rounded-3xl border border-rose-100 bg-white/80 shadow-lg shadow-rose-100 backdrop-blur-lg hover:shadow-xl transition"
          >
            {/* Image */}
            <div className="overflow-hidden">
              <img
                src={a.image}
                alt={a.title}
                className="h-48 w-full object-cover group-hover:scale-105 transition duration-500"
              />
            </div>

            {/* Content */}
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="uppercase tracking-wider text-rose-500 font-semibold">
                  {a.tag}
                </span>
                <span className="text-slate-500">{a.date}</span>
              </div>

              <h3 className="text-lg font-semibold text-slate-900 leading-snug">
                {a.title}
              </h3>

              <p className="text-sm text-slate-700 leading-relaxed">
                {a.desc}
              </p>

              <div className="pt-2">
                <Button to="/news-detail" variant="ghost">
                  Đọc thêm
                </Button>
              </div>
            </div>
          </AnimatedContainer>
        ))}
      </div>

      {/* Bottom CTA */}
      <AnimatedContainer className="rounded-3xl border border-rose-100 bg-white/80 p-8 text-center shadow-lg shadow-rose-100 backdrop-blur-lg">
        <h3 className="text-xl font-semibold text-slate-900">
          Muốn cập nhật xu hướng tóc mới nhất?
        </h3>

        <p className="text-slate-700 mt-3 max-w-xl mx-auto">
          Đội ngũ stylist tại Salon Duong Chi luôn cập nhật các xu hướng làm tóc
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
