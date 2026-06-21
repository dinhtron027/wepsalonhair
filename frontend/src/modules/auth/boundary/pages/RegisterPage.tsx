import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import { useAuthController } from "../../control/hooks/useAuthController";
import SectionTitle from "../../../../components/SectionTitle";
import AnimatedContainer from "../../../../components/AnimatedContainer";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { isLoading, submitRegister } = useAuthController();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!name.trim()) {
      toast.error("Vui lòng nhập họ và tên.");
      return;
    }
    
    if (!email.trim() || !EMAIL_REGEX.test(email)) {
      toast.error("Vui lòng nhập email đúng định dạng.");
      return;
    }
    
    if (password.length < 6) {
      toast.error("Mật khẩu phải chứa ít nhất 6 ký tự.");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        confirmPassword,
        phone: phone.trim() || undefined,
      };
      
      await submitRegister(payload);
    } catch {
      // toast.error đã được xử lý trong hook controller
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <AnimatedContainer className="space-y-6">
        <SectionTitle
          eyebrow="Khởi đầu"
          title="Đăng Ký Tài Khoản"
          description="Đăng ký tài khoản để bắt đầu trải nghiệm dịch vụ và đặt lịch tại Dương Chi."
        />
        
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-3xl border border-rose-100 bg-white/80 p-8 shadow-xl shadow-rose-100/50 backdrop-blur-lg"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Họ và tên <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nhập họ và tên của bạn"
              className="w-full rounded-xl border border-rose-100 bg-rose-50/30 p-3 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-50"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="example@email.com"
              className="w-full rounded-xl border border-rose-100 bg-rose-50/30 p-3 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-50"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Số điện thoại <span className="text-slate-400 text-xs font-normal">(Tùy chọn)</span>
            </label>
            <input
              type="text"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Nhập số điện thoại"
              className="w-full rounded-xl border border-rose-100 bg-rose-50/30 p-3 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-50"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Mật khẩu <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                className="w-full rounded-xl border border-rose-100 bg-rose-50/30 p-3 pr-10 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Xác nhận mật khẩu <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Nhập lại mật khẩu"
                className="w-full rounded-xl border border-rose-100 bg-rose-50/30 p-3 pr-10 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-50"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? <LoadingSpinner size="sm" className="text-white" /> : null}
            {isLoading ? "Đang xử lý..." : "Đăng ký ngay"}
          </button>
          
          <p className="text-center text-sm text-slate-600 mt-6">
            Đã có tài khoản?{" "}
            <Link to="/login" className="font-semibold text-rose-500 hover:underline">
              Đăng nhập ngay
            </Link>
          </p>
        </form>
      </AnimatedContainer>
    </div>
  );
};

export default RegisterPage;
