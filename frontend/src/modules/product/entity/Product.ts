export type ProductDTO = {
  _id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
  image?: string;
  stock?: number;
  lowStockThreshold?: number;
  isActive?: boolean;
};

export class Product {
  private readonly _id: string;
  private readonly _name: string;
  private readonly _price: number;
  private readonly _description: string;
  private readonly _category: string;
  private readonly _image: string;
  private readonly _stock: number;
  private readonly _lowStockThreshold: number;
  private readonly _isActive: boolean;

  private constructor(dto: ProductDTO) {
    this._id = dto._id;
    this._name = dto.name;
    this._price = dto.price;
    this._description = dto.description || "";
    this._category = dto.category || "";
    this._image = dto.image || "";
    this._stock = dto.stock ?? 0;
    this._lowStockThreshold = dto.lowStockThreshold ?? 0;
    this._isActive = dto.isActive ?? true;
  }

  public static fromDTO(dto: ProductDTO): Product {
    return new Product(dto);
  }

  public get id(): string {
    return this._id;
  }

  public get name(): string {
    return this._name;
  }

  public get price(): number {
    return this._price;
  }

  public get description(): string {
    return this._description;
  }

  public get category(): string {
    return this._category;
  }

  public get image(): string {
    return this._image;
  }

  public get stock(): number {
    return this._stock;
  }

  public get isActive(): boolean {
    return this._isActive;
  }

  public isLowStock(): boolean {
    return this._stock <= this._lowStockThreshold;
  }

  public toDTO(): ProductDTO {
    return {
      _id: this._id,
      name: this._name,
      price: this._price,
      description: this._description,
      category: this._category,
      image: this._image,
      stock: this._stock,
      lowStockThreshold: this._lowStockThreshold,
      isActive: this._isActive,
    };
  }
}
