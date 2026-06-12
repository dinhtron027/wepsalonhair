import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from "@react-oauth/google";
import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";
import { ReactFacebookLoginInfo } from "react-facebook-login";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import { useAuthController } from "../../control/hooks/useAuthController";
import SectionTitle from "../../../../components/SectionTitle";
import AnimatedContainer from "../../../../components/AnimatedContainer";

// In a real app, these should come from env variables
const GOOGLE_CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID || "PASTE_YOUR_GOOGLE_CLIENT_ID_HERE").trim();
const FACEBOOK_APP_ID = (import.meta.env.VITE_FACEBOOK_APP_ID || "PASTE_YOUR_FACEBOOK_APP_ID_HERE").trim();

const LoginPage = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { isLoading, submitLogin, submitGoogleLogin, submitFacebookLogin } = useAuthController();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!identifier || !password) {
      toast.error("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    
    try {
      await submitLogin({ identifier, password });
    } catch {
      toast.error("Sai tài khoản hoặc mật khẩu.");
    }
  };

  const onGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      await submitGoogleLogin(credentialResponse.credential);
    }
  };

  const onGoogleError = () => {
    toast.error("Không thể kết nối Google");
  };

  const onFacebookCallback = async (response: ReactFacebookLoginInfo) => {
    if (response.accessToken) {
      await submitFacebookLogin(response.accessToken);
    } else {
      toast.error("Không thể kết nối Facebook");
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="mx-auto max-w-md px-4 py-20">
        <AnimatedContainer className="space-y-6">
          <SectionTitle
            eyebrow="Khởi đầu"
            title="Đăng Nhập"
            description="Chào mừng bạn trở lại với không gian thư giãn của Dương Chí."
          />
          
          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-3xl border border-rose-100 bg-white/80 p-8 shadow-xl shadow-rose-100/50 backdrop-blur-lg"
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Số điện thoại hoặc Email
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="Nhập số điện thoại/email"
                className="w-full rounded-xl border border-rose-100 bg-rose-50/30 p-3 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Nhập mật khẩu"
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

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-rose-500 transition-colors">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-rose-200 text-rose-500 focus:ring-rose-200 accent-rose-500"
                />
                Duy trì đăng nhập
              </label>
              <Link to="/forgot-password" className="font-medium text-rose-500 hover:text-rose-600 transition-colors">
                Quên mật khẩu?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? <LoadingSpinner size="sm" className="text-white" /> : null}
              {isLoading ? "Đang xử lý..." : "Đăng nhập"}
            </button>
            
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-rose-100"></div>
              <span className="flex-shrink-0 px-4 text-xs tracking-wider text-slate-400 uppercase">Hoặc đăng nhập với</span>
              <div className="flex-grow border-t border-rose-100"></div>
            </div>

            <div className="grid gap-3">
              <div className="flex justify-center w-full [&>div]:w-full [&>div]:flex [&>div]:justify-center">
                <GoogleLogin
                  onSuccess={onGoogleSuccess}
                  onError={onGoogleError}
                  theme="outline"
                  shape="pill"
                  width="100%"
                  text="signin_with"
                />
              </div>

              <FacebookLogin
                appId={FACEBOOK_APP_ID}
                autoLoad={false}
                fields="name,email,picture"
                callback={onFacebookCallback}
                render={renderProps => (
                  <button
                    type="button"
                    onClick={renderProps.onClick}
                    disabled={isLoading}
                    className="flex w-full items-center justify-center gap-3 rounded-full border border-[#1877F2]/20 bg-[#1877F2]/5 py-2.5 text-sm font-semibold text-[#1877F2] transition-colors hover:bg-[#1877F2]/10"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                    Đăng nhập với Facebook
                  </button>
                )}
              />
            </div>
            
            <p className="text-center text-sm text-slate-600 mt-6">
              Bạn chưa có tài khoản?{" "}
              <Link to="/register" className="font-semibold text-rose-500 hover:text-rose-600">
                Đăng ký ngay
              </Link>
            </p>
          </form>
        </AnimatedContainer>
      </div>
    </GoogleOAuthProvider>
  );
};

export default LoginPage;
