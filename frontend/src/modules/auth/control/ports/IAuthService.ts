import type { AuthSession } from "../../entity/AuthSession";
import type { User } from "../../entity/User";

export type LoginCredentials = {
  identifier: string;
  password: string;
};

export interface IAuthService {
  login(credentials: LoginCredentials): Promise<AuthSession>;
  loginWithGoogle(idToken: string): Promise<AuthSession>;
  loginWithFacebook(accessToken: string): Promise<AuthSession>;
  logout(): void;
  getCurrentUser(): User | null;
  getToken(): string | null;
}
