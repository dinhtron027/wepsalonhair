import { User } from "./User";

export class AuthSession {
  private readonly _token: string;
  private readonly _user: User;

  constructor(token: string, user: User) {
    this._token = token;
    this._user = user;
  }

  public get token(): string {
    return this._token;
  }

  public get user(): User {
    return this._user;
  }
}
