import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchPublicServices, queryKeys } from "../services/adminApi";
import LoadingSpinner from "../components/LoadingSpinner";
import { motion } from "framer-motion";
import { Clock, HelpCircle, Sparkles, ArrowLeft, MessageSquare } from "lucide-react";
import Button from "../components/Button";

type CategoryMeta = {
  name: string;
  title: string;
  tagline: string;
  description: string;
  benefits: string[];
};

const categoryMetadata: Record<string, CategoryMeta> = {
  haircut: {
    name: "Cắt & Tạo Kiểu Nữ",
    title: "Cắt & Tạo Kiểu Tóc Nữ",
    tagline: "Thiết kế dáng tóc tôn vinh khuôn mặt của bạn",
    description: "Từng đường cắt tinh tế thiết kế phom dáng tóc layer, bob, lob hoặc tỉa mái bay chuẩn Hàn bởi Master Stylist tại Dương Chi.",
    benefits: [
      "Tư vấn kỹ lưỡng theo tỉ lệ khuôn mặt",
      "Báo giá công khai rõ ràng trước khi cắt",
      "Miễn phí sửa dáng mái bay trong vòng 2 tuần"
    ]
  },
  perm: {
    name: "Uốn Tóc Nữ",
    title: "Uốn Tóc Nữ Cao Cấp",
    tagline: "Những lọn sóng bồng bềnh quyến rũ",
    description: "Công nghệ uốn setting kỹ thuật số hiện đại và uốn lạnh trào lưu tạo lọn xoăn sóng lơi tự nhiên, xoăn xù cá tính hoặc cụp chữ C nhẹ nhàng.",
    benefits: [
      "Giữ nếp uốn căng nảy từ 6 - 9 tháng",
      "Hạn chế khô xơ nhờ tinh chất Plex bảo vệ tủy tóc",
      "Hướng dẫn tự chăm dưỡng, sấy kiểu dễ dàng tại nhà"
    ]
  },
  straightening: {
    name: "Duỗi Tóc Nữ",
    title: "Duỗi Tóc Nữ Mượt Mà",
    tagline: "Mái tóc suôn thẳng mượt mà tự nhiên như lụa",
    description: "Giải pháp duỗi thẳng tự nhiên mềm mại hoặc duỗi cúp volume bồng bềnh ôm dáng, loại bỏ hoàn toàn tình trạng tóc bông xù, thô cứng khó bảo.",
    benefits: [
      "Tóc thẳng rơi tự nhiên, không bị đơ bẹp dính da đầu",
      "Phần chân tóc có độ phồng nhẹ thanh lịch",
      "Ép tinh chất collagen khóa biểu bì siêu bóng mượt"
    ]
  },
  color: {
    name: "Nhuộm Tóc Nữ",
    title: "Nhuộm Màu Thời Trang",
    tagline: "Sắc màu thời thượng nâng tông làn da",
    description: "Đa dạng lựa chọn từ nâu công sở tinh tế nhẹ nhàng đến các tone màu tẩy khói thời trang rực rỡ, highlight cá tính hay balayage loang màu nghệ thuật.",
    benefits: [
      "Độ lên màu chuẩn xác sử dụng màu nhuộm organic lành tính",
      "Kỹ thuật loang màu balayage/ombre Pháp mượt mà",
      "Bổ sung tinh chất dưỡng giữ độ ẩm sâu cho sợi tóc nhuộm"
    ]
  },
  treatment: {
    name: "Phục Hồi Tóc",
    title: "Trị Liệu Phục Hồi Tóc Chuyên Sâu",
    tagline: "Hồi sinh sợi tóc khô xơ và hư tổn nặng",
    description: "Bù đắp keratin thủy phân cho tóc nát mủn và truyền collagen siêu dưỡng chất phục hồi lớp biểu bì xơ ráp do làm hóa chất hoặc nhiệt liên tục.",
    benefits: [
      "Khôi phục liên kết sừng giúp tóc dai chắc khỏe",
      "Giảm gãy rụng đứt thân tóc tới 95%",
      "Tạo độ bóng óng ả căng tràn sức sống"
    ]
  },
  shampoo: {
    name: "Gội Đầu Dưỡng Sinh",
    title: "Gội Đầu Dưỡng Sinh Trị Liệu",
    tagline: "Thư giãn sâu, đả thông kinh lạc & thải độc da đầu",
    description: "Liệu trình kết hợp gội thảo dược, massage bấm huyệt cổ-vai-gáy giải tỏa mệt mỏi và điều trị chuyên sâu gàu bết da đầu.",
    benefits: [
      "Bấm huyệt đả thông kinh lạc giải tỏa căng cơ",
      "Massage tăng tuần hoàn máu não, ngủ sâu giấc hơn",
      "Thải độc bùn khoáng kiểm soát dầu nhờn da đầu bết gàu"
    ]
  },
  combo: {
    name: "Combo Làm Đẹp",
    title: "Combo Làm Đẹp Trọn Gói",
    tagline: "Nuông chiều mái tóc toàn diện với chi phí tối ưu",
    description: "Sự kết hợp hoàn hảo giữa các dịch vụ hóa chất chuyên nghiệp cùng phục hồi sâu cao cấp giúp tiết kiệm ngân sách và thời gian tối đa.",
    benefits: [
      "Tiết kiệm chi phí đáng kể so với hóa đơn lẻ",
      "Đảm bảo an toàn sợi tóc với phục hồi PLEX đi kèm",
      "Lột xác diện mạo hoàn hảo nhanh chóng"
    ]
  }
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

const ServiceCategoryPage = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();

  // 1. Fetch all services
  const { data: services, isLoading, error } = useQuery({
    queryKey: [...queryKeys.publicServices],
    queryFn: fetchPublicServices,
  });

  // 2. Validate categorySlug
  const meta = categorySlug ? categoryMetadata[categorySlug] : null;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20">
        <LoadingSpinner size="lg" label="Đang chuẩn bị bảng dịch vụ..." />
      </div>
    );
  }

  // 404 State
  if (!meta || error) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center space-y-6">
        <div className="rounded-full bg-rose-50 h-20 w-20 flex items-center justify-center mx-auto border border-rose-100 text-rose-500">
          <HelpCircle size={40} />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Danh Mục Không Tồn Tại</h1>
        <p className="text-slate-600">
          Rất tiếc, danh mục dịch vụ bạn yêu cầu hiện không có trong hệ thống của chúng tôi. Vui lòng quay lại hoặc chọn danh mục khác.
        </p>
        <div className="flex justify-center">
          <Button to="/services" variant="primary">
            Quay Lại Danh Sách Dịch Vụ
          </Button>
        </div>
      </div>
    );
  }

  // 3. Filter services by categorySlug
  // (Filter by categorySlug or backend category matching the metadata name)
  const filteredServices = (services || []).filter(
    (s) =>
      s.categorySlug === categorySlug ||
      s.category === meta.name ||
      s.category.toLowerCase().includes(meta.name.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-12">
      {/* Back button and Header */}
      <div className="space-y-4">
        <Link to="/services" className="inline-flex items-center gap-2 text-sm text-rose-500 hover:text-rose-600 transition">
          <ArrowLeft size={16} /> Quay lại tất cả dịch vụ
        </Link>

        <section className="grid gap-6 md:grid-cols-[1.2fr_0.8fr] items-start border-b border-rose-100 pb-10">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.25em] text-rose-500 font-bold">{meta.tagline}</p>
            <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">{meta.title}</h1>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed">
              {meta.description}
            </p>
          </div>
          <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-5 space-y-3">
            <h4 className="text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} /> Đặc Quyền Tại Dương Chi:
            </h4>
            <ul className="space-y-2 text-xs md:text-sm text-slate-700">
              {meta.benefits.map((b, bIdx) => (
                <li key={bIdx} className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✓</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {/* Services Cards Grid */}
      <section className="space-y-8">
        {filteredServices.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-rose-200 bg-rose-50/40 p-10 text-center text-slate-600">
            Hiện tại danh mục này đang được cập nhật thêm dịch vụ mới. Quý khách vui lòng liên hệ tư vấn trực tiếp để nhận thông tin chi tiết.
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            {filteredServices.map((service, idx) => {
              const displayDuration = service.duration || service.durationMinutes || 60;
              return (
                <motion.article
                  key={service._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="flex flex-col justify-between overflow-hidden rounded-3xl border border-rose-100 bg-white shadow-md hover:shadow-lg transition duration-300"
                >
                  <div className="p-6 space-y-4">
                    {/* Header Info */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-start gap-4">
                        <h3 className="text-lg font-bold text-slate-900 md:text-xl">{service.name}</h3>
                        <span className="text-rose-600 font-bold text-base md:text-lg whitespace-nowrap">
                          {formatCurrency(service.price)}
                        </span>
                      </div>
                      <p className="text-xs text-rose-500 font-semibold tracking-wider uppercase">Giá tham khảo</p>
                    </div>

                    <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                      {service.description}
                    </p>

                    {/* Suitable & Benefits list */}
                    {(service.suitableFor?.length || service.benefits?.length) ? (
                      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 pt-2 border-t border-slate-50 text-xs text-slate-600">
                        {service.suitableFor?.length ? (
                          <div className="space-y-1.5">
                            <h5 className="font-bold text-slate-800 uppercase tracking-wider">Phù hợp với:</h5>
                            <ul className="space-y-1">
                              {service.suitableFor.map((sItem, sIdx) => (
                                <li key={sIdx} className="list-disc list-inside">{sItem}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                        {service.benefits?.length ? (
                          <div className="space-y-1.5">
                            <h5 className="font-bold text-slate-800 uppercase tracking-wider">Ưu thế nổi trội:</h5>
                            <ul className="space-y-1">
                              {service.benefits.map((bItem, bIdx) => (
                                <li key={bIdx} className="list-disc list-inside">{bItem}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>

                  {/* Footer Stats & Actions */}
                  <div className="border-t border-rose-50 bg-rose-50/20 px-6 py-4 flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <Clock size={16} className="text-rose-400" />
                      <span>Thời gian dự kiến: <strong>{displayDuration} phút</strong></span>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        to="https://zalo.me/your_number" // Hoặc sđt thực tế để chat tư vấn
                        variant="ghost"
                        className="px-4 py-2 text-xs md:text-sm flex-1 sm:flex-initial justify-center gap-1.5"
                      >
                        <MessageSquare size={16} />
                        Tư Vấn
                      </Button>
                      <Button
                        to={`/booking?service=${service.slug}`}
                        variant="primary"
                        className="px-4 py-2 text-xs md:text-sm flex-1 sm:flex-initial justify-center"
                      >
                        Đặt Lịch Ngay
                      </Button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </section>

      {/* General Note */}
      <section className="rounded-2xl border border-rose-100 bg-rose-50/30 p-5 text-center text-xs text-slate-600 leading-relaxed">
        * Lưu ý: Mức giá nêu trên là **giá tham khảo cơ bản**. Chi phí dịch vụ thực tế có thể thay đổi nhẹ tùy thuộc vào độ dài, độ dày thực tế và tình trạng hư tổn của tóc quý khách. Quý khách sẽ được kiểm tra chất tóc và nhận báo giá chính xác trực tiếp tại quầy từ Stylist trước khi thực hiện dịch vụ.
      </section>
    </div>
  );
};

export default ServiceCategoryPage;
