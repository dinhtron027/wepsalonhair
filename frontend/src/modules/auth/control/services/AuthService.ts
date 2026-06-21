import type { AxiosInstance } from "axios";
import { BaseApiService } from "../../../../shared/control/api/BaseApiService";
import type { IStoragePort } from "../../../../shared/control/storage/IStoragePort";
import { AuthSession } from "../../entity/AuthSession";
import { User, type UserDTO } from "../../entity/User";
import type { IAuthService, LoginCredentials, RegisterPayload } from "../ports/IAuthService";

type LoginResponse = {
  token: string;
  user: UserDTO;
};

type TokenPayload = {
  sub?: string;
  role?: UserDTO["role"];
  exp?: number;
};

export class AuthService extends BaseApiService implements IAuthService {
  private readonly tokenKey = "token";
  private readonly userKey = "salon_user";

  constructor(http: AxiosInstance, private readonly storage: IStoragePort) {
    super(http);
  }

  public async register(payload: RegisterPayload): Promise<AuthSession> {
    const response = await this.post<LoginResponse, RegisterPayload>(
      "/api/auth/register",
      payload
    );

    const user = User.fromDTO(response.user);
    const session = new AuthSession(response.token, user);
    this.persistSession(session);
    return session;
  }

  public async login(credentials: LoginCredentials): Promise<AuthSession> {
    const payload = await this.post<LoginResponse, LoginCredentials>(
      "/api/auth/login",
      credentials
    );

    const user = User.fromDTO(payload.user);
    const session = new AuthSession(payload.token, user);
    this.persistSession(session);

    return session;
  }

  public async loginWithGoogle(idToken: string): Promise<AuthSession> {
    const payload = await this.post<LoginResponse, { idToken: string }>(
      "/api/auth/google",
      { idToken }
    );

    const user = User.fromDTO(payload.user);
    const session = new AuthSession(payload.token, user);
    this.persistSession(session);
    return session;
  }

  public async loginWithFacebook(accessToken: string): Promise<AuthSession> {
    const payload = await this.post<LoginResponse, { accessToken: string }>(
      "/api/auth/facebook",
      { accessToken }
    );

    const user = User.fromDTO(payload.user);
    const session = new AuthSession(payload.token, user);
    this.persistSession(session);
    return session;
  }

  public logout(): void {
    this.storage.remove(this.tokenKey);
    this.storage.remove(this.userKey);
  }

  public getCurrentUser(): User | null {
    const value = this.storage.get(this.userKey);
    if (value) {
      try {
        return User.fromDTO(JSON.parse(value) as UserDTO);
      } catch {
        this.storage.remove(this.userKey);
      }
    }

    const token = this.getToken();
    if (!token) {
      return null;
    }

    const userFromToken = this.buildUserFromToken(token);
    if (!userFromToken) {
      return null;
    }

    this.storage.set(this.userKey, JSON.stringify(userFromToken.toDTO()));
    return userFromToken;
  }

  public getToken(): string | null {
    const token = this.storage.get(this.tokenKey);
    if (!token) {
      return null;
    }

    if (this.isTokenExpired(token)) {
      this.logout();
      return null;
    }

    return token;
  }

  private persistSession(session: AuthSession): void {
    this.storage.set(this.tokenKey, session.token);
    this.storage.set(this.userKey, JSON.stringify(session.user.toDTO()));
  }

  private decodeJwtPayload(token: string): TokenPayload | null {
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
  }

  private isTokenExpired(token: string): boolean {
    const payload = this.decodeJwtPayload(token);
    if (!payload?.exp) {
      return false;
    }

    return payload.exp * 1000 <= Date.now();
  }

  private buildUserFromToken(token: string): User | null {
    const payload = this.decodeJwtPayload(token);
    if (!payload?.sub || !payload?.role) {
      return null;
    }

    return User.fromDTO({
      id: payload.sub,
      name: "",
      email: "",
      role: payload.role,
    });
  }
}
