const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const env = require('../config/env');
const Product = require('../models/Product');
const Service = require('../models/Service');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Customer = require('../models/Customer');
const CustomerNote = require('../models/CustomerNote');
const HairFormula = require('../models/HairFormula');
const Order = require('../models/Order');
const customerService = require('../services/customerService');

const serviceSeeds = [
  // A. Cat & Tao Kieu Nu
  {
    name: 'Cắt Layer Nữ Premium',
    slug: 'cat-layer-nu-premium',
    category: 'Cắt & Tạo Kiểu Nữ',
    categorySlug: 'haircut',
    price: 250000,
    description: 'Cắt tỉa Layer tạo tầng phồng tự nhiên, ôm form nhẹ nhàng che khuyết điểm khuôn mặt.',
    image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80',
    duration: 45,
    suitableFor: ['Khuôn mặt tròn', 'Khuôn mặt góc cạnh', 'Tóc mỏng cần độ phồng'],
    benefits: ['Tạo độ phồng tự nhiên', 'Dễ dàng sấy tạo kiểu tại nhà', 'Che khuyết điểm gò má'],
    isFeatured: true
  },
  {
    name: 'Cắt Tóc Bob/Lob Thời Thượng',
    slug: 'cat-bob-lob-thoi-thuong',
    category: 'Cắt & Tạo Kiểu Nữ',
    categorySlug: 'haircut',
    price: 250000,
    description: 'Cắt tóc ngắn cá tính (Bob) hoặc lửng ngang vai (Lob) sành điệu, trẻ trung.',
    image: 'https://images.unsplash.com/photo-1595853035070-59a39fe84de3?auto=format&fit=crop&w=800&q=80',
    duration: 45,
    suitableFor: ['Khuôn mặt dài', 'Khuôn mặt trái xoan', 'Phụ nữ năng động'],
    benefits: ['Trẻ trung hách tuổi', 'Mát mẻ năng động', 'Dễ chăm dưỡng'],
    isFeatured: false
  },
  {
    name: 'Tỉa Mái Bay Hàn Quốc',
    slug: 'tia-mai-bay-han-quoc',
    category: 'Cắt & Tạo Kiểu Nữ',
    categorySlug: 'haircut',
    price: 80000,
    description: 'Tạo dáng mái bay nhẹ nhàng chuẩn phong cách Ulzzang Hàn Quốc.',
    image: 'https://images.unsplash.com/photo-1605497746444-ac9dbd39f69f?auto=format&fit=crop&w=800&q=80',
    duration: 20,
    suitableFor: ['Mọi dáng mặt', 'Khách hàng muốn thử thay đổi nhẹ'],
    benefits: ['Thanh thoát khuôn mặt', 'Kết hợp đẹp khi buộc tóc', 'Che trán cao'],
    isFeatured: false
  },
  {
    name: 'Tạo Kiểu Tóc Đi Tiệc',
    slug: 'tao-kieu-toc-di-tiec',
    category: 'Cắt & Tạo Kiểu Nữ',
    categorySlug: 'haircut',
    price: 150000,
    description: 'Uốn xoăn giả, sấy tạo phồng hoặc tết tóc dự tiệc quý phái theo yêu cầu.',
    image: 'https://images.unsplash.com/photo-1481501940778-c8bb63e376c5?auto=format&fit=crop&w=800&q=80',
    duration: 30,
    suitableFor: ['Khách đi tiệc, sự kiện', 'Chụp hình thời trang'],
    benefits: ['Giữ nếp suốt bữa tiệc', 'Phong cách sang trọng', 'Tỏa sáng rực rỡ'],
    isFeatured: false
  },
  {
    name: 'Tư Vấn Thiết Kế Form Tóc',
    slug: 'tu-van-thiet-ke-form-toc',
    category: 'Cắt & Tạo Kiểu Nữ',
    categorySlug: 'haircut',
    price: 50000,
    description: 'Đo tỷ lệ khuôn mặt và phân tích chất tóc để tư vấn kiểu tóc phù hợp nhất cùng Master Stylist.',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80',
    duration: 15,
    suitableFor: ['Khách hàng chưa định hình phong cách', 'Muốn thay đổi lớn'],
    benefits: ['Chuyên nghiệp, chính xác', 'Tránh cắt hỏng kiểu dáng', 'Thấu hiểu chất tóc'],
    isFeatured: false
  },

  // B. Uon Toc Nu
  {
    name: 'Uốn Setting Kỹ Thuật Số',
    slug: 'uon-setting-ky-thuat-so',
    category: 'Uốn Tóc Nữ',
    categorySlug: 'perm',
    price: 850000,
    description: 'Tạo lọn sóng uốn căng nảy bền đẹp dài lâu bằng máy uốn nóng kỹ thuật số.',
    image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80',
    duration: 180,
    suitableFor: ['Tóc trung bình đến khỏe', 'Muốn giữ nếp uốn lâu dài'],
    benefits: ['Sóng tóc căng nét', 'Giữ nếp uốn từ 6 - 9 tháng', 'Dễ tự sấy tạo kiểu'],
    isFeatured: true
  },
  {
    name: 'Uốn Lạnh Trào Lưu',
    slug: 'uon-lanh-trao-luu',
    category: 'Uốn Tóc Nữ',
    categorySlug: 'perm',
    price: 600000,
    description: 'Phương pháp uốn lạnh nhẹ nhàng tạo sóng xoăn xù mì hoặc xoăn tự nhiên từ chân tóc.',
    image: 'https://images.unsplash.com/photo-1595853035070-59a39fe84de3?auto=format&fit=crop&w=800&q=80',
    duration: 120,
    suitableFor: ['Tóc mỏng xẹp', 'Thích phong cách xoăn xù cá tính'],
    benefits: ['Tạo độ bồng chân tóc tối đa', 'Hạn chế tác động nhiệt', 'Phong cách cá tính'],
    isFeatured: false
  },
  {
    name: 'Uốn Sóng Lơi Hàn Quốc',
    slug: 'uon-song-loi-han-quoc',
    category: 'Uốn Tóc Nữ',
    categorySlug: 'perm',
    price: 900000,
    description: 'Những lọn sóng lơi nhẹ nhàng, bay bổng tự nhiên chuẩn phong cách thơ mộng của sao Hàn.',
    image: 'https://images.unsplash.com/photo-1517837016564-bfc4fdfde7d4?auto=format&fit=crop&w=800&q=80',
    duration: 180,
    suitableFor: ['Tóc dài trung bình trở lên', 'Thích phong cách dịu dàng, tự nhiên'],
    benefits: ['Sóng uốn tự nhiên mềm mại', 'Không bị già dặn', 'Sang trọng nhẹ nhàng'],
    isFeatured: true
  },
  {
    name: 'Uốn Cụp Tự Nhiên (Chữ C)',
    slug: 'uon-cup-tu-nhien-chu-c',
    category: 'Uốn Tóc Nữ',
    categorySlug: 'perm',
    price: 700000,
    description: 'Uốn cụp đuôi chữ C nhẹ nhàng ôm lấy khuôn mặt thanh tú, thanh lịch.',
    image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=800&q=80',
    duration: 150,
    suitableFor: ['Tóc lửng ngang vai hoặc ngắn', 'Công sở, học sinh'],
    benefits: ['Thanh lịch nhẹ nhàng', 'Dễ sấy chăm sóc', 'Tóc vào nếp gọn gàng'],
    isFeatured: false
  },
  {
    name: 'Uốn Phục Hồi Cao Cấp',
    slug: 'uon-phuc-hoi-cao-cap',
    category: 'Uốn Tóc Nữ',
    categorySlug: 'perm',
    price: 1200000,
    description: 'Kết hợp thuốc uốn organic cùng tinh chất Plex phục hồi tủy tóc yếu hư tổn bong tróc trong khi uốn.',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80',
    duration: 210,
    suitableFor: ['Tóc tẩy nhẹ, tóc yếu, khô xơ', 'Muốn uốn nhưng sợ hỏng tóc'],
    benefits: ['Bảo vệ sợi tóc tối đa', 'Lọn xoăn bóng bẩy khỏe mạnh', 'Ngăn ngừa đứt gãy'],
    isFeatured: false
  },

  // C. Duoi Toc Nu
  {
    name: 'Duỗi Thẳng Tự Nhiên (Soft Straight)',
    slug: 'duoi-thang-tu-nhien',
    category: 'Duỗi Tóc Nữ',
    categorySlug: 'straightening',
    price: 800000,
    description: 'Duỗi thẳng mượt mà óng ả tự nhiên, sợi tóc có độ rơi nhẹ mềm mại không bị đơ đét.',
    image: 'https://images.unsplash.com/photo-1595853035070-59a39fe84de3?auto=format&fit=crop&w=800&q=80',
    duration: 150,
    suitableFor: ['Tóc xoăn xù bẩm sinh', 'Tóc bông xù khó vào nếp'],
    benefits: ['Suôn mượt dễ chải', 'Không bị đơ ép sát da đầu', 'Vẻ đẹp dịu dàng truyền thống'],
    isFeatured: false
  },
  {
    name: 'Duỗi Cúp Volume',
    slug: 'duoi-cup-volume',
    category: 'Duỗi Tóc Nữ',
    categorySlug: 'straightening',
    price: 950000,
    description: 'Ép thẳng phần trên mượt mà và làm cụp phồng tự nhiên phần đuôi tóc tạo độ bồng bềnh ôm mặt.',
    image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=800&q=80',
    duration: 180,
    suitableFor: ['Tóc sợi thô, bông', 'Thích phom tóc thẳng ôm cằm'],
    benefits: ['Phần trên mượt mà không rối', 'Đuôi tóc cụp tự nhiên bồng bềnh', 'Tạo nét trẻ trung tinh tế'],
    isFeatured: true
  },
  {
    name: 'Duỗi Phồng Chân Tóc',
    slug: 'duoi-phong-chan-toc',
    category: 'Duỗi Tóc Nữ',
    categorySlug: 'straightening',
    price: 400000,
    description: 'Kỹ thuật làm phồng chân tóc nhẹ nhàng bằng thuốc ép phồng chuyên dụng không dùng kẹp gãy.',
    image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=800&q=80',
    duration: 90,
    suitableFor: ['Tóc mỏng bẹt da đầu', 'Tóc uốn đuôi nhưng đỉnh đầu xẹp'],
    benefits: ['Khắc phục khuyết điểm tóc xẹp', 'Tự nhiên không lộ nếp gãy', 'Giúp khuôn mặt nhỏ gọn hơn'],
    isFeatured: false
  },
  {
    name: 'Duỗi Collagen/Keratin Siêu Bóng',
    slug: 'duoi-collagen-keratin-sieu-bong',
    category: 'Duỗi Tóc Nữ',
    categorySlug: 'straightening',
    price: 1300000,
    description: 'Nạp collagen tinh khiết ép bóng bề mặt sợi tóc nát hư tổn, cho mái tóc bóng gương lung linh.',
    image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80',
    duration: 180,
    suitableFor: ['Tóc hư tổn do làm hóa chất liên tục', 'Sợi tóc xỉn màu khô ráp'],
    benefits: ['Bóng mượt tuyệt hảo (hiệu ứng tráng gương)', 'Khóa biểu bì khóa màu nhuộm', 'Phục hồi sợi tóc từ bên trong'],
    isFeatured: false
  },

  // D. Nhuom Toc Nu
  {
    name: 'Nhuộm Màu Thời Trang',
    slug: 'nhuom-mau-thoi-trang',
    category: 'Nhuộm Tóc Nữ',
    categorySlug: 'color',
    price: 800000,
    description: 'Lên tông màu thời trang rực rỡ cá tính (xám khói, rêu khói, hồng baby) bền màu an toàn.',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80',
    duration: 120,
    suitableFor: ['Phụ nữ hiện đại cá tính', 'Muốn thể hiện phong cách riêng'],
    benefits: ['Độ lên màu chuẩn xác', 'Sử dụng thuốc nhuộm dưỡng cao', 'Bảng màu hot trend đa dạng'],
    isFeatured: true
  },
  {
    name: 'Nhuộm Nâu Công Sở Thanh Lịch',
    slug: 'nhuom-nau-cong-so-thanh-lich',
    category: 'Nhuộm Tóc Nữ',
    categorySlug: 'color',
    price: 600000,
    description: 'Các tông nâu lạnh, nâu hạt dẻ, nâu trà sữa thanh lịch tôn da không cần tẩy tóc.',
    image: 'https://images.unsplash.com/photo-1517837016564-bfc4fdfde7d4?auto=format&fit=crop&w=800&q=80',
    duration: 90,
    suitableFor: ['Môi trường công sở, học tập', 'Thích tone màu nhã nhặn'],
    benefits: ['Sáng da, thanh lịch', 'Không cần tẩy tóc nên cực kỳ khỏe', 'Lâu phai màu'],
    isFeatured: false
  },
  {
    name: 'Nhuộm Phủ Bạc Thảo Dược',
    slug: 'nhuom-phu-bac-thao-duoc',
    category: 'Nhuộm Tóc Nữ',
    categorySlug: 'color',
    price: 500000,
    description: 'Phủ bạc hoàn hảo bằng sản phẩm chiết xuất thảo mộc dịu nhẹ, an toàn tuyệt đối cho da đầu nhạy cảm.',
    image: 'https://images.unsplash.com/photo-1605497746444-ac9dbd39f69f?auto=format&fit=crop&w=800&q=80',
    duration: 90,
    suitableFor: ['Khách trung niên', 'Người có tóc bạc sớm', 'Da đầu dễ dị ứng'],
    benefits: ['Phủ bạc 100%', 'Lành tính không xót da đầu', 'Không nồng mùi amoniac'],
    isFeatured: false
  },
  {
    name: 'Nhuộm Highlight/Babylight',
    slug: 'nhuom-highlight-babylight',
    category: 'Nhuộm Tóc Nữ',
    categorySlug: 'color',
    price: 950000,
    description: 'Kỹ thuật tạo lọn sáng đan xen xen kẽ tạo hiệu ứng chiều sâu 3D cá tính và bắt mắt cho mái tóc.',
    image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=800&q=80',
    duration: 150,
    suitableFor: ['Yêu thích sự phá cách nhẹ nhàng', 'Hợp với kiểu cắt layer uốn sóng'],
    benefits: ['Tạo chiều sâu sống động', 'Rất sành điệu hiện đại', 'Không cần tẩy cả đầu'],
    isFeatured: true
  },
  {
    name: 'Nhuộm Ombre/Balayage Pháp',
    slug: 'nhuom-ombre-balayage-phap',
    category: 'Nhuộm Tóc Nữ',
    categorySlug: 'color',
    price: 1800000,
    description: 'Kỹ thuật nhuộm quét tay Balayage đỉnh cao từ Pháp, tạo sự chuyển màu loang mịn từ tối sang sáng.',
    image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80',
    duration: 240,
    suitableFor: ['Tín đồ sành điệu nhất', 'Muốn sở hữu tác phẩm nghệ thuật trên tóc'],
    benefits: ['Hiệu ứng chuyển màu cực mịn', 'Độc lạ cuốn hút', 'Mọc chân đen không bị lộ rõ'],
    isFeatured: true
  },
  {
    name: 'Tẩy Tóc An Toàn (Mỗi Lần)',
    slug: 'tay-toc-an-toan-moi-lan',
    category: 'Nhuộm Tóc Nữ',
    categorySlug: 'color',
    price: 400000,
    description: 'Bột tẩy dưỡng cao cấp loại bỏ sắc tố đen nhẹ nhàng, bổ sung Plex để giữ liên kết sợi tóc.',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80',
    duration: 60,
    suitableFor: ['Nhuộm màu khói, pastel, bạch kim'],
    benefits: ['Bóc màu tối ưu', 'Bổ sung plex chống mủn tóc', 'Hạn chế xót da đầu'],
    isFeatured: false
  },

  // E. Phuc Hoi Toc
  {
    name: 'Hấp Dầu Dưỡng Chất Siêu Mượt',
    slug: 'hap-dau-duong-chat-sieu-muot',
    category: 'Phục Hồi Tóc',
    categorySlug: 'treatment',
    price: 250000,
    description: 'Hấp nhiệt đưa dưỡng chất sâu vào tủy tóc cấp ẩm cấp tốc cho mái tóc thô xơ.',
    image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=800&q=80',
    duration: 45,
    suitableFor: ['Tóc khô nhẹ, xỉn màu do đi nắng nhiều'],
    benefits: ['Cấp ẩm bóng mượt tức thì', 'Mùi hương dễ chịu thư giãn', 'Chi phí tiết kiệm'],
    isFeatured: false
  },
  {
    name: 'Tái Cấu Trúc Keratin Thủy Phân',
    slug: 'tai-cau-truc-keratin-thuy-phan',
    category: 'Phục Hồi Tóc',
    categorySlug: 'treatment',
    price: 600000,
    description: 'Tái tạo lại các liên kết keratin bị đứt gãy do hóa chất, phục hồi độ đàn hồi chắc khỏe cho tóc nát.',
    image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80',
    duration: 90,
    suitableFor: ['Tóc nát mủn do tẩy nhuộm uốn liên tục', 'Sợi tóc mất đàn hồi co giãn mạnh'],
    benefits: ['Gia cố độ chắc khỏe của lõi tóc', 'Giảm gãy rụng tới 90%', 'Khôi phục độ dai cho sợi tóc'],
    isFeatured: true
  },
  {
    name: 'Ủ Collagen Phục Hồi Siêu Bóng',
    slug: 'u-collagen-phuc-hoi-sieu-bong',
    category: 'Phục Hồi Tóc',
    categorySlug: 'treatment',
    price: 450000,
    description: 'Tươi đẫm sợi tóc với tinh chất collagen tươi, tạo một lớp bảo vệ dưỡng bóng hoàn hảo bên ngoài.',
    image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=800&q=80',
    duration: 60,
    suitableFor: ['Tóc thô ráp, xơ xù khó vào nếp'],
    benefits: ['Cho sợi tóc mềm mại lướt nhẹ', 'Tăng độ bắt sáng lung linh', 'Làm nặng sợi tóc giảm vểnh'],
    isFeatured: false
  },
  {
    name: 'Trị Liệu Chuyên Sâu Tóc Khô Hư Tổn',
    slug: 'tri-lieu-chuyen-sau-toc-kho-hu-ton',
    category: 'Phục Hồi Tóc',
    categorySlug: 'treatment',
    price: 500000,
    description: 'Quy trình kết hợp 3 bước đưa protein và lipids bù đắp phần vỏ tóc hư tổn nặng do tác nhân bên ngoài.',
    image: 'https://images.unsplash.com/photo-1595853035070-59a39fe84de3?auto=format&fit=crop&w=800&q=80',
    duration: 75,
    suitableFor: ['Tóc cháy nắng, chẻ ngọn phần đuôi', 'Tóc giòn dễ gãy'],
    benefits: ['Khóa chặt đuôi tóc chẻ ngọn', 'Bù đắp biểu bì bị thiếu hụt', 'Nuôi dưỡng biểu bì bóng mượt'],
    isFeatured: false
  },

  // F. Goi Dau Duong Sinh
  {
    name: 'Gội Thư Giãn Standard',
    slug: 'goi-thu-gian-standard',
    category: 'Gội Đầu Dưỡng Sinh',
    categorySlug: 'shampoo',
    price: 100000,
    description: 'Gội làm sạch da đầu 2 lần bằng dầu gội thiên nhiên kết hợp massage nhẹ nhàng xông tinh dầu.',
    image: 'https://images.unsplash.com/photo-1605497746444-ac9dbd39f69f?auto=format&fit=crop&w=800&q=80',
    duration: 45,
    suitableFor: ['Khách muốn thư giãn nhanh', 'Làm sạch bụi bẩn hàng ngày'],
    benefits: ['Làm sạch tóc nhẹ êm', 'Thư giãn sảng khoái đầu óc', 'Sấy tóc vào nếp gọn'],
    isFeatured: false
  },
  {
    name: 'Gội Đầu Dưỡng Sinh Đông Y',
    slug: 'goi-dau-duong-sinh-dong-y',
    category: 'Gội Đầu Dưỡng Sinh',
    categorySlug: 'shampoo',
    price: 180000,
    description: 'Phương pháp bấm huyệt cổ vai gáy, gội đầu canh thảo dược đả thông kinh lạc giảm stress mệt mỏi.',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80',
    duration: 75,
    suitableFor: ['Dân văn phòng mệt mỏi', 'Người bị mất ngủ kinh niên', 'Đau nhức vai gáy'],
    benefits: ['Giảm nhức mỏi vai gáy rõ rệt', 'Kích thích tuần hoàn máu não', 'Giúp giấc ngủ sâu giấc hơn'],
    isFeatured: true
  },
  {
    name: 'Trị Liệu Thải Độc Da Đầu Gàu Dầu',
    slug: 'tri-lieu-thai-doc-da-dau-gau-dau',
    category: 'Gội Đầu Dưỡng Sinh',
    categorySlug: 'shampoo',
    price: 250000,
    description: 'Thải độc tẩy tế bào chết da đầu bằng bùn khoáng organic, xịt tinh dầu tràm trà cân bằng tuyến bã nhờn.',
    image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=800&q=80',
    duration: 60,
    suitableFor: ['Người có da đầu nhiều dầu bết tóc', 'Nhiều gàu ngứa ngáy'],
    benefits: ['Giảm bết tóc rõ rệt từ lần đầu', 'Sạch gàu thông thoáng chân tóc', 'Ngăn rụng tóc chân sâu'],
    isFeatured: false
  },
  {
    name: 'Combo Gội Dưỡng Sinh & Sấy Tạo Kiểu Premium',
    slug: 'combo-goi-duong-sinh-say-tao-kieu',
    category: 'Gội Đầu Dưỡng Sinh',
    categorySlug: 'shampoo',
    price: 200000,
    description: 'Gội đầu dưỡng sinh thư giãn sâu kết hợp sấy xoăn lơi hoặc sấy phồng dự tiệc bồng bềnh quyến rũ.',
    image: 'https://images.unsplash.com/photo-1517837016564-bfc4fdfde7d4?auto=format&fit=crop&w=800&q=80',
    duration: 90,
    suitableFor: ['Khách hàng nữ cần chuẩn bị dự tiệc', 'Hẹn hò, chụp ảnh'],
    benefits: ['Đầu óc thư thái thoải mái', 'Mái tóc đẹp hoàn hảo đi tiệc', 'Hương thơm quyến rũ dài lâu'],
    isFeatured: false
  },

  // G. Combo Lam Dep
  {
    name: 'Combo Cắt + Gội Dưỡng Sinh + Sấy Kiểu',
    slug: 'combo-cat-goi-say-kieu',
    category: 'Combo Làm Đẹp',
    categorySlug: 'combo',
    price: 300000,
    description: 'Lựa chọn hoàn hảo thay đổi nhẹ diện mạo: Tư vấn form tóc, cắt tạo kiểu, gội dưỡng sinh đả thông kinh lạc và sấy kiểu.',
    image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80',
    duration: 90,
    suitableFor: ['Mọi khách hàng muốn trải nghiệm cơ bản chăm sóc định kỳ'],
    benefits: ['Trọn gói thư giãn & làm đẹp', 'Tiết kiệm chi phí so với lẻ', 'Mái tóc vào phom tuyệt đẹp'],
    isFeatured: true
  },
  {
    name: 'Combo Nhuộm Thời Trang & Phục Hồi Collagen',
    slug: 'combo-nhuom-thoi-trang-phuc-hoi-collagen',
    category: 'Combo Làm Đẹp',
    categorySlug: 'combo',
    price: 1100000,
    description: 'Lên màu nhuộm bóng bẩy bền lâu, khóa hạt màu sâu trong biểu bì đồng thời bơm đẫm dưỡng chất collagen.',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80',
    duration: 150,
    suitableFor: ['Khách muốn nhuộm màu sáng nhưng sợ tóc khô xơ'],
    benefits: ['Màu nhuộm rực rỡ bóng khỏe', 'Khóa màu bền lâu hơn', 'Tóc mềm rủ bóng bẩy'],
    isFeatured: true
  },
  {
    name: 'Combo Uốn Thiết Kế & Phục Hồi Lõi Keratin',
    slug: 'combo-uon-thiet-ke-phuc-hoi-keratin',
    category: 'Combo Làm Đẹp',
    categorySlug: 'combo',
    price: 1300000,
    description: 'Uốn thiết kế phom dáng sành điệu cùng liệu trình nạp Keratin phục hồi lõi tóc giúp lọn xoăn nảy sóng tự nhiên.',
    image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80',
    duration: 210,
    suitableFor: ['Tóc yếu xơ muốn uốn xoăn phom bồng bềnh'],
    benefits: ['Lọn xoăn cực kỳ đàn hồi nảy sóng', 'Hạn chế tối đa hư tổn sau làm hóa chất', 'Lớp bảo vệ chắc khỏe lâu dài'],
    isFeatured: true
  },
  {
    name: 'Combo Duỗi Cúp Volume & Phục Hồi Siêu Bóng Nano',
    slug: 'combo-duoi-cup-volume-phuc-hoi-nano',
    category: 'Combo Làm Đẹp',
    categorySlug: 'combo',
    price: 1200000,
    description: 'Duỗi cúp bồng bềnh tự nhiên kết hợp truyền dưỡng chất bóng mượt nano, thổi bay mái tóc bông xù thô ráp.',
    image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=800&q=80',
    duration: 180,
    suitableFor: ['Tóc xoăn xù tự nhiên, xơ xù thiếu sức sống'],
    benefits: ['Tóc suôn thẳng mềm mượt như lụa', 'Tạo độ ôm cằm trẻ trung cuốn hút', 'Hiệu ứng bóng gương nổi bật'],
    isFeatured: false
  },
  {
    name: 'Combo Đi Tiệc Hoàn Hảo (Gội + Sấy Kiểu + Make Up)',
    slug: 'combo-di-tiec-hoan-hao',
    category: 'Combo Làm Đẹp',
    categorySlug: 'combo',
    price: 350000,
    description: 'Gội đầu dưỡng chất, sấy uốn kiểu và trang điểm nhẹ nhàng tinh tế giúp nàng rạng ngời nổi bật nhất.',
    image: 'https://images.unsplash.com/photo-1481501940778-c8bb63e376c5?auto=format&fit=crop&w=800&q=80',
    duration: 90,
    suitableFor: ['Khách đi đám cưới, dự tiệc tối, chụp ảnh kỷ niệm'],
    benefits: ['Làm đẹp toàn diện nhanh chóng', 'Giữ lớp makeup sấy kiểu bền lâu', 'Phong cách trẻ trung cuốn hút'],
    isFeatured: false
  }
];

const productSeeds = [
  {
    name: 'Dầu Gội Phục Hồi Keratin',
    price: 320000,
    description: 'Làm sạch nhẹ dịu và phục hồi suôn tóc hư tổn.',
    stock: 24,
    image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1',
    category: 'Hair Care',
    isActive: true
  },
  {
    name: 'Tinh Dầu Dưỡng Tóc Argan',
    price: 280000,
    description: 'Giảm rối, tăng độ bóng mượt cho tóc sau nhuộm.',
    stock: 18,
    image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702',
    category: 'Treatment',
    isActive: true
  },
  {
    name: 'Sáp Tạo Kiểu Silk Hold',
    price: 190000,
    description: 'Giữ nếp mềm, dễ restyle trong ngày.',
    stock: 35,
    image: 'https://images.unsplash.com/photo-1517837016564-bfc4fdfde7d4',
    category: 'Styling',
    isActive: true
  }
];

const crmCustomerSeeds = [
  {
    key: 'lan-anh',
    fullName: 'Nguyễn Lan Anh',
    phone: '0911000001',
    email: 'crm.lananh@example.com',
    bookings: [
      { serviceSlug: 'cat-layer-nu-premium', daysAgo: 220, stylist: 'Anh Minh' },
      {
        serviceSlug: 'nhuom-nau-cong-so-thanh-lich',
        daysAgo: 170,
        stylist: 'Chị Lan',
        hairColorUsed: 'Nâu trà sữa'
      },
      { serviceSlug: 'uon-song-loi-han-quoc', daysAgo: 110, stylist: 'Anh Tuấn' },
      {
        serviceSlug: 'nhuom-highlight-babylight',
        daysAgo: 55,
        stylist: 'Chị Lan',
        hairColorUsed: 'Nâu beige highlight'
      },
      {
        serviceSlug: 'combo-nhuom-thoi-trang-phuc-hoi-collagen',
        daysAgo: 12,
        stylist: 'Chị Lan',
        hairColorUsed: 'Nâu lạnh ánh khói'
      }
    ],
    notes: [
      {
        type: 'consultation',
        note: 'Khách thích tông lạnh, ưu tiên màu sáng da nhưng không muốn tẩy quá nhiều.'
      },
      {
        type: 'follow_up',
        note: 'Nhắc dặm chân tóc sau 7 tuần và duy trì dầu gội giữ màu.'
      }
    ],
    formulas: [
      {
        bookingIndex: 3,
        serviceName: 'Nhuộm Highlight/Babylight',
        colorName: 'Nâu beige highlight',
        formula: '7.13 40g + 8.1 20g + mix ash 2g',
        oxidant: 'Oxy 6%',
        hairBaseLevel: 'Nền 6',
        hairConditionBefore: 'Tóc hơi khô ở ngọn, nền không đều nhẹ',
        hairConditionAfter: 'Màu trong, sợi tóc còn độ đàn hồi tốt',
        aftercareAdvice: 'Gội nước mát, dùng dầu gội tím 1 lần/tuần.'
      },
      {
        bookingIndex: 4,
        serviceName: 'Combo Nhuộm & Phục Hồi Collagen',
        colorName: 'Nâu lạnh ánh khói',
        formula: '6.11 50g + 7.1 20g + blue 1g',
        oxidant: 'Oxy 6%',
        hairBaseLevel: 'Nền 6.5',
        hairConditionBefore: 'Ngọn tóc khô nhẹ sau highlight',
        hairConditionAfter: 'Bóng, mềm và màu đồng đều',
        aftercareAdvice: 'Ủ collagen mỗi tuần, tránh nhiệt cao trong 5 ngày đầu.'
      }
    ],
    orderProductIndexes: [0, 1]
  },
  {
    key: 'minh-thu',
    fullName: 'Trần Minh Thu',
    phone: '0911000002',
    email: 'crm.minhthu@example.com',
    bookings: [
      { serviceSlug: 'goi-dau-duong-sinh-dong-y', daysAgo: 190, stylist: 'Chị Hương' },
      { serviceSlug: 'cat-bob-lob-thoi-thuong', daysAgo: 128, stylist: 'Anh Minh' }
    ],
    notes: [
      {
        type: 'follow_up',
        note: 'Đã lâu chưa quay lại, nên gọi hỏi thăm và mời trải nghiệm gội dưỡng sinh.'
      }
    ]
  },
  {
    key: 'ngoc-han',
    fullName: 'Lê Ngọc Hân',
    phone: '0911000003',
    email: 'crm.ngochan@example.com',
    bookings: [
      { serviceSlug: 'tia-mai-bay-han-quoc', daysAgo: 8, stylist: 'Anh Minh' }
    ],
    notes: [
      {
        type: 'consultation',
        note: 'Khách mới, thích kiểu nhẹ nhàng và cần hướng dẫn tự sấy mái tại nhà.'
      }
    ]
  },
  {
    key: 'thanh-mai',
    fullName: 'Phạm Thanh Mai',
    phone: '0911000004',
    email: 'crm.thanhmai@example.com',
    bookings: [
      { serviceSlug: 'duoi-cup-volume', daysAgo: 80, stylist: 'Anh Tuấn' },
      {
        serviceSlug: 'tai-cau-truc-keratin-thuy-phan',
        daysAgo: 24,
        stylist: 'Anh Tuấn'
      }
    ],
    notes: [
      {
        type: 'service',
        note: 'Tóc khô xơ và yếu phần ngọn; cần tiếp tục phục hồi trước khi làm hóa chất mới.'
      }
    ]
  },
  {
    key: 'bao-tram',
    fullName: 'Võ Bảo Trâm',
    phone: '0911000005',
    email: 'crm.baotram@example.com',
    bookings: [
      { serviceSlug: 'uon-setting-ky-thuat-so', daysAgo: 95, stylist: 'Anh Tuấn' },
      { serviceSlug: 'uon-phuc-hoi-cao-cap', daysAgo: 32, stylist: 'Anh Tuấn' }
    ],
    notes: [
      {
        type: 'internal',
        note: 'Khách ưu tiên chất lượng và thường chọn gói phục hồi cao cấp.'
      }
    ]
  },
  {
    key: 'ha-vy',
    fullName: 'Đỗ Hà Vy',
    phone: '0911000006',
    email: 'crm.havy@example.com',
    bookings: [
      {
        serviceSlug: 'nhuom-mau-thoi-trang',
        daysAgo: 200,
        stylist: 'Chị Lan',
        hairColorUsed: 'Đỏ cherry'
      },
      {
        serviceSlug: 'nhuom-ombre-balayage-phap',
        daysAgo: 120,
        stylist: 'Chị Lan',
        hairColorUsed: 'Balayage caramel'
      },
      {
        serviceSlug: 'combo-uon-thiet-ke-phuc-hoi-keratin',
        daysAgo: 48,
        stylist: 'Anh Tuấn'
      },
      {
        serviceSlug: 'nhuom-highlight-babylight',
        daysAgo: 18,
        stylist: 'Chị Lan',
        hairColorUsed: 'Beige khói'
      }
    ],
    notes: [
      {
        type: 'consultation',
        note: 'Khách VIP, thích thay đổi màu theo mùa và chụp ảnh nhiều.'
      }
    ],
    formulas: [
      {
        bookingIndex: 1,
        serviceName: 'Nhuộm Ombre/Balayage Pháp',
        colorName: 'Balayage caramel',
        formula: '8.34 40g + 8.13 20g',
        oxidant: 'Oxy 3%',
        hairBaseLevel: 'Nền 8',
        hairConditionBefore: 'Tóc đã tẩy, độ đàn hồi trung bình',
        hairConditionAfter: 'Chuyển màu mịn, ngọn tóc mềm',
        aftercareAdvice: 'Dùng mask bond 2 lần/tuần.'
      },
      {
        bookingIndex: 3,
        serviceName: 'Nhuộm Highlight/Babylight',
        colorName: 'Beige khói',
        formula: '9.13 30g + 9.1 20g + violet 0.5g',
        oxidant: 'Oxy 3%',
        hairBaseLevel: 'Nền 9',
        hairConditionBefore: 'Tóc tẩy cũ, hơi rỗng ngọn',
        hairConditionAfter: 'Màu sạch vàng, tóc bóng',
        aftercareAdvice: 'Không gội 48 giờ, dùng xịt chống nhiệt.'
      }
    ],
    orderProductIndexes: [1]
  },
  {
    key: 'quynh-nhu',
    fullName: 'Nguyễn Quỳnh Như',
    phone: '0911000007',
    email: 'crm.quynhnhu@example.com',
    bookings: [
      { serviceSlug: 'goi-thu-gian-standard', daysAgo: 210, stylist: 'Chị Hương' },
      { serviceSlug: 'cat-layer-nu-premium', daysAgo: 154, stylist: 'Anh Minh' }
    ],
    notes: [
      {
        type: 'follow_up',
        note: 'Khách lâu chưa quay lại, phù hợp chiến dịch chăm sóc khách cũ.'
      }
    ]
  },
  {
    key: 'kim-oanh',
    fullName: 'Bùi Kim Oanh',
    phone: '0911000008',
    email: 'crm.kimoanh@example.com',
    bookings: [
      { serviceSlug: 'goi-dau-duong-sinh-dong-y', daysAgo: 42, stylist: 'Chị Hương' },
      {
        serviceSlug: 'combo-cat-goi-say-kieu',
        daysAgo: 10,
        stylist: 'Anh Minh'
      }
    ],
    notes: [
      {
        type: 'service',
        note: 'Khách thích massage cổ vai gáy và thường đặt buổi tối.'
      }
    ]
  },
  {
    key: 'my-linh',
    fullName: 'Hoàng Mỹ Linh',
    phone: '0911000009',
    email: 'crm.mylinh@example.com',
    bookings: [],
    notes: [
      {
        type: 'consultation',
        note: 'Khách đã đăng ký tài khoản và đang cân nhắc nhuộm nâu công sở.'
      }
    ]
  },
  {
    key: 'thu-trang',
    fullName: 'Đặng Thu Trang',
    phone: '0911000010',
    email: 'crm.thutrang@example.com',
    bookings: [
      {
        serviceSlug: 'nhuom-nau-cong-so-thanh-lich',
        daysAgo: 70,
        stylist: 'Chị Lan',
        hairColorUsed: 'Nâu hạt dẻ'
      },
      {
        serviceSlug: 'tri-lieu-chuyen-sau-toc-kho-hu-ton',
        daysAgo: 21,
        stylist: 'Anh Tuấn'
      }
    ],
    notes: [
      {
        type: 'service',
        note: 'Phần đuôi tóc từng cháy nhẹ do tự kẹp nhiệt; cần phục hồi định kỳ.'
      }
    ],
    formulas: [
      {
        bookingIndex: 0,
        serviceName: 'Nhuộm Nâu Công Sở Thanh Lịch',
        colorName: 'Nâu hạt dẻ',
        formula: '5.35 50g + 6.0 20g',
        oxidant: 'Oxy 6%',
        hairBaseLevel: 'Nền 4',
        hairConditionBefore: 'Ngọn tóc khô và xốp nhẹ',
        hairConditionAfter: 'Màu phủ đều, tóc mềm hơn',
        aftercareAdvice: 'Hạn chế kẹp nhiệt và dùng serum ngọn tóc mỗi ngày.'
      }
    ]
  }
];

const ensureUser = async ({ name, email, phone, password, role }) => {
  let user = await User.findOne({ email }).select('+password');

  if (!user) {
    user = new User({
      name,
      email,
      phone,
      password,
      role
    });

    await user.save();
    return user;
  }

  user.name = name;
  user.phone = phone;
  user.role = role;
  await user.save();
  return user;
};

const dateFromDaysAgo = (daysAgo) => {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date;
};

const seedCrmCustomers = async ({ adminUser }) => {
  const [services, products] = await Promise.all([
    Service.find({
      slug: {
        $in: crmCustomerSeeds.flatMap((customer) =>
          customer.bookings.map((booking) => booking.serviceSlug)
        )
      }
    }).lean(),
    Product.find().sort({ createdAt: 1 }).lean()
  ]);
  const serviceMap = new Map(services.map((service) => [service.slug, service]));

  for (const customerSeed of crmCustomerSeeds) {
    const user = await ensureUser({
      name: customerSeed.fullName,
      email: customerSeed.email,
      phone: customerSeed.phone,
      password: env.DEFAULT_CUSTOMER_PASSWORD,
      role: 'customer'
    });
    const customer = await customerService.ensureCustomerProfile({
      userId: user._id,
      fullName: customerSeed.fullName,
      phone: customerSeed.phone,
      email: customerSeed.email
    });
    const seededBookings = [];

    for (const [bookingIndex, bookingSeed] of customerSeed.bookings.entries()) {
      const service = serviceMap.get(bookingSeed.serviceSlug);
      if (!service) {
        throw new Error(`Khong tim thay dich vu seed ${bookingSeed.serviceSlug}`);
      }

      const seedKey = `crm-booking-${customerSeed.key}-${bookingIndex}`;
      const booking = await Booking.findOneAndUpdate(
        { seedKey },
        {
          $set: {
            userId: user._id,
            customerId: customer._id,
            customerName: customerSeed.fullName,
            phone: customerSeed.phone,
            email: customerSeed.email,
            serviceId: service._id,
            serviceName: service.name,
            stylist: bookingSeed.stylist || '',
            date: dateFromDaysAgo(bookingSeed.daysAgo),
            time: bookingSeed.time || `${String(9 + (bookingIndex % 8)).padStart(2, '0')}:00`,
            addOns: [],
            totalPrice: service.price,
            baseServicePrice: service.price,
            serviceDiscountPercent: 0,
            pricingRuleLabel: '',
            status: bookingSeed.status || 'completed',
            hairColorUsed: bookingSeed.hairColorUsed || '',
            note: bookingSeed.note || '',
            seedKey
          }
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
          setDefaultsOnInsert: true
        }
      );
      seededBookings.push(booking);
    }

    for (const [noteIndex, noteSeed] of (customerSeed.notes || []).entries()) {
      const seedKey = `crm-note-${customerSeed.key}-${noteIndex}`;
      await CustomerNote.findOneAndUpdate(
        { seedKey },
        {
          $set: {
            customerId: customer._id,
            note: noteSeed.note,
            type: noteSeed.type,
            createdBy: adminUser._id,
            seedKey
          }
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
          setDefaultsOnInsert: true
        }
      );
    }

    for (const [formulaIndex, formulaSeed] of (customerSeed.formulas || []).entries()) {
      const appointment = seededBookings[formulaSeed.bookingIndex] || null;
      const seedKey = `crm-formula-${customerSeed.key}-${formulaIndex}`;
      await HairFormula.findOneAndUpdate(
        { seedKey },
        {
          $set: {
            customerId: customer._id,
            appointmentId: appointment?._id || null,
            serviceName: formulaSeed.serviceName,
            colorName: formulaSeed.colorName,
            formula: formulaSeed.formula,
            oxidant: formulaSeed.oxidant || '',
            hairBaseLevel: formulaSeed.hairBaseLevel || '',
            hairConditionBefore: formulaSeed.hairConditionBefore || '',
            hairConditionAfter: formulaSeed.hairConditionAfter || '',
            aftercareAdvice: formulaSeed.aftercareAdvice || '',
            createdBy: adminUser._id,
            seedKey
          }
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
          setDefaultsOnInsert: true
        }
      );
    }

    if (customerSeed.orderProductIndexes?.length) {
      const orderProducts = customerSeed.orderProductIndexes
        .map((index) => products[index])
        .filter(Boolean)
        .map((product) => ({
          productId: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1
        }));

      if (orderProducts.length) {
        const totalPrice = orderProducts.reduce((sum, product) => sum + product.price, 0);
        const seedKey = `crm-order-${customerSeed.key}`;
        await Order.findOneAndUpdate(
          { seedKey },
          {
            $set: {
              userId: user._id,
              products: orderProducts,
              totalPrice,
              status: 'completed',
              note: 'Đơn hàng mẫu CRM',
              payment: {
                provider: 'cash',
                status: 'paid',
                checkoutUrl: '',
                metadata: {
                  seeded: true
                }
              },
              seedKey
            }
          },
          {
            upsert: true,
            new: true,
            runValidators: true,
            setDefaultsOnInsert: true
          }
        );
      }
    }

    await customerService.refreshCustomerStats(customer._id);
  }
};

const seed = async () => {
  try {
    await connectDB();

    for (const service of serviceSeeds) {
      await Service.findOneAndUpdate({ name: service.name }, service, {
        upsert: true,
        new: true,
        runValidators: true
      });
    }

    for (const product of productSeeds) {
      await Product.findOneAndUpdate({ name: product.name }, product, {
        upsert: true,
        new: true,
        runValidators: true
      });
    }

    const adminUser = await ensureUser({
      name: env.DEFAULT_ADMIN_NAME,
      email: env.DEFAULT_ADMIN_EMAIL,
      phone: env.DEFAULT_ADMIN_PHONE,
      password: env.DEFAULT_ADMIN_PASSWORD,
      role: 'admin'
    });

    await ensureUser({
      name: 'Salon Staff',
      email: env.DEFAULT_STAFF_EMAIL,
      phone: env.DEFAULT_STAFF_PHONE,
      password: env.DEFAULT_STAFF_PASSWORD,
      role: 'staff'
    });

    await ensureUser({
      name: 'Sample Customer',
      email: env.DEFAULT_CUSTOMER_EMAIL,
      phone: env.DEFAULT_CUSTOMER_PHONE,
      password: env.DEFAULT_CUSTOMER_PASSWORD,
      role: 'customer'
    });

    await seedCrmCustomers({ adminUser });
    await customerService.syncLegacyCustomerProfiles();

    console.log('Seed data created successfully');
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seed();
