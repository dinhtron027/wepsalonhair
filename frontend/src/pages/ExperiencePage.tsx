import { motion } from "framer-motion";
import { Coffee, ShieldCheck, HeartHandshake, Smile, ClipboardList, Sparkles } from "lucide-react";
import Button from "../components/Button";
import useSEO from "../hooks/useSEO";


const steps = [
  {
    icon: Coffee,
    title: "1. Chào Đón & Thưởng Trà",
    description: "Ngay khi bước vào Dương Chi, quý khách sẽ được tiếp đón nồng hậu, thưởng thức ly trà ấm thảo mộc thanh lọc và cảm nhận không gian spa thư giãn tuyệt đối.",
    time: "5 phút"
  },
  {
    icon: ClipboardList,
    title: "2. Khám Phá & Phân Tích Tóc",
    description: "Stylist chuyên nghiệp sẽ trực tiếp đo đạc, kiểm tra độ đàn hồi, độ hư tổn của tóc và lắng nghe mong muốn của bạn để tư vấn kiểu dáng tóc tối ưu nhất.",
    time: "15 phút"
  },
  {
    icon: ShieldCheck,
    title: "3. Báo Giá Minh Bạch",
    description: "Dương Chi cam kết công khai mức giá chi tiết dựa trên tình trạng tóc trước khi bắt đầu thực hiện. Tuyệt đối không phát sinh chi phí hay chèo kéo ép dịch vụ.",
    time: "5 phút"
  },
  {
    icon: Sparkles,
    title: "4. Thực Hiện Tỉ Mỉ",
    description: "Tận hưởng kỹ thuật xử lý hóa chất hiện đại và những đường kéo nghệ thuật. Từng thao tác đều được chăm chút kỹ lưỡng để mang lại sự hoàn hảo nhất.",
    time: "60 - 180 phút"
  },
  {
    icon: HeartHandshake,
    title: "5. Chia Sẻ Bí Quyết Chăm Sóc",
    description: "Nhận hướng dẫn chi tiết cách sấy tạo kiểu, gội xả và chăm dưỡng tóc tại nhà từ Stylist giúp mái tóc giữ nếp uốn/duỗi/nhuộm bóng đẹp như tại tiệm.",
    time: "10 phút"
  },
  {
    icon: Smile,
    title: "6. Đồng Hành & Bảo Hành",
    description: "An tâm tuyệt đối với chính sách bảo hành nếp tóc uốn/duỗi/màu nhuộm trong vòng 7 ngày và đặc quyền miễn phí tỉa mái bay/mái thưa trong vòng 2 tuần.",
    time: "Trọn đời"
  }
];

const ExperiencePage = () => {
  useSEO({
    title: "Trải Nghiệm Dịch Vụ 5 Sao — Salon Dương Chi",
    description:
      "Khám phá hành trình trải nghiệm khách hàng tại Salon Dương Chi: từ chào đón, tư vấn chuyên sâu, thực hiện dịch vụ đến chăm sóc sau cùng.",
    canonical: "/services/experience",
    ogUrl: "/services/experience",
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
          Hành Trình Cảm Xúc
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl font-bold text-slate-900 md:text-5xl"
        >
          Trải Nghiệm Khách Hàng Tại Dương Chi
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mx-auto max-w-2xl text-slate-600"
        >
          Tại Salon Dương Chi, chúng tôi tin rằng làm tóc không chỉ là thay đổi ngoại hình, mà là một hành trình nuông chiều bản thân, đánh thức sự tự tin và vẻ đẹp độc bản của bạn.
        </motion.p>
      </section>

      {/* Timeline Section */}
      <section className="relative">
        {/* Vertical Line on Desktop */}
        <div className="absolute left-1/2 top-0 hidden h-full w-0.5 -translate-x-1/2 bg-rose-100 md:block" />

        <div className="space-y-12">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isEven = idx % 2 === 0;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`flex flex-col-reverse md:flex-row items-center justify-between gap-6 md:gap-12 ${
                  isEven ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Text Content Block */}
                <div className="w-full md:w-[45%] space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600 border border-rose-100">
                      {step.time}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{step.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                    {step.description}
                  </p>
                </div>

                {/* Timeline Node Badge */}
                <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-200">
                  <Icon size={22} />
                </div>

                {/* Empty block to balance the flex items on desktop */}
                <div className="hidden md:block w-[45%]" />
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Philosophy Section */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50/50 to-pink-50/50 p-8 md:p-12 text-center space-y-6"
      >
        <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">Cam Kết Vàng Từ Dương Chi</h2>
        <p className="mx-auto max-w-2xl text-slate-700 text-sm md:text-base leading-relaxed">
          Chúng tôi coi mái tóc quý khách như một tác phẩm nghệ thuật. Mỗi dịch vụ được thực hiện với các cam kết: Vệ sinh sạch sẽ chuẩn y khoa, tận tâm lắng nghe, trung thực báo giá và chỉ sử dụng sản phẩm organic nhập khẩu chính ngạch cao cấp nhất.
        </p>
        <div className="flex justify-center gap-4">
          <Button to="/booking" variant="primary">
            Đặt Lịch Trải Nghiệm Ngay
          </Button>
        </div>
      </motion.section>
    </div>
  );
};

export default ExperiencePage;
