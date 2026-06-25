export interface NewsPost {
  slug: string;
  title: string;
  date: string;
  tag: string;
  desc: string;
  image: string;
  content: string[];
}

export const newsPosts: NewsPost[] = [
  {
    slug: "xu-huong-mau-tra-sua-2026",
    title: "Xu hướng màu trà sữa 2026",
    date: "01/03/2026",
    tag: "Xu hướng tóc",
    desc: "Gam màu trà sữa beige – mocha đang trở thành xu hướng nổi bật trong năm 2026. Sự kết hợp giữa sắc nâu nhẹ và ánh beige tạo hiệu ứng tóc bóng mượt, phù hợp với làn da châu Á và dễ dàng phối hợp với nhiều phong cách thời trang.",
    image: "https://images.unsplash.com/photo-1620824625810-4e8b72a5dd9f?auto=format&fit=crop&w=800&q=80",
    content: [
      "Gam màu trà sữa beige – mocha đang trở thành xu hướng nổi bật hàng đầu trong năm 2026. Đây là sự pha trộn tinh tế giữa sắc thái nâu đất ấm áp và màu kem beige sáng trong, mang lại cảm giác dịu dàng nhưng không kém phần thời thượng cho bất cứ ai sở hữu.",
      "Lý do màu trà sữa trở thành xu hướng được săn đón nhiều nhất chính là khả năng làm tôn lên làn da châu Á một cách tự nhiên. Không quá chói lọi như các tông vàng tẩy, sắc thái này mang lại vẻ ngoài vô cùng nền nã, tôn da và tạo hiệu ứng tóc óng mượt khoẻ mạnh.",
      "Tại Salon Dương Chi, mỗi công thức nhuộm màu trà sữa đều được các stylist cân đo đong đếm tỉ mỉ dựa trên nền tóc thực tế và tông da (undertone) của khách hàng. Chúng tôi cam kết sử dụng các sản phẩm màu nhuộm hữu cơ dưỡng sâu, giúp màu lên trong suốt, bóng khỏe và hạn chế tối đa hư tổn cấu trúc sợi tóc.",
      "Bên cạnh đó, màu nhuộm này cực kỳ dễ phối đồ và thích ứng tốt với nhiều môi trường, từ văn phòng chuyên nghiệp cho đến các buổi tiệc tối sang trọng. Hãy liên hệ với chúng tôi để thiết kế sắc độ trà sữa cá nhân hóa dành riêng cho phong cách của bạn."
    ]
  },
  {
    slug: "ky-thuat-uon-s-wave-am-muot",
    title: "Kỹ thuật uốn S-wave ẩm mượt",
    date: "20/02/2026",
    tag: "Kỹ thuật làm tóc",
    desc: "Uốn S-wave mang đến những lọn tóc mềm mại và tự nhiên. Nhờ kỹ thuật kiểm soát nhiệt hiện đại và dưỡng chất phục hồi, mái tóc giữ được độ bóng khỏe, hạn chế khô xơ và giữ nếp lâu hơn.",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
    content: [
      "Uốn xoăn sóng lơi S-wave từ lâu đã là lựa chọn lý tưởng cho những ai yêu thích vẻ đẹp tự nhiên, bồng bềnh mà không tốn nhiều công chăm sóc mỗi ngày. Những lọn sóng hình chữ S uốn lượn nhịp nhàng giúp ôm trọn gương mặt, tạo cảm giác thanh thoát và cực kỳ mềm mại.",
      "Khác với các kỹ thuật uốn truyền thống dễ làm tóc mất nước và xơ xác, tại Dương Chi Salon, chúng tôi ứng dụng phương pháp uốn khóa ẩm sâu độc quyền. Bằng cách sử dụng dưỡng chất keratin thủy phân liên kết trực tiếp vào biểu bì tóc trước khi chạy nhiệt, sợi tóc được bảo vệ tối đa khỏi tác động của nhiệt độ.",
      "Hệ thống máy uốn hơi nước hiện đại giúp kiểm soát lượng nhiệt vừa đủ để định hình sóng mà không làm mất đi độ ẩm tự nhiên của tóc. Nhờ vậy, mái tóc sau khi uốn xong vẫn giữ nguyên độ nảy hạt, độ đàn hồi tự nhiên và sờ vào mềm mại như nhung.",
      "Stylist của chúng tôi cũng sẽ hướng dẫn bạn các bước chăm sóc vô cùng đơn giản tại nhà: chỉ cần dùng tay quấn nhẹ lọn sóng khi sấy khô là bạn đã có ngay phom tóc chuẩn tiệm mà không cần dùng lô cuốn phức tạp."
    ]
  },
  {
    slug: "cham-soc-toc-mua-nong",
    title: "Chăm sóc tóc mùa nóng",
    date: "10/02/2026",
    tag: "Chăm sóc tóc",
    desc: "Thời tiết nóng có thể khiến tóc khô, dễ gãy và nhanh phai màu. Một số bước đơn giản như chống UV cho tóc, dưỡng ẩm thường xuyên và chọn dầu gội phù hợp sẽ giúp mái tóc luôn mềm mượt.",
    image: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80",
    content: [
      "Thời tiết nắng nóng gay gắt và tia cực tím (UV) cao vào mùa hè là những tác nhân hàng đầu tàn phá cấu trúc sợi tóc. Các tia bức xạ không chỉ làm xỉn màu nhuộm thời trang nhanh chóng mà còn làm khô kiệt lớp lipid bảo vệ da đầu, khiến tóc trở nên xơ xác, chẻ ngọn và dễ gãy rụng hơn bao giờ hết.",
      "Để lưu giữ mái tóc óng ả suốt cả mùa hè, việc thiết lập một quy trình chăm sóc chuyên biệt là cực kỳ cần thiết. Đầu tiên, hãy bảo vệ tóc vật lý bằng cách đội mũ rộng vành và sử dụng các sản phẩm xịt dưỡng tóc có màng lọc UV chuyên dụng trước khi tiếp xúc trực tiếp với ánh nắng mặt trời.",
      "Thứ hai, hãy chú ý tăng cường độ ẩm cho tóc bằng cách đắp mặt nạ ủ tóc sâu (Hair Masque) ít nhất 1-2 lần mỗi tuần. Đồng thời gội đầu bằng nước mát hoặc nước ấm nhẹ thay vì nước nóng, nhằm tránh kích thích tuyến bã nhờn hoạt động quá mức gây bết dính da đầu.",
      "Cuối cùng, hãy ưu tiên các dòng dầu gội thảo dược dịu nhẹ, không chứa hoạt chất tẩy rửa mạnh như sulfate để da đầu luôn cân bằng độ pH. Đến với Dương Chi Salon định kỳ để làm các liệu trình detox thải độc chì da đầu và phục hồi chuyên sâu cũng là cách hoàn hảo để mái tóc luôn sẵn sàng tỏa sáng."
    ]
  }
];
