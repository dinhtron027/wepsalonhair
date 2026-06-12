import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="mt-20 border-t border-rose-100 bg-white/70 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 py-12 grid gap-10 md:grid-cols-3">
        <div>
          <h3 className="text-xl font-semibold text-rose-500">Salon Dương Chí</h3>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            Nơi suối tóc kể câu chuyện của riêng bạn. Tôn vinh vẻ đẹp thanh lịch và trải nghiệm thư giãn đẳng cấp theo phong cách Á Đông.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold tracking-wide text-slate-700 uppercase">
            Điểm Trạm Dừng Chân
          </h4>
          <p className="mt-3 text-sm text-slate-600">
            9 Hùng Vương, Thị trấn Lộc Ninh, Bình Phước 832500, Việt Nam
          </p>
          <a
            href="https://maps.app.goo.gl/98SsxvFFi85U2qKCA"
            className="mt-2 inline-flex text-xs text-rose-500 hover:text-rose-600"
          >
            Xem bản đồ
          </a>
          <p className="mt-2 text-sm text-slate-600">Giờ mở cửa: 9:00 - 21:00 hằng ngày</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold tracking-wide text-slate-700 uppercase">
            Kết Nối Cùng Nhau
          </h4>
          <div className="mt-3 flex gap-3 text-rose-500">
            <Link to="/" aria-label="Instagram" className="hover:text-rose-600">
              <Instagram size={20} />
            </Link>
            <Link to="/" aria-label="Facebook" className="hover:text-rose-600">
              <Facebook size={20} />
            </Link>
            <a href="mailto:admin@salonduongchi.com" className="hover:text-rose-600">
              <Mail size={20} />
            </a>
            <a href="tel:0862391239" className="hover:text-rose-600">
              <Phone size={20} />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-rose-100 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Salon Dương Chí. Tôn vinh vẻ đẹp độc bản.
      </div>
    </footer>
  );
};

export default Footer;
