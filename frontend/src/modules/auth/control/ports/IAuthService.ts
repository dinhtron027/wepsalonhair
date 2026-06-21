import type { AuthSession } from "../../entity/AuthSession";
import type { User } from "../../entity/User";

export type LoginCredentials = {
  identifier: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  phone?: string;
};

export interface IAuthService {
  register(payload: RegisterPayload): Promise<AuthSession>;
  login(credentials: LoginCredentials): Promise<AuthSession>;
  loginWithGoogle(idToken: string): Promise<AuthSession>;
  loginWithFacebook(accessToken: string): Promise<AuthSession>;
  logout(): void;
  getCurrentUser(): User | null;
  getToken(): string | null;
}
