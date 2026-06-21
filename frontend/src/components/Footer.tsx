import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail, Phone } from "lucide-react";
import { toast } from "react-hot-toast";

const Tiktok = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

const Footer = () => {
  return (
    <footer className="mt-20 border-t border-rose-100 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 py-12 grid gap-10 md:grid-cols-4">
        {/* Brand */}
        <div className="md:col-span-2">
          <h3 className="text-xl font-semibold text-rose-500">Salon Dương Chi</h3>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed max-w-sm">
            Nơi suối tóc kể câu chuyện của riêng bạn. Tôn vinh vẻ đẹp thanh lịch và trải nghiệm
            thư giãn đẳng cấp theo phong cách Á Đông.
          </p>
          <p className="mt-4 text-sm text-slate-600">
            📍 9 Hùng Vương, Thị trấn Lộc Ninh, Bình Phước 832500, Việt Nam
          </p>
          <a
            href="https://maps.app.goo.gl/98SsxvFFi85U2qKCA"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex text-xs text-rose-500 hover:text-rose-600"
          >
            Xem bản đồ →
          </a>
          <p className="mt-2 text-sm text-slate-600">⏰ Giờ mở cửa: 9:00 – 21:00 hằng ngày</p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-sm font-semibold tracking-wide text-slate-700 uppercase">
            Khám Phá
          </h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/services" className="text-slate-600 hover:text-rose-500 transition">
                Dịch Vụ
              </Link>
            </li>
            <li>
              <Link to="/products" className="text-slate-600 hover:text-rose-500 transition">
                Sản Phẩm
              </Link>
            </li>
            <li>
              <Link to="/pricing" className="text-slate-600 hover:text-rose-500 transition">
                Bảng Giá
              </Link>
            </li>
            <li>
              <Link to="/gallery" className="text-slate-600 hover:text-rose-500 transition">
                Bộ Sưu Tập
              </Link>
            </li>
            <li>
              <Link to="/about" className="text-slate-600 hover:text-rose-500 transition">
                Về Chúng Tôi
              </Link>
            </li>
            <li>
              <Link to="/news" className="text-slate-600 hover:text-rose-500 transition">
                Blog
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-sm font-semibold tracking-wide text-slate-700 uppercase">
            Kết Nối
          </h4>
          <div className="mt-3 flex gap-3 text-rose-500">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-rose-600 transition">
              <Instagram size={20} />
            </a>
            <a href="https://www.facebook.com/share/1GNmbu1i79/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-rose-600 transition">
              <Facebook size={20} />
            </a>
            <a href="https://www.tiktok.com/@salonduongchi?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="hover:text-rose-600 transition">
              <Tiktok size={20} />
            </a>
            <button
              onClick={() => {
                navigator.clipboard.writeText("phuongchihbl96@gmail.com");
                toast.success("Đã sao chép email: phuongchihbl96@gmail.com");
              }}
              aria-label="Email"
              className="hover:text-rose-600 transition"
            >
              <Mail size={20} />
            </button>
            <a href="tel:0988046664" aria-label="Điện thoại" className="hover:text-rose-600 transition">
              <Phone size={20} />
            </a>
          </div>
          <div className="mt-4">
            <Link
              to="/booking"
              className="inline-block rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-rose-200 transition hover:bg-rose-600"
            >
              Đặt Lịch Ngay
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-rose-100 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Salon Dương Chi. Tôn vinh vẻ đẹp độc bản.
      </div>
    </footer>
  );
};

export default Footer;
