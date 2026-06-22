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

        <div className="mt-4 overflow-x-auto">
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
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold">Lịch sử nhập/xuất kho</h3>
        <div className="mt-4 overflow-x-auto">
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

          {(data?.transactions || []).length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
              Chưa có giao dịch kho nào.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
};

export default InventoryPage;
