import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/LoadingSpinner";
import { adjustInventory, fetchInventoryOverview, queryKeys } from "../../services/adminApi";
import { getApiErrorMessage } from "../../services/api";

type InventoryForm = {
  productId: string;
  type: "import" | "export";
  quantity: string;
  note: string;
};

const defaultForm: InventoryForm = {
  productId: "",
  type: "import",
  quantity: "1",
  note: "",
};

const InventoryPage = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<InventoryForm>(defaultForm);

  const { data, isLoading } = useQuery({
    queryKey: [...queryKeys.adminInventory],
    queryFn: fetchInventoryOverview,
  });

  useEffect(() => {
    if (!data?.products?.length) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      productId: prev.productId || data.products[0]._id,
    }));
  }, [data?.products]);

  const adjustMutation = useMutation({
    mutationFn: adjustInventory,
    onSuccess: () => {
      toast.success("Thành công: Cập nhật tồn kho");
      setForm((prev) => ({ ...prev, quantity: "1", note: "" }));
      queryClient.invalidateQueries({ queryKey: [...queryKeys.adminInventory] });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.adminProducts] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Thất bại: Không thể cập nhật tồn kho"));
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    adjustMutation.mutate({
      productId: form.productId,
      type: form.type,
      quantity: Number(form.quantity || 0),
      note: form.note,
    });
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10">
        <LoadingSpinner size="lg" label="Đang tải tồn kho..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold">Nhập/Xuất kho</h3>
        <p className="mt-1 text-sm text-slate-500">
          Quản lý tồn kho theo thời gian thực và cảnh báo sản phẩm sắp hết.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="productId" className="text-xs font-semibold text-slate-600">Sản phẩm <span className="text-rose-500">*</span></label>
              <select
                id="productId"
                value={form.productId}
                onChange={(event) => setForm((prev) => ({ ...prev, productId: event.target.value }))}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 bg-white"
              >
                {(data?.products || []).map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="type" className="text-xs font-semibold text-slate-600">Loại giao dịch <span className="text-rose-500">*</span></label>
              <select
                id="type"
                value={form.type}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, type: event.target.value as "import" | "export" }))
                }
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 bg-white"
              >
                <option value="import">Nhập kho</option>
                <option value="export">Xuất kho</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="quantity" className="text-xs font-semibold text-slate-600">Số lượng <span className="text-rose-500">*</span></label>
              <input
                id="quantity"
                type="number"
                min={1}
                value={form.quantity}
                onChange={(event) => setForm((prev) => ({ ...prev, quantity: event.target.value }))}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                placeholder="Số lượng"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="note" className="text-xs font-semibold text-slate-600">Ghi chú</label>
              <input
                id="note"
                value={form.note}
                onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                placeholder="Ghi chú điều chỉnh"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={adjustMutation.isPending}
              className="w-full sm:w-auto rounded-xl bg-cyan-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700 active:bg-cyan-800 transition-colors disabled:opacity-70 shadow-sm"
            >
              {adjustMutation.isPending ? "Đang cập nhật..." : "Xác nhận điều chỉnh"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Tồn kho sản phẩm</h3>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            Sắp hết: {data?.lowStockCount || 0}
          </span>
        </div>

        {/* Desktop Table View */}
        <div className="mt-4 hidden md:block overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-3 py-3 font-semibold whitespace-nowrap">Sản phẩm</th>
                <th className="px-3 py-3 font-semibold whitespace-nowrap">Danh mục</th>
                <th className="px-3 py-3 font-semibold whitespace-nowrap">Tồn hiện tại</th>
                <th className="px-3 py-3 font-semibold whitespace-nowrap">Ngưỡng cảnh báo</th>
              </tr>
            </thead>
            <tbody>
              {(data?.products || []).map((product) => {
                const isLowStock = product.stock <= (product.lowStockThreshold || 0);
                return (
                  <tr key={product._id} className="border-b border-slate-100">
                    <td className="px-3 py-3 font-semibold text-slate-800 whitespace-nowrap">{product.name}</td>
                    <td className="px-3 py-3 text-slate-700 whitespace-nowrap">{product.category || "-"}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          isLowStock
                            ? "bg-rose-100 text-rose-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-700 whitespace-nowrap">{product.lowStockThreshold}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="mt-4 block md:hidden space-y-3">
          {(data?.products || []).map((product) => {
            const isLowStock = product.stock <= (product.lowStockThreshold || 0);
            return (
              <div key={product._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-2 text-xs">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-semibold text-slate-850 text-sm">{product.name}</h4>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                    {product.category || "Không phân loại"}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Tồn hiện tại</span>
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 mt-0.5 text-xs font-bold ${
                        isLowStock
                          ? "bg-rose-100 text-rose-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {product.stock}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px]">Ngưỡng cảnh báo</span>
                    <span className="text-slate-800 font-semibold mt-0.5 block">{product.lowStockThreshold}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold">Lịch sử nhập/xuất kho</h3>
        {/* Desktop Table View */}
        <div className="mt-4 hidden md:block overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-3 py-3 font-semibold whitespace-nowrap">Thời gian</th>
                <th className="px-3 py-3 font-semibold whitespace-nowrap">Sản phẩm</th>
                <th className="px-3 py-3 font-semibold whitespace-nowrap">Loại</th>
                <th className="px-3 py-3 font-semibold whitespace-nowrap">Số lượng</th>
                <th className="px-3 py-3 font-semibold whitespace-nowrap">Tồn trước/sau</th>
                <th className="px-3 py-3 font-semibold whitespace-nowrap">Người thao tác</th>
              </tr>
            </thead>
            <tbody>
              {(data?.transactions || []).map((transaction) => (
                <tr key={transaction._id} className="border-b border-slate-100">
                  <td className="px-3 py-3 text-slate-700 whitespace-nowrap">
                    {new Date(transaction.createdAt).toLocaleString("vi-VN")}
                  </td>
                  <td className="px-3 py-3 text-slate-700 whitespace-nowrap">{transaction.productId?.name || "-"}</td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        transaction.type === "import"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {transaction.type === "import" ? "Nhập" : "Xuất"}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-slate-700 whitespace-nowrap">{transaction.quantity}</td>
                  <td className="px-3 py-3 text-slate-700 whitespace-nowrap">
                    {transaction.previousStock} → {transaction.newStock}
                  </td>
                  <td className="px-3 py-3 text-slate-700 whitespace-nowrap">{transaction.createdBy?.name || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="mt-4 block md:hidden space-y-3">
          {(data?.transactions || []).map((transaction) => (
            <div key={transaction._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-2 text-xs">
              <div className="flex justify-between items-start gap-2">
                <h4 className="font-semibold text-slate-850 text-sm">{transaction.productId?.name || "Sản phẩm đã bị xóa"}</h4>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    transaction.type === "import"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {transaction.type === "import" ? "Nhập" : "Xuất"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-slate-650">
                <div>
                  <span className="text-slate-400 block text-[10px]">Thời gian</span>
                  <span className="text-slate-800 font-medium block mt-0.5">
                    {new Date(transaction.createdAt).toLocaleString("vi-VN")}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Người thao tác</span>
                  <span className="text-slate-800 font-medium block mt-0.5">{transaction.createdBy?.name || "-"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Số lượng</span>
                  <span className="text-slate-850 font-bold block mt-0.5">{transaction.quantity}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Biến động tồn</span>
                  <span className="text-slate-800 font-medium block mt-0.5">
                    {transaction.previousStock} → {transaction.newStock}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {(data?.transactions || []).length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
            Chưa có giao dịch kho nào.
          </p>
        ) : null}
      </section>
    </div>
  );
};

export default InventoryPage;
