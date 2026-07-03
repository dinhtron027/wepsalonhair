import { motion } from "framer-motion";
import { Sparkles, ShieldAlert, Heart, CalendarRange, Droplets } from "lucide-react";
import Button from "../components/Button";
import useSEO from "../hooks/useSEO";


const careSections = [
  {
    icon: Droplets,
    title: "Liệu Trình Cho Tóc Khô Xơ",
    tagline: "Cấp ẩm tức thì & Hồi sinh biểu bì",
    description: "Giải pháp bù nước cấp tốc cho những mái tóc khô ráp, thiếu nước do tác động của ánh nắng, khói bụi và sấy nhiệt sai cách. Tinh chất cấp ẩm sâu giúp làm mềm biểu bì tức thì.",
    benefits: ["Sợi tóc mềm mượt, dễ luồn tay chải", "Giảm vểnh đuôi tóc tới 85%", "Tăng cường độ đàn hồi, ngăn chẻ ngọn"],
    suitable: "Mái tóc thô cứng, xơ xác dưới nắng hoặc mất nước.",
    color: "from-blue-50 to-indigo-50/30",
    border: "border-blue-100",
    iconColor: "text-blue-500",
    serviceSlug: "hap-dau-duong-chat-sieu-muot"
  },
  {
    icon: ShieldAlert,
    title: "Phục Hồi Tóc Hư Tổn Nặng",
    tagline: "Tái cấu trúc Keratin tủy tóc bị nát",
    description: "Phương pháp nạp Keratin thủy phân và protein giúp gắn kết các liên kết disulfua bị đứt gãy do tẩy nhuộm liên tục. Thích hợp để khôi phục cấu trúc đàn hồi cho tóc nát mủn.",
    benefits: ["Lấy lại độ dẻo dai khỏe mạnh cho sợi tóc", "Ngăn chặn tình trạng rụng đứt gãy giữa thân", "Tạo màng sinh học bảo vệ lõi tóc"],
    suitable: "Tóc tẩy nhiều lần, tóc mủn nát co giãn mạnh khi ướt.",
    color: "from-rose-50 to-pink-50/30",
    border: "border-rose-100",
    iconColor: "text-rose-500",
    serviceSlug: "tai-cau-truc-keratin-thuy-phan"
  },
  {
    icon: Heart,
    title: "Chăm Sóc & Thải Độc Da Đầu",
    tagline: "Điều tiết dầu nhờn & Sạch gàu chân tóc",
    description: "Liệu trình chăm sóc chuyên sâu bằng bùn khoáng organic và tinh dầu tràm trà. Làm sạch tế bào sừng chết, điều trị gàu ngứa và thông thoáng các nang tóc bít tắc.",
    benefits: ["Kiểm soát dầu nhờn, giảm bết tóc trong 48 giờ", "Loại bỏ mảng gàu ngứa, làm dịu da đầu", "Kích thích nang tóc phát triển giúp tóc con mọc nhanh"],
    suitable: "Người có da đầu nhiều dầu bết, gàu ngứa hoặc rụng tóc.",
    color: "from-emerald-50 to-teal-50/30",
    border: "border-emerald-100",
    iconColor: "text-emerald-500",
    serviceSlug: "tri-lieu-thai-doc-da-dau-gau-dau"
  },
  {
    icon: Sparkles,
    title: "Phục Hồi Khóa Màu Sau Hóa Chất",
    tagline: "Giữ nếp uốn duỗi & Khóa bền màu nhuộm",
    description: "Liệu trình đặc biệt dành riêng cho tóc vừa thực hiện uốn/duỗi/nhuộm. Axit hóa nhẹ nhàng giúp khép chặt biểu bì tóc, khóa chặt màu sắc và bảo vệ sóng uốn bồng bềnh lâu dài.",
    benefits: ["Màu nhuộm rực rỡ và lâu trôi hơn 2 lần", "Khóa chặt nếp uốn/duỗi ổn định", "Mùi hương thảo dược khử nồng hóa chất còn sót"],
    suitable: "Mái tóc mới làm uốn, duỗi, nhuộm cần bảo vệ định hình.",
    color: "from-amber-50 to-orange-50/30",
    border: "border-amber-100",
    iconColor: "text-amber-500",
    serviceSlug: "u-collagen-phuc-hoi-sieu-bong"
  },
  {
    icon: CalendarRange,
    title: "Dưỡng Tóc Định Kỳ Chuyên Sâu",
    tagline: "Duy trì sự óng ả bồng bềnh hàng tuần",
    description: "Combo chăm sóc tóc định kỳ bao gồm gội xông thảo dược, đắp mặt nạ tóc collagen và massage đả thông kinh lạc giúp nuôi dưỡng sức khỏe lâu dài của mái tóc.",
    benefits: ["Duy trì độ bóng khỏe thường xuyên", "Massage bấm huyệt giảm mệt mỏi stress", "Bảo vệ tóc trước các yếu tố môi trường"],
    suitable: "Khách hàng bận rộn muốn chăm sóc bản thân định kỳ.",
    color: "from-purple-50 to-fuchsia-50/30",
    border: "border-purple-100",
    iconColor: "text-purple-500",
    serviceSlug: "goi-dau-duong-sinh-dong-y"
  }
];

const CarePage = () => {
  useSEO({
    title: "Chăm Dưỡng Tóc Chuyên Sâu — Salon Dương Chi",
    description:
      "Bí quyết chăm sóc tóc hư tổn và các liệu trình dưỡng tóc chuyên sâu tại Salon Dương Chi. Phục hồi tóc khô xơ, hư tổn, dưỡng màu và liệu trình định kỳ.",
    canonical: "/services/care",
    ogUrl: "/services/care",
  });
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 space-y-16">

      {/* Header Section */}
      <section className="text-center space-y-4">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs uppercase tracking-[0.3em] text-rose-500 font-bold"
        >
          Trị Liệu Chuyên Sâu
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl font-bold text-slate-900 md:text-5xl"
        >
          Liệu Trình Chăm Dưỡng Tóc & Da Đầu
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mx-auto max-w-2xl text-slate-600"
        >
          Sở hữu mái tóc đẹp bắt đầu từ nền tảng tóc khỏe. Các liệu trình chăm dưỡng chuyên sâu tại Dương Chi được thiết kế để điều trị tận gốc từng vấn đề của sợi tóc và da đầu.
        </motion.p>
      </section>

      {/* Grid of Sections */}
      <section className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-1">
        {careSections.map((sec, idx) => {
          const Icon = sec.icon;

          return (
            <motion.article
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className={`rounded-3xl border ${sec.border} bg-gradient-to-br ${sec.color} p-6 md:p-8 flex flex-col lg:flex-row gap-6 items-start justify-between shadow-sm hover:shadow-md transition duration-300`}
            >
              {/* Left Column: Icon & General Info */}
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-md ${sec.iconColor}`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 md:text-2xl">{sec.title}</h2>
                    <p className="text-sm font-semibold text-rose-500">{sec.tagline}</p>
                  </div>
                </div>
                <p className="text-slate-700 leading-relaxed text-sm md:text-base">
                  {sec.description}
                </p>
                <div className="rounded-2xl bg-white/70 p-3 text-xs md:text-sm text-slate-600">
                  <span className="font-bold text-slate-800">Đối tượng phù hợp: </span>
                  {sec.suitable}
                </div>
              </div>

              {/* Right Column: Benefits list & CTA */}
              <div className="lg:w-[35%] w-full flex flex-col justify-between h-full gap-6">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Hiệu quả liệu trình:</h4>
                  <ul className="space-y-2 text-xs md:text-sm text-slate-600">
                    {sec.benefits.map((benefit, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2">
                        <span className="text-rose-500 font-bold">✓</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-2">
                  <Button to={`/booking?service=${sec.serviceSlug}`} variant="primary" className="w-full justify-center">
                    Đặt Lịch Trị Liệu Ngay
                  </Button>
                </div>
              </div>
            </motion.article>
          );
        })}
      </section>
    </div>
  );
};

export default CarePage;
