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

        <form onSubmit={handleSubmit} className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <select
            value={form.productId}
            onChange={(event) => setForm((prev) => ({ ...prev, productId: event.target.value }))}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          >
            {(data?.products || []).map((product) => (
              <option key={product._id} value={product._id}>
                {product.name}
              </option>
            ))}
          </select>

          <select
            value={form.type}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, type: event.target.value as "import" | "export" }))
            }
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="import">Nhập kho</option>
            <option value="export">Xuất kho</option>
          </select>

          <input
            type="number"
            min={1}
            value={form.quantity}
            onChange={(event) => setForm((prev) => ({ ...prev, quantity: event.target.value }))}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            placeholder="Số lượng"
          />

          <input
            value={form.note}
            onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            placeholder="Ghi chú"
          />

          <button
            type="submit"
            disabled={adjustMutation.isPending}
            className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-70 lg:col-span-4"
          >
            {adjustMutation.isPending ? "Đang cập nhật..." : "Xác nhận"}
          </button>
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
                <th className="px-2 py-2 font-semibold">Sản phẩm</th>
                <th className="px-2 py-2 font-semibold">Danh mục</th>
                <th className="px-2 py-2 font-semibold">Tồn hiện tại</th>
                <th className="px-2 py-2 font-semibold">Ngưỡng cảnh báo</th>
              </tr>
            </thead>
            <tbody>
              {(data?.products || []).map((product) => {
                const isLowStock = product.stock <= (product.lowStockThreshold || 0);
                return (
                  <tr key={product._id} className="border-b border-slate-100">
                    <td className="px-2 py-3 font-semibold text-slate-800">{product.name}</td>
                    <td className="px-2 py-3 text-slate-700">{product.category || "-"}</td>
                    <td className="px-2 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          isLowStock
                            ? "bg-rose-100 text-rose-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-slate-700">{product.lowStockThreshold}</td>
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
                <th className="px-2 py-2 font-semibold">Thời gian</th>
                <th className="px-2 py-2 font-semibold">Sản phẩm</th>
                <th className="px-2 py-2 font-semibold">Loại</th>
                <th className="px-2 py-2 font-semibold">Số lượng</th>
                <th className="px-2 py-2 font-semibold">Tồn trước/sau</th>
                <th className="px-2 py-2 font-semibold">Người thao tác</th>
              </tr>
            </thead>
            <tbody>
              {(data?.transactions || []).map((transaction) => (
                <tr key={transaction._id} className="border-b border-slate-100">
                  <td className="px-2 py-2 text-slate-700">
                    {new Date(transaction.createdAt).toLocaleString("vi-VN")}
                  </td>
                  <td className="px-2 py-2 text-slate-700">{transaction.productId?.name || "-"}</td>
                  <td className="px-2 py-2">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        transaction.type === "import"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {transaction.type === "import" ? "Nhập" : "Xuất"}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-slate-700">{transaction.quantity}</td>
                  <td className="px-2 py-2 text-slate-700">
                    {transaction.previousStock} → {transaction.newStock}
                  </td>
                  <td className="px-2 py-2 text-slate-700">{transaction.createdBy?.name || "-"}</td>
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
