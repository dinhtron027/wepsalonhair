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
  isActive: form.isActive,
});

const ProductsPage = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ProductForm>(defaultForm);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

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
      image: product.image || "",
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

        <form onSubmit={handleSubmit} className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <input
            required
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            placeholder="Tên sản phẩm"
          />
          <input
            value={form.category}
            onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            placeholder="Danh mục (dầu gội, sáp,...)"
          />
          <input
            required
            type="number"
            min={0}
            value={form.price}
            onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            placeholder="Giá bán"
          />
          <input
            required
            type="number"
            min={0}
            value={form.stock}
            onChange={(event) => setForm((prev) => ({ ...prev, stock: event.target.value }))}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            placeholder="Số lượng tồn"
          />
          <input
            type="number"
            min={0}
            value={form.lowStockThreshold}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, lowStockThreshold: event.target.value }))
            }
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            placeholder="Ngưỡng cảnh báo thấp"
          />
          <input
            value={form.image}
            onChange={(event) => setForm((prev) => ({ ...prev, image: event.target.value }))}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            placeholder="Link ảnh"
          />
          <label className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))}
            />
            Đang kinh doanh
          </label>
          <div />
          <textarea
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm md:col-span-2"
            rows={3}
            placeholder="Mô tả sản phẩm"
          />
          <div className="flex gap-2 md:col-span-2 lg:col-span-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-70"
            >
              {isSubmitting ? "Đang xử lý..." : isEditing ? "Lưu cập nhật" : "Tạo sản phẩm"}
            </button>
            {isEditing ? (
              <button
                type="button"
                onClick={() => {
                  setEditingProductId(null);
                  setForm(defaultForm);
                }}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
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
          <div className="mt-4 overflow-x-auto">
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
                        <p className="font-semibold text-slate-800">{product.name}</p>
                        <p className="text-xs text-slate-500">{product.category || "Không phân loại"}</p>
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
