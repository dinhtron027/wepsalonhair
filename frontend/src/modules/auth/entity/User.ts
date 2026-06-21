export type UserRole = "admin" | "staff" | "customer";

export type UserDTO = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
};

export class User {
  private readonly _id: string;
  private readonly _name: string;
  private readonly _email: string;
  private readonly _phone: string;
  private readonly _role: UserRole;
  private readonly _avatar: string;

  private constructor(dto: UserDTO) {
    this._id = dto.id;
    this._name = dto.name;
    this._email = dto.email;
    this._phone = dto.phone || "";
    this._role = dto.role;
    this._avatar = dto.avatar || "";
  }

  public static fromDTO(dto: UserDTO): User {
    return new User(dto);
  }

  public get id(): string {
    return this._id;
  }

  public get name(): string {
    return this._name;
  }

  public get email(): string {
    return this._email;
  }

  public get phone(): string {
    return this._phone;
  }

  public get role(): UserRole {
    return this._role;
  }

  public get avatar(): string {
    return this._avatar;
  }

  public isAdmin(): boolean {
    return this._role === "admin";
  }

  public isStaff(): boolean {
    return this._role === "staff";
  }

  public toDTO(): UserDTO {
    return {
      id: this._id,
      name: this._name,
      email: this._email,
      phone: this._phone || undefined,
      role: this._role,
      avatar: this._avatar || undefined,
    };
  }
}
