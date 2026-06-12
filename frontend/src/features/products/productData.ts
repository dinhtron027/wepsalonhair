export type ProductCategoryId =
  | "tao-kieu"
  | "duong-phuc-hoi"
  | "cham-soc-da-dau"
  | "bao-ve-nhiet";

export type ProductCategory = {
  id: ProductCategoryId;
  name: string;
  tagline: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: ProductCategoryId;
  price: number;
  image: string;
  gallery: string[];
  shortDescription: string;
  fullDescription: string;
  benefits: string[];
  usage: string[];
  rating: number;
  badge?: string;
};

export const productCategories: ProductCategory[] = [
  {
    id: "tao-kieu",
    name: "Tạo kiểu",
    tagline: "Sáp, pomade, gôm xịt giữ nếp",
  },
  {
    id: "duong-phuc-hoi",
    name: "Dưỡng & phục hồi",
    tagline: "Serum, dầu dưỡng, mặt nạ lạnh",
  },
  {
    id: "cham-soc-da-dau",
    name: "Chăm sóc da đầu",
    tagline: "Dầu gội chuyên nghiệp, detox",
  },
  {
    id: "bao-ve-nhiet",
    name: "Bảo vệ nhiệt",
    tagline: "Xịt chắn nhiệt cho tóc uốn/nhuộm",
  },
];

export const categoryMap: Record<ProductCategoryId, ProductCategory> = productCategories.reduce(
  (acc, cat) => ({ ...acc, [cat.id]: cat }),
  {} as Record<ProductCategoryId, ProductCategory>
);

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

export const products: Product[] = [
  {
    id: "prod-wax-airy",
    slug: "sap-vuot-toc-airy-hold",
    name: "Sáp vuốt tóc Airy Hold",
    category: "tao-kieu",
    price: 320000,
    image:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522335789203-39e4adc0c1a0?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522335789203-d6ab28eb9a06?auto=format&fit=crop&w=1200&q=80",
    ],
    shortDescription: "Sáp mờ gốc nước, giữ nếp 8 giờ, không bết, dễ gội.",
    fullDescription:
      "Công thức gốc nước pha sáp đất sét, tạo phom tóc khô lì nhưng vẫn mềm mượt. Phù hợp tóc mỏng đến trung bình, giữ nếp cả ngày mà không nặng sợi.",
    benefits: [
      "Độ giữ nếp trung bình-khá, không bóng",
      "Không để lại vệt trắng, gội sạch với nước ấm",
      "Tăng độ phồng nhẹ cho tóc mỏng",
    ],
    usage: [
      "Lấy lượng sáp bằng hạt đậu, xoa ấm trong lòng bàn tay",
      "Vuốt lên tóc khô hoặc ẩm 70%, tập trung ở phần thân và đuôi",
      "Có thể chồng thêm một lớp mỏng để tăng giữ nếp",
    ],
    rating: 4.8,
    badge: "Bán chạy",
  },
  {
    id: "prod-pomade-classic",
    slug: "pomade-bong-nuoc-classic-shine",
    name: "Pomade bóng nước Classic Shine",
    category: "tao-kieu",
    price: 360000,
    image:
      "https://images.unsplash.com/photo-1506617420156-8e4536971650?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1506617420156-8e4536971650?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1200&q=80",
    ],
    shortDescription: "Pomade gốc nước bóng nhẹ, phù hợp slick-back & side-part.",
    fullDescription:
      "Giữ nếp linh hoạt với độ bóng vừa phải, không nhờn dính. Thêm panthenol dưỡng ẩm giúp tóc không khô khi vuốt lại trong ngày.",
    benefits: [
      "Độ bóng nhẹ, không nặng tóc",
      "Giữ nếp 6-8 giờ, dễ chải lại bằng lược",
      "Không để lại build-up, hợp tóc uốn",
    ],
    usage: [
      "Dùng trên tóc ẩm nhẹ để tăng độ bóng",
      "Chải lược răng thưa định hình form",
      "Sấy lạnh 1-2 phút để cố định nếp",
    ],
    rating: 4.7,
  },
  {
    id: "prod-hairspray",
    slug: "gom-xit-khong-con",
    name: "Gôm xịt không cồn Dry Mist",
    category: "tao-kieu",
    price: 280000,
    image:
      "https://images.unsplash.com/photo-1506617420156-8e4536971650?auto=format&fit=crop&w=1200&q=80&sat=-30",
    gallery: [
      "https://images.unsplash.com/photo-1506617420156-8e4536971650?auto=format&fit=crop&w=1200&q=80&sat=-30",
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1200&q=80&sat=-10",
    ],
    shortDescription: "Xịt sương mịn, giữ nếp khô thoáng 8 giờ, không mùi hắc.",
    fullDescription:
      "Gôm gốc nước không chứa cồn khô, phun sương mịn giúp khóa nếp mà không làm tóc cứng. Thêm chiết xuất lô hội giảm khô xơ.",
    benefits: [
      "Giữ nếp khô thoáng, không bết",
      "Không để lại mảng trắng trên tóc tối màu",
      "Chống ẩm nhẹ, phù hợp khí hậu nhiệt đới",
    ],
    usage: [
      "Lắc đều trước khi xịt",
      "Giữ vòi cách tóc 20-25cm, xịt lớp mỏng",
      "Chồng thêm lớp nếu cần cố định mạnh hơn",
    ],
    rating: 4.75,
  },
  {
    id: "prod-argan-oil",
    slug: "dau-duong-argan-muot-nhe",
    name: "Dầu dưỡng Argan mượt nhẹ",
    category: "duong-phuc-hoi",
    price: 520000,
    image:
      "https://images.unsplash.com/photo-1522335789203-d6ab28eb9a06?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1522335789203-d6ab28eb9a06?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522335789203-39e4adc0c1a0?auto=format&fit=crop&w=1200&q=80",
    ],
    shortDescription: "Dầu argan siêu nhẹ, giảm xù rối, tăng bóng tự nhiên.",
    fullDescription:
      "Hấp thụ nhanh, không nặng tóc. Bổ sung vitamin E và omega giúp khóa ẩm và bảo vệ màu nhuộm. Thích hợp dùng hàng ngày sau sấy.",
    benefits: [
      "Giảm xù rối ngay lập tức",
      "Bóng tóc tự nhiên, không bết",
      "Bảo vệ màu nhuộm khỏi oxy hóa",
    ],
    usage: [
      "Nhỏ 2-3 giọt ra lòng bàn tay, xoa đều",
      "Vuốt vào phần thân và đuôi tóc sau sấy",
      "Dùng trước khi ngủ để dưỡng qua đêm",
    ],
    rating: 4.86,
    badge: "Mới",
  },
  {
    id: "prod-keratin-serum",
    slug: "serum-phuc-hoi-keratin",
    name: "Serum phục hồi keratin đậm đặc",
    category: "duong-phuc-hoi",
    price: 640000,
    image:
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522335789203-39e4adc0c1a0?auto=format&fit=crop&w=1200&q=80&sat=-20",
    ],
    shortDescription: "Serum keratin tái tạo liên kết, giảm gãy rụng rõ rệt.",
    fullDescription:
      "Bổ sung keratin thủy phân và peptide giúp lấp đầy những khoảng trống trên thân tóc, phục hồi độ đàn hồi cho tóc uốn/nhuộm.",
    benefits: [
      "Giảm gãy rụng sau 2 tuần",
      "Tăng đàn hồi, tóc chắc khỏe",
      "Phù hợp tóc tẩy, tóc hư tổn nặng",
    ],
    usage: [
      "Dùng trên tóc ẩm sau gội",
      "Chia tóc thành lọn nhỏ, xịt 2-3 lần/lọn",
      "Sấy mát để khóa dưỡng chất",
    ],
    rating: 4.9,
    badge: "Phục hồi",
  },
  {
    id: "prod-scalp-shampoo",
    slug: "dau-goi-can-bang-da-dau-bha",
    name: "Dầu gội cân bằng da đầu BHA",
    category: "cham-soc-da-dau",
    price: 450000,
    image:
      "https://images.unsplash.com/photo-1506617420156-8e4536971650?auto=format&fit=crop&w=1200&q=80&sat=-15",
    gallery: [
      "https://images.unsplash.com/photo-1522335789203-39e4adc0c1a0?auto=format&fit=crop&w=1200&q=80&sat=-20",
      "https://images.unsplash.com/photo-1464692805480-a69dfaafdb0d?auto=format&fit=crop&w=1200&q=80",
    ],
    shortDescription: "Làm sạch dịu nhẹ, giảm gàu & ngứa nhờ BHA và bạc hà.",
    fullDescription:
      "Công thức không sulfate, chứa BHA 0.5% giúp làm sạch tế bào chết, cân bằng bã nhờn và giữ da đầu mát mẻ suốt ngày.",
    benefits: [
      "Giảm gàu và ngứa sau 1 tuần",
      "Da đầu thông thoáng nhưng không khô",
      "Giữ màu nhuộm bền hơn",
    ],
    usage: [
      "Làm ướt tóc, lấy lượng vừa đủ massage 2 phút",
      "Xả sạch với nước mát",
      "Kết hợp detox 2 tuần/lần để tối ưu hiệu quả",
    ],
    rating: 4.78,
  },
  {
    id: "prod-heat-shield",
    slug: "xit-chong-nhiet-230",
    name: "Xịt chống nhiệt 230°C",
    category: "bao-ve-nhiet",
    price: 410000,
    image:
      "https://images.unsplash.com/photo-1582719478248-70fc41d25f82?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1582719478248-70fc41d25f82?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522335789203-39e4adc0c1a0?auto=format&fit=crop&w=1200&q=80&sat=-10",
    ],
    shortDescription: "Tạo lớp màng bảo vệ nhiệt đến 230°C, giảm cháy xém sợi tóc.",
    fullDescription:
      "Chứa protein lúa mì và panthenol giúp phủ lên thân tóc, giảm thất thoát ẩm khi sấy/ép/ uốn. Không làm nặng hay dính tóc.",
    benefits: [
      "Giảm hư tổn nhiệt đến 85%",
      "Tóc mềm mượt sau khi kẹp/ép",
      "Không chứa silicone nặng",
    ],
    usage: [
      "Xịt lên tóc ẩm trước khi sấy hoặc tóc khô trước khi kẹp",
      "Chải đều để phân tán sản phẩm",
      "Có thể xịt lại sau 4-6 tiếng nếu tạo kiểu lại",
    ],
    rating: 4.84,
  },
  {
    id: "prod-color-glow",
    slug: "tinh-dau-duong-bong-mau",
    name: "Tinh dầu dưỡng bóng tóc màu",
    category: "duong-phuc-hoi",
    price: 590000,
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1506617420156-8e4536971650?auto=format&fit=crop&w=1200&q=80",
    ],
    shortDescription: "Dưỡng bóng cho tóc nhuộm, khóa màu, hạn chế xỉn vàng.",
    fullDescription:
      "Chiết xuất hạt nho và dầu hướng dương chứa chất chống oxy hóa, bảo vệ màu nhuộm khỏi tia UV và nhiệt. Không lem màu ra áo gối.",
    benefits: [
      "Khóa màu nhuộm, giảm phai 30%",
      "Tóc bóng mịn nhưng không nhờn",
      "Mùi hương nhẹ, thư giãn",
    ],
    usage: [
      "Dùng sau khi sấy khô 80%",
      "Vuốt tập trung ở đuôi tóc",
      "Có thể trộn với serum keratin để tăng dưỡng",
    ],
    rating: 4.81,
  },
  {
    id: "prod-bond-mask",
    slug: "mat-na-phuc-hoi-bond-lanh",
    name: "Mặt nạ phục hồi lạnh Bond",
    category: "duong-phuc-hoi",
    price: 670000,
    image:
      "https://images.unsplash.com/photo-1582719478244-4c0c30bff7e2?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1582719478244-4c0c30bff7e2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=80",
    ],
    shortDescription: "Mask lạnh khóa ẩm, phục hồi liên kết cho tóc tẩy/nhuộm.",
    fullDescription:
      "Chứa bond-builder, chiết xuất rong biển và ceramide giúp làm dịu biểu bì, tăng đàn hồi, giảm rụng và xù rối rõ rệt.",
    benefits: [
      "Giảm gãy rụng, tăng đàn hồi",
      "Tóc mềm mượt ngay sau 1 lần ủ",
      "Phù hợp tóc tẩy, tóc uốn/nhuộm",
    ],
    usage: [
      "Dùng sau dầu gội, lau bớt nước",
      "Lấy 1-2 thìa, thoa đều từ giữa đến đuôi tóc",
      "Ủ 10-15 phút, xả mát để khóa ẩm",
    ],
    rating: 4.93,
    badge: "Phục hồi sâu",
  },
];
