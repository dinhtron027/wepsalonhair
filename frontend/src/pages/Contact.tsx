import { Mail, MapPin, Phone, Instagram, Facebook } from "lucide-react";
import SectionTitle from "../components/SectionTitle";
import Button from "../components/Button";
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

const Contact = () => {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 space-y-12">
      <SectionTitle
        eyebrow="Liên hệ"
        title="Rất vui được đón bạn"
        description="Gửi lời nhắn cho concierge để đặt lịch, hợp tác hay truyền thông."
        align="left"
      />
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start">
        <div className="space-y-6">
          <div className="rounded-3xl border border-rose-100 bg-white/80 p-6 shadow-lg shadow-rose-100 backdrop-blur-lg">
            <h3 className="text-lg font-semibold text-slate-900">Ghé thăm</h3>
            <p className="mt-3 flex items-start gap-3 text-sm text-slate-700">
              <MapPin className="text-rose-500" size={18} />
              9 Hùng Vương, Thị trấn Lộc Ninh, Bình Phước 832500, Việt Nam
            </p>
            <p className="flex items-start gap-3 text-sm text-slate-700">
              <Phone className="text-rose-500" size={18} />
              <a href="tel:0988046664" className="hover:text-rose-500 transition">098 804 66 64</a>
            </p>
            <p className="flex items-start gap-3 text-sm text-slate-700">
              <Mail className="text-rose-500" size={18} />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText("phuongchihbl96@gmail.com");
                  toast.success("Đã sao chép email: phuongchihbl96@gmail.com");
                }}
                className="hover:text-rose-500 transition text-left"
              >
                phuongchihbl96@gmail.com
              </button>
            </p>
            <div className="mt-4 flex gap-3 text-rose-500">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-rose-600 transition">
                <Instagram size={18} />
              </a>
              <a href="https://www.facebook.com/share/1GNmbu1i79/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-rose-600 transition">
                <Facebook size={18} />
              </a>
              <a href="https://www.tiktok.com/@salonduongchi?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="hover:text-rose-600 transition">
                <Tiktok size={18} />
              </a>
            </div>
          </div>
          <div className="overflow-hidden rounded-3xl border border-rose-100 shadow-lg shadow-rose-100">
            <iframe
              title="Salon map"
              src="https://maps.google.com/maps?q=9%20H%C3%B9ng%20V%C6%B0%C6%A1ng%2C%20L%E1%BB%99c%20Ninh%2C%20B%C3%ACnh%20Ph%C6%B0%E1%BB%9Bc&t=&z=15&ie=UTF8&iwloc=&output=embed"
              className="h-80 w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
        <div className="rounded-3xl border border-rose-100 bg-white/80 p-6 shadow-lg shadow-rose-100 backdrop-blur-lg">
          <h3 className="text-lg font-semibold text-slate-900">Gửi tin nhắn</h3>
          <form className="mt-4 space-y-4">
            <input
              className="w-full rounded-2xl border border-rose-100 bg-white/80 px-4 py-3 text-sm text-slate-800 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-100"
              placeholder="Họ và tên"
              required
            />
            <input
              className="w-full rounded-2xl border border-rose-100 bg-white/80 px-4 py-3 text-sm text-slate-800 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-100"
              placeholder="Email"
              type="email"
              required
            />
            <textarea
              className="w-full rounded-2xl border border-rose-100 bg-white/80 px-4 py-3 text-sm text-slate-800 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-100 min-h-[140px]"
              placeholder="Bạn muốn salon Dương Chi hỗ trợ gì?"
              required
            />
            <Button variant="primary" fullWidth>
              Gửi tin
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
