import { create } from "zustand";
import { authService } from "../../../../app/control/di/container";
import type { UserRole } from "../../entity/User";
import type { LoginCredentials, RegisterPayload } from "../ports/IAuthService";
export type { UserRole } from "../../entity/User";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
};

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  loginWithGoogle: (idToken: string) => Promise<AuthUser>;
  loginWithFacebook: (accessToken: string) => Promise<AuthUser>;
  logout: () => void;
  getCurrentUser: () => AuthUser | null;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  isAdmin: () => boolean;
  isStaff: () => boolean;
  isCustomer: () => boolean;
};

type TokenPayload = {
  sub?: string;
  role?: UserRole;
};

const toAuthUser = (user: ReturnType<typeof authService.getCurrentUser>): AuthUser | null => {
  if (!user) {
    return null;
  }

  const dto = user.toDTO();
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    phone: dto.phone,
    role: dto.role,
    avatar: dto.avatar,
  };
};

/**
 * Hàm giải mã Payload của JWT Token ở phía Client:
 * Cấu trúc JWT gồm 3 phần ngăn cách bởi dấu chấm: Header.Payload.Signature.
 * Hàm này lấy phần Payload (phần thứ 2), chuẩn hóa định dạng Base64URL,
 * dùng hàm atob() của trình duyệt để giải mã chuỗi Base64 sang chuỗi JSON,
 * sau đó dùng JSON.parse() để chuyển thành đối tượng JavaScript chứa userId (sub) và role.
 */
const decodeJwtPayload = (token: string): TokenPayload | null => {
  try {
    const [, base64Payload] = token.split(".");
    if (!base64Payload) {
      return null;
    }

    const normalized = base64Payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const decoded = atob(padded);
    return JSON.parse(decoded) as TokenPayload;
  } catch {
    return null;
  }
};

/**
 * Tái tạo nhanh thông tin cơ bản của User từ token khi vừa tải lại trang (F5)
 * giúp giao diện hiển thị ngay quyền hạn mà không cần chờ gọi API xác thực mạng.
 */
const buildUserFromToken = (token: string): AuthUser | null => {
  const payload = decodeJwtPayload(token);
  if (!payload?.sub || !payload?.role) {
    return null;
  }

  return {
    id: payload.sub,
    name: "",
    email: "",
    role: payload.role,
  };
};

const initialToken = authService.getToken();
const initialUser = toAuthUser(authService.getCurrentUser()) || (initialToken ? buildUserFromToken(initialToken) : null);

/**
 * useAuth: Zustand Store quản lý toàn bộ phiên đăng nhập (Authentication) và phân quyền (Authorization)
 */
export const useAuth = create<AuthState>((set, get) => ({
  user: initialUser,
  token: initialToken,
  isLoading: false,

  /**
   * Đăng ký tài khoản người dùng mới (Họ tên, Email, Số điện thoại, Mật khẩu).
   */
  register: async (payload) => {
    set({ isLoading: true });
    try {
      const session = await authService.register(payload);
      const dto = session.user.toDTO();
      const currentUser: AuthUser = {
        id: dto.id,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        role: dto.role,
        avatar: dto.avatar,
      };

      set({ user: currentUser, token: session.token, isLoading: false });
      return currentUser;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  /**
   * Đăng nhập bằng Email và Mật khẩu truyền thống.
   */
  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const session = await authService.login(credentials);
      const dto = session.user.toDTO();
      const currentUser: AuthUser = {
        id: dto.id,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        role: dto.role,
        avatar: dto.avatar,
      };

      set({ user: currentUser, token: session.token, isLoading: false });
      return currentUser;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  /**
   * Đăng nhập thông qua Google OAuth 2.0 (gửi idToken từ Google SDK về Backend xác minh).
   */
  loginWithGoogle: async (idToken) => {
    set({ isLoading: true });
    try {
      const session = await authService.loginWithGoogle(idToken);
      const dto = session.user.toDTO();
      const currentUser: AuthUser = {
        id: dto.id,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        role: dto.role,
        avatar: dto.avatar,
      };

      set({ user: currentUser, token: session.token, isLoading: false });
      return currentUser;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  /**
   * Đăng nhập thông qua Facebook SDK.
   */
  loginWithFacebook: async (accessToken) => {
    set({ isLoading: true });
    try {
      const session = await authService.loginWithFacebook(accessToken);
      const dto = session.user.toDTO();
      const currentUser: AuthUser = {
        id: dto.id,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        role: dto.role,
        avatar: dto.avatar,
      };

      set({ user: currentUser, token: session.token, isLoading: false });
      return currentUser;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  /**
   * Đăng xuất: Xóa token trong LocalStorage và reset state người dùng về null.
   */
  logout: () => {
    authService.logout();
    set({ user: null, token: null });
  },

  /**
   * Lấy thông tin người dùng hiện tại (nếu chưa có thì giải mã từ token lưu trong storage).
   */
  getCurrentUser: () => {
    const state = get();
    if (state.user) {
      return state.user;
    }

    if (!state.token) {
      return null;
    }

    return buildUserFromToken(state.token);
  },

  /**
   * Kiểm tra quyền hạn người dùng (Role-Based Access Control):
   * Nhận vào một role hoặc mảng roles, so sánh với vai trò hiện tại của người dùng.
   */
  hasRole: (roles) => {
    const user = get().getCurrentUser();
    if (!user || !user.role) {
      return false;
    }

    const userRole = String(user.role).toLowerCase();
    if (Array.isArray(roles)) {
      return roles.map((role) => String(role).toLowerCase()).includes(userRole);
    }

    return userRole === String(roles).toLowerCase();
  },

  // Các hàm tiện ích kiểm tra nhanh vai trò cụ thể
  isAdmin: () => get().hasRole("admin"),
  isStaff: () => get().hasRole("staff"),
  isCustomer: () => get().hasRole("customer"),
}));
