import SectionTitle from "../components/SectionTitle";
import AnimatedContainer from "../components/AnimatedContainer";

const About = () => {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-8 space-y-16">

      {/* Intro */}
      <SectionTitle
        eyebrow="Câu Chuyện Thương Hiệu"
        title="Salon Dương Chi"
        description="Hơn cả một điểm đến làm đẹp, Salon Dương Chi là trạm dừng chân tĩnh lặng để bạn được nâng niu và chữa lành. Nơi nghệ thuật tạo mẫu tóc song hành cùng sự tinh tế của người Á Đông."
        align="left"
      />

      <AnimatedContainer className="rounded-2xl border border-neutral-200/60 bg-white p-8 shadow-sm">
        <p className="text-slate-500 text-sm leading-relaxed font-light">
          Tối giản, thanh lịch nhưng vô cùng ấm áp với ánh sáng dịu nhẹ và hương tinh dầu mộc mạc. Mọi góc nhỏ tại Dương Chi đều được sắp đặt tỉ mỉ để mang đến cho bạn sự khoan khoái như một buổi spa thiền tịnh.
        </p>

        <p className="text-slate-500 text-sm leading-relaxed mt-4 font-light">
          Tại đây, chúng tôi trao gửi sự tận tâm vào từng lọn tóc, không ồn ào vội vã, chỉ có tiếng kéo thanh mảnh và dòng nước gội rửa mọi muộn phiền của bạn.
        </p>
      </AnimatedContainer>


      {/* Founder */}
      <div className="space-y-6">
        <SectionTitle
          eyebrow="Người Kiến Tạo"
          title="Chủ Nhân Của Cảm Hứng"
          description="Người thổi hồn vào từng trải nghiệm tại Dương Chi."
          align="left"
        />

        <AnimatedContainer className="rounded-2xl border border-neutral-200/60 bg-white p-8 shadow-sm">
          <h3 className="text-lg font-display text-charcoal mb-3">
            Dương Chi — Nghệ nhân của suối tóc
          </h3>

          <p className="text-slate-500 text-sm leading-relaxed font-light">
            Mang trong mình tình yêu với cái đẹp thanh tao, Dương Chi luôn theo đuổi triết lý: "Mái tóc là trang sức quý giá nhất của người phụ nữ". Không chạy theo những xu hướng công nghiệp, Chi chọn lối đi riêng với nghệ thuật thiết kế tóc cá nhân hóa.
          </p>

          <p className="text-slate-500 text-sm leading-relaxed mt-4 font-light">
            Từ những đường cắt lơi tự nhiên thấm đẫm tinh thần Nhật Bản, đến kỹ thuật lên màu tinh tế, mọi tác phẩm đều toát lên khí chất mộc mạc nhưng đầy chiều sâu.
          </p>
        </AnimatedContainer>
      </div>


      {/* Team */}
      <div className="space-y-6">
        <SectionTitle
          eyebrow="Đội ngũ"
          title="Stylist chính tại Salon"
          description="Những người thợ tóc tận tâm mang đến những kiểu tóc đẹp và hiện đại."
          align="left"
        />

        <div className="grid md:grid-cols-3 gap-6">

          <AnimatedContainer className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm">
            <h4 className="font-semibold text-charcoal text-sm">Anh Kiệt</h4>
            <p className="text-[10px] uppercase tracking-wider text-taupe font-medium mt-1 mb-2">Senior Stylist</p>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              Chuyên về cắt tóc layer, tạo kiểu tóc nữ hiện đại và thiết kế kiểu tóc
              phù hợp với gương mặt.
            </p>
          </AnimatedContainer>

          <AnimatedContainer className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm">
            <h4 className="font-semibold text-charcoal text-sm">Anh Tâm</h4>
            <p className="text-[10px] uppercase tracking-wider text-taupe font-medium mt-1 mb-2">Color Specialist</p>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              Chuyên gia nhuộm màu thời trang, balayage và các kỹ thuật nhuộm
              tạo hiệu ứng tự nhiên.
            </p>
          </AnimatedContainer>

          <AnimatedContainer className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm">
            <h4 className="font-semibold text-charcoal text-sm">Anh Hậu</h4>
            <p className="text-[10px] uppercase tracking-wider text-taupe font-medium mt-1 mb-2">Hair Designer</p>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              Chuyên tạo kiểu tóc uốn, duỗi và phục hồi tóc hư tổn bằng các
              phương pháp chăm sóc hiện đại.
            </p>
          </AnimatedContainer>

        </div>
      </div>


      {/* Philosophy */}
      <div className="space-y-6">
        <SectionTitle
          eyebrow="Triết Lý"
          title="Triết lý làm đẹp đích thực"
          description="Một mái tóc đẹp không đến từ sự rập khuôn, mà khởi nguồn từ sự thấu hiểu."
          align="left"
        />

        <AnimatedContainer className="rounded-2xl border border-neutral-200/60 bg-white p-8 shadow-sm">
          <ul className="space-y-3.5 text-slate-500 text-sm font-light leading-relaxed">
            <li>Lắng nghe chất tóc, ngắm nhìn khuôn mặt và cảm nhận lối sống của bạn</li>
            <li>Tìm ra "chữ ký" nhan sắc hoàn hảo nhất cho riêng mỗi người</li>
            <li>Nâng niu sức khỏe cốt lõi của nang tóc trước khi tạo kiểu</li>
            <li>Trải nghiệm tĩnh lặng, chữa lành và thư thái tuyệt đối</li>
          </ul>
        </AnimatedContainer>
      </div>


      {/* Why choose us */}
      <div className="space-y-6">
        <SectionTitle
          eyebrow="Lời Kết"
          title="Nơi Thanh Xuân Ở Lại Trên Suối Tóc"
          align="left"
        />

        <AnimatedContainer className="rounded-2xl border border-neutral-200/60 bg-white p-8 shadow-sm">
          <p className="text-slate-650 leading-relaxed text-base italic text-center font-light">
            "Hãy để chúng tôi đánh thức phiên bản rạng rỡ nhất của chính bạn, một cách nhẹ nhàng và sâu lắng nhất."
          </p>
        </AnimatedContainer>
      </div>

    </div>
  );
};

export default About;
