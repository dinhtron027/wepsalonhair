export type ServiceCategoryId =
  | "cat-cat-goi"
  | "cat-uon-duoi"
  | "cat-ep-toc"
  | "cat-nhuom"
  | "cat-phuc-hoi"
  | "cat-tu-van";

export type ServiceCategory = {
  id: ServiceCategoryId;
  name: string;
  tagline: string;
};

export type Service = {
  id: string;
  slug: string;
  name: string;
  category: ServiceCategoryId;
  priceFrom: number;
  shortDescription: string;
  description: string;
  image: string;
  gallery?: string[];
  benefits: string[];
  priceList?: { title: string; price: number }[];
  beforeAfter?: { before: string; after: string }[];
};

export const serviceCategories: ServiceCategory[] = [
  { id: "cat-cat-goi", name: "Cắt tóc - gội đầu", tagline: "Form tóc chuẩn salon, gội dưỡng sinh" },
  { id: "cat-uon-duoi", name: "Uốn - duỗi", tagline: "Sóng mềm, duỗi êm, bảo vệ cấu trúc tóc" },
  { id: "cat-ep-toc", name: "Ép tóc", tagline: "Ép phồng, ép thẳng phủ bóng tự nhiên" },
  { id: "cat-nhuom", name: "Nhuộm tóc", tagline: "Balayage, phủ bóng, màu thời trang" },
  { id: "cat-phuc-hoi", name: "Phục hồi tóc", tagline: "Keratin, bond builder, detox da đầu" },
  { id: "cat-tu-van", name: "Tư vấn tạo kiểu", tagline: "Cá nhân hóa kiểu tóc & màu sắc" },
];

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

export const categoryMap: Record<ServiceCategoryId, ServiceCategory> = serviceCategories.reduce(
  (acc, cat) => ({ ...acc, [cat.id]: cat }),
  {} as Record<ServiceCategoryId, ServiceCategory>
);

export const services: Service[] = [
  {
    id: "svc-cat-01",
    slug: "cat-toc-thiet-ke-goi-duong-sinh",
    name: "Cắt tóc thiết kế + gội dưỡng sinh",
    category: "cat-cat-goi",
    priceFrom: 420000,
    shortDescription: "Phân tích khuôn mặt, cắt layer ôm má kết hợp gội dưỡng sinh 7 bước.",
    description:
      "Stylist phân tích cấu trúc tóc và khuôn mặt, cắt layer mảnh để tăng độ bồng tự nhiên. Quy trình gội dưỡng sinh thảo mộc kết hợp massage cổ - vai giúp thư giãn sâu.",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1400&q=80",
    benefits: [
      "Form tóc ôm gọn, dễ tự sấy ở nhà",
      "Giảm xù rối, tăng chuyển động tự nhiên",
      "Thư giãn, giảm mỏi cổ - vai",
    ],
    priceList: [
      { title: "Cắt + gội dưỡng sinh", price: 420000 },
      { title: "Cắt tạo kiểu editorial", price: 620000 },
    ],
    beforeAfter: [
      {
        before:
          "https://images.unsplash.com/photo-1507914372368-b2b085b925a1?auto=format&fit=crop&w=1200&q=80",
        after:
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
      },
    ],
  },
  {
    id: "svc-cat-02",
    slug: "goi-dau-duong-sinh-thao-moc",
    name: "Gội đầu dưỡng sinh thảo mộc",
    category: "cat-cat-goi",
    priceFrom: 220000,
    shortDescription: "Massage bấm huyệt, túi thảo dược ấm, ngủ sâu tức thì.",
    description:
      "Quy trình 7 bước với tinh dầu thảo mộc ấm, bấm huyệt thái dương, cổ và vai, giúp giải tỏa căng thẳng, sạch da đầu nhưng không khô.",
    image:
      "https://images.unsplash.com/photo-1505820013142-f86a3439c5b2?auto=format&fit=crop&w=1400&q=80",
    benefits: [
      "Làm sạch dịu nhẹ, mùi thơm thư giãn",
      "Tăng lưu thông máu nuôi chân tóc",
      "Giảm đau đầu, hỗ trợ ngủ ngon",
    ],
    priceList: [
      { title: "Gội dưỡng sinh 20 phút", price: 220000 },
      { title: "Gội dưỡng sinh đá nóng", price: 260000 },
    ],
  },
  {
    id: "svc-uon-01",
    slug: "uon-s-wave-tu-nhien",
    name: "Uốn S-Wave tự nhiên",
    category: "cat-uon-duoi",
    priceFrom: 1900000,
    shortDescription: "Sóng S mềm, chân tóc phồng, giữ nếp 4-6 tháng.",
    description:
      "Thuốc uốn nhiệt thấp kết hợp dưỡng bond builder giúp sợi tóc đàn hồi, sóng rơi tự nhiên nhưng không khô xơ. Phù hợp tóc mỏng cần phồng nhẹ.",
    image:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80",
    benefits: [
      "Chân tóc phồng, mặt gọn hơn",
      "Giữ nếp lâu, ít phải cuốn lô mỗi sáng",
      "Tóc bóng và không xù rối",
    ],
    priceList: [
      { title: "Uốn S-Wave dài", price: 2200000 },
      { title: "Uốn S-Wave tóc ngắn", price: 1900000 },
    ],
    beforeAfter: [
      {
        before:
          "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
        after:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80",
      },
    ],
  },
  {
    id: "svc-duoi-01",
    slug: "duoi-keratin-chong-xu",
    name: "Duỗi keratin chống xù",
    category: "cat-uon-duoi",
    priceFrom: 2100000,
    shortDescription: "Duỗi thẳng nhưng vẫn dày mượt, giảm xù tới 90%.",
    description:
      "Thuốc duỗi gốc keratin pH thấp, giảm nhiệt nhưng vẫn làm mượt biểu bì. Kết thúc bằng hấp lạnh để khóa dưỡng chất, phù hợp tóc hư tổn nhẹ.",
    image:
      "https://images.unsplash.com/photo-1507914372368-b2b085b925a1?auto=format&fit=crop&w=1400&q=80",
    benefits: [
      "Tóc thẳng mềm, không đơ",
      "Giảm xù rối ở khí hậu ẩm",
      "Giữ phom 3-4 tháng",
    ],
    priceList: [
      { title: "Duỗi keratin tóc dài", price: 2300000 },
      { title: "Duỗi keratin tóc ngắn", price: 2100000 },
    ],
  },
  {
    id: "svc-ep-01",
    slug: "ep-phong-chan-toc-airy",
    name: "Ép phồng chân tóc Airy",
    category: "cat-ep-toc",
    priceFrom: 1500000,
    shortDescription: "Ép thẳng thân tóc, giữ chân tóc phồng tự nhiên.",
    description:
      "Kỹ thuật kẹp cách chân 1-1.5cm để bảo toàn độ phồng. Phù hợp tóc tơ, tóc dễ xẹp sát da đầu, muốn giữ nếp cả ngày.",
    image:
      "https://images.unsplash.com/photo-1505820013142-f86a3439c5b2?auto=format&fit=crop&w=1400&q=80",
    benefits: [
      "Chân tóc phồng êm, không bị bết",
      "Thân tóc thẳng, bóng nhẹ",
      "Giảm thời gian sấy tạo phồng mỗi sáng",
    ],
    priceList: [
      { title: "Ép phồng chân tóc", price: 1500000 },
      { title: "Ép phủ bóng tự nhiên", price: 1950000 },
    ],
  },
  {
    id: "svc-nhuom-01",
    slug: "nhuom-balayage-anh-khoi",
    name: "Nhuộm balayage ánh khói",
    category: "cat-nhuom",
    priceFrom: 2700000,
    shortDescription: "Balayage loang màu, hiệu ứng khói trong trẻo, ít phải dặm chân.",
    description:
      "Kỹ thuật balayage kết hợp air-touch cho chuyển màu mượt, tạo chiều sâu nhưng không lộ line. Dưỡng bond trong lúc tẩy để bảo vệ sợi tóc.",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1400&q=80",
    benefits: [
      "Màu loang tinh tế, lên ảnh đẹp",
      "Ít phải dặm chân tóc",
      "Giữ tóc mềm nhờ bond-builder",
    ],
    priceList: [
      { title: "Balayage dài", price: 3000000 },
      { title: "Balayage lob/short", price: 2700000 },
    ],
    beforeAfter: [
      {
        before:
          "https://images.unsplash.com/photo-1507914372368-b2b085b925a1?auto=format&fit=crop&w=1200&q=80",
        after:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80",
      },
    ],
  },
  {
    id: "svc-ph-01",
    slug: "phuc-hoi-keratin-3-buoc",
    name: "Phục hồi keratin 3 bước",
    category: "cat-phuc-hoi",
    priceFrom: 1200000,
    shortDescription: "Combo gội - serum keratin - hấp lạnh, tăng đàn hồi sợi tóc.",
    description:
      "Quy trình ba bước với dầu gội phục hồi, serum keratin đậm đặc và hấp lạnh khóa ẩm. Phục hồi biểu bì mở, giảm gãy rụng và khô xơ.",
    image:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80",
    benefits: [
      "Giảm gãy rụng rõ rệt",
      "Tóc bóng và mềm hơn sau 1 lần",
      "Chuẩn bị tóc trước uốn/nhuộm",
    ],
    priceList: [
      { title: "Liệu trình tiêu chuẩn", price: 1200000 },
      { title: "Keratin + bond chuyên sâu", price: 1500000 },
    ],
  },
  {
    id: "svc-tv-01",
    slug: "tu-van-tao-kieu-ca-nhan",
    name: "Tư vấn tạo kiểu cá nhân hóa",
    category: "cat-tu-van",
    priceFrom: 180000,
    shortDescription: "Phân tích gương mặt, phong cách, đề xuất phom tóc & màu sắc.",
    description:
      "Stylist phân tích tỷ lệ gương mặt, chất tóc, lịch sinh hoạt để đề xuất phom tóc, mái, màu nhuộm và lộ trình chăm sóc phù hợp.",
    image:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1400&q=80",
    benefits: [
      "Chọn được kiểu tóc tôn gương mặt",
      "Lộ trình rõ ràng, tránh làm hỏng tóc",
      "Phù hợp ngân sách và thời gian chăm sóc",
    ],
    priceList: [
      { title: "Tư vấn trực tiếp", price: 180000 },
      { title: "Tư vấn online + lookbook", price: 220000 },
    ],
  },
];
