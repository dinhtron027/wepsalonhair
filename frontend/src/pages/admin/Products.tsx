import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/LoadingSpinner";
import {
  ProductEntity,
  createAdminProduct,
  deleteAdminProduct,
  fetchAdminProducts,
  queryKeys,
  updateAdminProduct,
  uploadImage,
} from "../../services/adminApi";
import { getApiErrorMessage } from "../../services/api";

type ProductForm = {
  name: string;
  category: string;
  description: string;
  price: string;
  stock: string;
  lowStockThreshold: string;
  image: string;
  isActive: boolean;
};

const defaultForm: ProductForm = {
  name: "",
  category: "",
  description: "",
  price: "",
  stock: "0",
  lowStockThreshold: "5",
  image: "",
  isActive: true,
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

const toPayload = (form: ProductForm) => ({
  name: form.name,
  category: form.category,
  description: form.description,
  price: Number(form.price || 0),
  stock: Number(form.stock || 0),
  lowStockThreshold: Number(form.lowStockThreshold || 0),
  image: form.image,
  imageUrl: form.image,
  isActive: form.isActive,
});

const ProductsPage = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ProductForm>(defaultForm);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước tệp vượt quá giới hạn (Tối đa 5MB)");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Chỉ chấp nhận ảnh định dạng JPG, PNG hoặc WEBP");
      return;
    }

    try {
      setIsUploadingImage(true);
      const res = await uploadImage(file, "products");
      setForm((prev) => ({ ...prev, image: res.imageUrl }));
      toast.success("Tải hình ảnh lên thành công!");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Không thể tải hình ảnh lên server"));
    } finally {
      setIsUploadingImage(false);
      event.target.value = "";
    }
  };

  const { data: products, isLoading } = useQuery({
    queryKey: [...queryKeys.adminProducts],
    queryFn: fetchAdminProducts,
  });

  const createMutation = useMutation({
    mutationFn: createAdminProduct,
    onSuccess: () => {
      toast.success("Thành công: Tạo sản phẩm");
      setForm(defaultForm);
      queryClient.invalidateQueries({ queryKey: [...queryKeys.adminProducts] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Thất bại: Không thể tạo sản phẩm"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { id: string; data: Partial<Omit<ProductEntity, "_id">> }) =>
      updateAdminProduct(payload.id, payload.data),
    onSuccess: () => {
      toast.success("Thành công: Cập nhật sản phẩm");
      setForm(defaultForm);
      setEditingProductId(null);
      queryClient.invalidateQueries({ queryKey: [...queryKeys.adminProducts] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Thất bại: Không thể cập nhật sản phẩm"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminProduct,
    onSuccess: () => {
      toast.success("Thành công: Xóa sản phẩm");
      queryClient.invalidateQueries({ queryKey: [...queryKeys.adminProducts] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Thất bại: Không thể xóa sản phẩm"));
    },
  });

  const sortedProducts = useMemo(
    () => [...(products || [])].sort((a, b) => a.name.localeCompare(b.name, "vi")),
    [products]
  );

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isEditing = Boolean(editingProductId);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const payload = toPayload(form);

    if (editingProductId) {
      updateMutation.mutate({ id: editingProductId, data: payload });
      return;
    }

    createMutation.mutate(payload);
  };

  const handleEdit = (product: ProductEntity) => {
    setEditingProductId(product._id);
    setForm({
      name: product.name,
      category: product.category || "",
      description: product.description || "",
      price: String(product.price || 0),
      stock: String(product.stock || 0),
      lowStockThreshold: String(product.lowStockThreshold || 0),
      image: product.imageUrl || product.image || "",
      isActive: product.isActive,
    });
  };

  const handleDelete = (product: ProductEntity) => {
    if (!window.confirm(`Xác nhận xóa sản phẩm "${product.name}"?`)) {
      return;
    }

    deleteMutation.mutate(product._id);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold">{isEditing ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}</h3>
        <p className="mt-1 text-sm text-slate-500">Quản lý danh mục sản phẩm và tồn kho bán lẻ.</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Cột trái: Thông tin sản phẩm */}
            <div className="space-y-6">
              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 space-y-4">
                <h4 className="font-semibold text-slate-700 text-sm border-b border-slate-200 pb-2">1. Thông tin sản phẩm</h4>
                
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="name" className="text-xs font-semibold text-slate-600">Tên sản phẩm <span className="text-rose-500">*</span></label>
                  <input
                    id="name"
                    required
                    value={form.name}
                    onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                    placeholder="Ví dụ: Dầu gội bưởi, Sáp vuốt tóc Clay"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="category" className="text-xs font-semibold text-slate-600">Danh mục <span className="text-slate-400">(Tùy chọn)</span></label>
                  <input
                    id="category"
                    value={form.category}
                    onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                    placeholder="Ví dụ: Dầu gội, Sáp vuốt tóc, Tinh dầu"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <span className="text-xs font-semibold text-slate-600">Ảnh sản phẩm</span>
                  
                  {/* Preview và file upload picker */}
                  <div className="flex items-center gap-4">
                    {form.image ? (
                      <div className="relative group w-20 h-20 flex-shrink-0">
                        <img
                          src={form.image}
                          alt="Xem trước ảnh sản phẩm"
                          className="w-20 h-20 rounded-xl object-cover border border-slate-200 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, image: "" }))}
                          className="absolute -top-1.5 -right-1.5 rounded-full bg-rose-550 text-white p-1 hover:bg-rose-600 transition-colors shadow-sm"
                          title="Xóa ảnh"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-slate-100 border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 text-[10px] font-semibold flex-shrink-0">
                        Chưa chọn ảnh
                      </div>
                    )}

                    <div className="flex-1 space-y-2">
                      <label
                        htmlFor="product-image-file-input"
                        className={`inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-sm active:bg-slate-100 transition-all ${isUploadingImage ? 'opacity-50 pointer-events-none' : ''}`}
                      >
                        {isUploadingImage ? 'Đang tải ảnh...' : form.image ? 'Thay đổi ảnh' : 'Tải ảnh từ thiết bị'}
                      </label>
                      <input
                        id="product-image-file-input"
                        type="file"
                        accept="image/*"
                        disabled={isUploadingImage}
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <p className="text-[10px] text-slate-400">Hỗ trợ JPG, PNG, WEBP. Tối đa 5MB.</p>
                    </div>
                  </div>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink mx-3 text-slate-400 text-[10px] uppercase font-bold tracking-wider">Hoặc nhập URL</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <input
                      id="image"
                      value={form.image}
                      onChange={(event) => setForm((prev) => ({ ...prev, image: event.target.value }))}
                      className="rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                      placeholder="Dán link ảnh thủ công"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="description" className="text-xs font-semibold text-slate-600">Mô tả sản phẩm</label>
                  <textarea
                    id="description"
                    value={form.description}
                    onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                    rows={3}
                    placeholder="Mô tả công dụng, cách dùng và thành phần sản phẩm..."
                  />
                </div>
              </div>
            </div>

            {/* Cột phải: Giá & Kho hàng */}
            <div className="space-y-6">
              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 space-y-4 h-full">
                <h4 className="font-semibold text-slate-700 text-sm border-b border-slate-200 pb-2">2. Giá & Kho hàng</h4>
                
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="price" className="text-xs font-semibold text-slate-600">Giá bán (VNĐ) <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <input
                      id="price"
                      required
                      type="number"
                      min={0}
                      value={form.price}
                      onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
                      className="w-full rounded-xl border border-slate-300 pl-3 pr-12 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                      placeholder="Ví dụ: 120000"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-medium text-slate-400">VNĐ</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="stock" className="text-xs font-semibold text-slate-600">Số lượng tồn kho <span className="text-rose-500">*</span></label>
                  <input
                    id="stock"
                    required
                    type="number"
                    min={0}
                    value={form.stock}
                    onChange={(event) => setForm((prev) => ({ ...prev, stock: event.target.value }))}
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                    placeholder="Ví dụ: 10"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="lowStockThreshold" className="text-xs font-semibold text-slate-600">Ngưỡng cảnh báo sắp hết hàng <span className="text-rose-500">*</span></label>
                  <input
                    id="lowStockThreshold"
                    required
                    type="number"
                    min={0}
                    value={form.lowStockThreshold}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, lowStockThreshold: event.target.value }))
                    }
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                    placeholder="Ví dụ: 5"
                  />
                  <span className="text-xs text-slate-400">Hệ thống sẽ cảnh báo khi số lượng tồn thấp hơn hoặc bằng mức này.</span>
                </div>

                <div className="flex items-center justify-between border-t border-slate-200/60 pt-4 mt-2">
                  <span className="text-xs font-semibold text-slate-600">Trạng thái bán hàng</span>
                  <label className="inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="relative w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                    <span className="ms-2 text-xs font-semibold text-slate-600">Đang kinh doanh</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Hộp nút Submit / Huỷ chỉnh sửa */}
          <div className="flex items-center gap-3 border-t border-slate-200 pt-5">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800 transition-colors px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-70 shadow-sm"
            >
              {isSubmitting ? "Đang xử lý..." : isEditing ? "Cập nhật sản phẩm" : "Tạo sản phẩm"}
            </button>
            {isEditing ? (
              <button
                type="button"
                onClick={() => {
                  setEditingProductId(null);
                  setForm(defaultForm);
                }}
                className="rounded-xl border border-slate-300 hover:bg-slate-50 active:bg-slate-100 transition-colors px-5 py-2.5 text-sm font-semibold text-slate-700"
              >
                Hủy chỉnh sửa
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold">Danh sách sản phẩm ({sortedProducts.length})</h3>

        {isLoading ? (
          <div className="mt-4">
            <LoadingSpinner label="Đang tải sản phẩm..." />
          </div>
        ) : (
          <div className="mt-4">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="px-2 py-2 font-semibold">Sản phẩm</th>
                    <th className="px-2 py-2 font-semibold">Giá</th>
                    <th className="px-2 py-2 font-semibold">Tồn kho</th>
                    <th className="px-2 py-2 font-semibold">Trạng thái</th>
                    <th className="px-2 py-2 font-semibold text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedProducts.map((product) => {
                    const isLowStock = product.stock <= (product.lowStockThreshold || 0);

                    return (
                      <tr key={product._id} className="border-b border-slate-100">
                        <td className="px-2 py-3">
                          <div className="flex items-center gap-3">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-400 font-semibold text-xs">
                                Ảnh
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-slate-800">{product.name}</p>
                              <p className="text-xs text-slate-500">{product.category || "Không phân loại"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-3 text-slate-700">{formatCurrency(product.price)}</td>
                        <td className="px-2 py-3">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-semibold ${
                              isLowStock
                                ? "bg-amber-100 text-amber-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {product.stock} ({isLowStock ? "Sắp hết" : "Ổn định"})
                          </span>
                        </td>
                        <td className="px-2 py-3 text-slate-700">
                          {product.isActive ? "Đang bán" : "Ngừng bán"}
                        </td>
                        <td className="px-2 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(product)}
                              className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDelete(product)}
                              disabled={deleteMutation.isPending}
                              className="rounded-lg border border-rose-300 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-70"
                            >
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="block md:hidden space-y-4">
              {sortedProducts.map((product) => {
                const isLowStock = product.stock <= (product.lowStockThreshold || 0);
                return (
                  <div key={product._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-start gap-3">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-slate-200"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-400 font-semibold text-xs border border-slate-200">
                          Không ảnh
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-semibold text-slate-800 text-sm line-clamp-1">{product.name}</h4>
                          <span className="inline-block rounded-lg bg-slate-200/60 px-2 py-0.5 text-[10px] font-semibold text-slate-700 flex-shrink-0">
                            {product.category || "Chưa phân loại"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">{product.description || "Không có mô tả."}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs border-t border-slate-150/70 pt-3">
                      <div>
                        <p className="text-slate-400">Giá bán</p>
                        <p className="font-semibold text-slate-700 mt-0.5">{formatCurrency(product.price)}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Tồn kho</p>
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold mt-0.5 ${
                            isLowStock
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {product.stock} ({isLowStock ? "Sắp hết" : "Ổn định"})
                        </span>
                      </div>
                      <div>
                        <p className="text-slate-400">Trạng thái</p>
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold mt-0.5 ${
                          product.isActive ? "bg-cyan-150 text-cyan-800" : "bg-slate-200 text-slate-600"
                        }`}>
                          {product.isActive ? "Đang bán" : "Ngừng bán"}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end border-t border-slate-150/70 pt-3">
                      <button
                        onClick={() => handleEdit(product)}
                        className="flex-1 text-center rounded-lg border border-slate-300 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 active:bg-slate-100"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        disabled={deleteMutation.isPending}
                        className="flex-1 text-center rounded-lg border border-rose-300 py-2 text-xs font-semibold text-rose-600 bg-white hover:bg-rose-50 active:bg-rose-100 disabled:opacity-70"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {sortedProducts.length === 0 ? (
              <p className="mt-4 rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                Chưa có sản phẩm nào.
              </p>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
};

export default ProductsPage;
