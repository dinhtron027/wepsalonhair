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

export const useAuth = create<AuthState>((set, get) => ({
  user: initialUser,
  token: initialToken,
  isLoading: false,

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

  logout: () => {
    authService.logout();
    set({ user: null, token: null });
  },

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

  isAdmin: () => get().hasRole("admin"),
  isStaff: () => get().hasRole("staff"),
  isCustomer: () => get().hasRole("customer"),
}));
