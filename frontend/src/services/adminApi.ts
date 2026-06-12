import api, { extractApiData } from "./api";

export type UserRole = "admin" | "staff" | "customer";
export type BookingStatus =
  | "pending"
  | "confirmed"
  | "in_service"
  | "completed"
  | "cancelled";

export type ServicePricingRule = {
  _id?: string;
  label: string;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  discountPercent: number;
  isActive: boolean;
};

export type ServiceEntity = {
  _id: string;
  name: string;
  description: string;
  category: string;
  durationMinutes: number;
  price: number;
  discount?: number;
  image?: string;
  addons?: Array<{
    _id?: string;
    name: string;
    price: number;
    description?: string;
  }>;
  pricingRules?: ServicePricingRule[];
};

export type ProductEntity = {
  _id: string;
  name: string;
  description: string;
  category: string;
  image?: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  isActive: boolean;
};

export type BookingEntity = {
  _id: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: UserRole;
  } | null;
  customerName: string;
  phone: string;
  email: string;
  serviceId:
    | string
    | {
        _id: string;
        name: string;
        category: string;
        price: number;
        durationMinutes?: number;
      };
  serviceName: string;
  stylist: string;
  date: string;
  time: string;
  status: BookingStatus;
  note: string;
  hairColorUsed?: string;
  totalPrice: number;
  baseServicePrice?: number;
  serviceDiscountPercent?: number;
  pricingRuleLabel?: string;
  createdAt: string;
  updatedAt: string;
};

export type OrderEntity = {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: UserRole;
  };
  products: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  totalPrice: number;
  status: string;
  payment: {
    provider: "cash" | "momo" | "vnpay";
    status: string;
    checkoutUrl?: string;
  };
  createdAt: string;
  note?: string;
};

export type CustomerHistory = {
  bookingId: string;
  date: string;
  time: string;
  status: BookingStatus;
  serviceName: string;
  stylist: string;
  hairColorUsed: string;
  totalPrice: number;
  note: string;
};

export type CustomerEntity = {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalBookings: number;
  totalSpent: number;
  lastVisit: string | null;
  stylists: string[];
  hairColors: string[];
  history: CustomerHistory[];
};

export type InventoryTransactionEntity = {
  _id: string;
  productId: {
    _id: string;
    name: string;
    category: string;
  };
  type: "import" | "export";
  quantity: number;
  previousStock: number;
  newStock: number;
  note: string;
  createdBy?: {
    _id: string;
    name: string;
    role: UserRole;
  } | null;
  createdAt: string;
};

export type InventoryOverview = {
  products: ProductEntity[];
  lowStockProducts: ProductEntity[];
  transactions: InventoryTransactionEntity[];
  lowStockCount: number;
};

export type RevenueStats = {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalBookings: number;
  totalServices: number;
  totalProducts: number;
  totalOrdersInSystem: number;
  monthlyRevenue: Array<{
    year: number;
    month: number;
    revenue: number;
    orders: number;
  }>;
  bookingStatusSummary: Array<{
    status: BookingStatus;
    total: number;
  }>;
};

export const queryKeys = {
  publicServices: ["services"] as const,
  publicProducts: ["products"] as const,
  bookingSlots: ["booking-slots"] as const,
  adminBookings: ["admin", "bookings"] as const,
  adminServices: ["admin", "services"] as const,
  adminProducts: ["admin", "products"] as const,
  adminOrders: ["admin", "orders"] as const,
  adminCustomers: ["admin", "customers"] as const,
  adminInventory: ["admin", "inventory"] as const,
  adminStats: ["admin", "stats"] as const,
};

const asArray = <T>(payload: unknown): T[] => (Array.isArray(payload) ? (payload as T[]) : []);

export const fetchPublicServices = async () => {
  const response = await api.get("/api/services");
  return asArray<ServiceEntity>(extractApiData<unknown>(response));
};

export const fetchPublicProducts = async () => {
  const response = await api.get("/api/products");
  return asArray<ProductEntity>(extractApiData<unknown>(response));
};

export const fetchAdminBookings = async () => {
  const response = await api.get("/api/admin/bookings");
  return asArray<BookingEntity>(extractApiData<unknown>(response));
};

export const fetchBookedSlots = async (date: string) => {
  if (!date) {
    return [];
  }

  const response = await api.get("/api/bookings/slots", {
    params: { date },
  });
  return asArray<string>(extractApiData<unknown>(response)).filter(
    (slot): slot is string => typeof slot === "string"
  );
};

export const createBookingFromAdmin = async (payload: {
  customerName: string;
  phone: string;
  email?: string;
  serviceId: string;
  date: string;
  time: string;
  note?: string;
}) => {
  const response = await api.post("/api/bookings", payload);
  return extractApiData<BookingEntity>(response);
};

export const updateAdminBooking = async (
  bookingId: string,
  payload: {
    status: BookingStatus;
    stylist?: string;
    hairColorUsed?: string;
    note?: string;
  }
) => {
  const response = await api.patch(`/api/admin/bookings/${bookingId}`, payload);
  return extractApiData<BookingEntity>(response);
};

export const fetchAdminServices = async () => {
  const response = await api.get("/api/admin/services");
  return asArray<ServiceEntity>(extractApiData<unknown>(response));
};

export const createAdminService = async (payload: Omit<ServiceEntity, "_id">) => {
  const response = await api.post("/api/admin/services", payload);
  return extractApiData<ServiceEntity>(response);
};

export const updateAdminService = async (
  serviceId: string,
  payload: Partial<Omit<ServiceEntity, "_id">>
) => {
  const response = await api.put(`/api/admin/services/${serviceId}`, payload);
  return extractApiData<ServiceEntity>(response);
};

export const deleteAdminService = async (serviceId: string) => {
  const response = await api.delete(`/api/admin/services/${serviceId}`);
  return extractApiData<ServiceEntity>(response);
};

export const fetchAdminProducts = async () => {
  const response = await api.get("/api/admin/products");
  return asArray<ProductEntity>(extractApiData<unknown>(response));
};

export const createAdminProduct = async (payload: Omit<ProductEntity, "_id">) => {
  const response = await api.post("/api/admin/products", payload);
  return extractApiData<ProductEntity>(response);
};

export const updateAdminProduct = async (
  productId: string,
  payload: Partial<Omit<ProductEntity, "_id">>
) => {
  const response = await api.put(`/api/admin/products/${productId}`, payload);
  return extractApiData<ProductEntity>(response);
};

export const deleteAdminProduct = async (productId: string) => {
  const response = await api.delete(`/api/admin/products/${productId}`);
  return extractApiData<ProductEntity>(response);
};

export const fetchAdminOrders = async () => {
  const response = await api.get("/api/admin/orders");
  return asArray<OrderEntity>(extractApiData<unknown>(response));
};

export const fetchAdminCustomers = async () => {
  const response = await api.get("/api/admin/customers");
  return asArray<CustomerEntity>(extractApiData<unknown>(response));
};

export const fetchInventoryOverview = async () => {
  const response = await api.get("/api/admin/inventory");
  return extractApiData<InventoryOverview>(response);
};

export const adjustInventory = async (payload: {
  productId: string;
  type: "import" | "export";
  quantity: number;
  note?: string;
}) => {
  const response = await api.post("/api/admin/inventory/adjust", payload);
  return extractApiData<{
    product: ProductEntity;
    transaction: InventoryTransactionEntity;
    lowStock: boolean;
  }>(response);
};

export const fetchRevenueStats = async () => {
  const response = await api.get("/api/admin/stats/revenue");
  return extractApiData<RevenueStats>(response);
};
