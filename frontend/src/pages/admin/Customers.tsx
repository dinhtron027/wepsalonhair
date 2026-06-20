import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, RefreshCcw, Users } from "lucide-react";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/LoadingSpinner";
import CustomerCard, {
  CustomerDetailSection,
} from "../../components/admin/customers/CustomerCard";
import CustomerDetailModal from "../../components/admin/customers/CustomerDetailModal";
import CustomerFilters from "../../components/admin/customers/CustomerFilters";
import CustomerSummaryCards from "../../components/admin/customers/CustomerSummaryCards";
import RebookModal, {
  RebookPayload,
} from "../../components/admin/customers/RebookModal";
import {
  CustomerEntity,
  CustomerFilterParams,
  fetchAdminCustomers,
  queryKeys,
  rebookCustomer,
} from "../../services/adminApi";
import { getApiErrorMessage } from "../../services/api";

const defaultFilters: CustomerFilterParams = {
  search: "",
  segment: "",
  serviceCategory: "",
  staffId: "",
  status: "",
  dateFrom: "",
  dateTo: "",
  sortBy: "lastVisitAt",
  sortOrder: "desc",
  page: 1,
  limit: 10,
};

const CustomersPage = () => {
  const queryClient = useQueryClient();
  const [draftFilters, setDraftFilters] = useState<CustomerFilterParams>(defaultFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<CustomerFilterParams>(defaultFilters);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerEntity | null>(null);
  const [detailSection, setDetailSection] =
    useState<CustomerDetailSection>("overview");
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isRebookOpen, setIsRebookOpen] = useState(false);

  const customerQuery = useQuery({
    queryKey: [...queryKeys.adminCustomers, appliedFilters],
    queryFn: () => fetchAdminCustomers(appliedFilters),
    placeholderData: (previousData) => previousData,
  });

  const rebookMutation = useMutation({
    mutationFn: (payload: RebookPayload) =>
      rebookCustomer(selectedCustomer?.id as string, payload),
    onSuccess: () => {
      toast.success("Đã tạo lịch hẹn lại cho khách hàng");
      setIsRebookOpen(false);
      queryClient.invalidateQueries({ queryKey: [...queryKeys.adminCustomers] });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.adminCustomerDetails] });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.adminBookings] });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.bookingSlots] });
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Không thể tạo lịch hẹn lại")),
  });

  const openDetail = (customer: CustomerEntity, section: CustomerDetailSection) => {
    setSelectedCustomer(customer);
    setDetailSection(section);
    setIsDetailOpen(true);
  };

  const openRebook = (customer: CustomerEntity) => {
    setSelectedCustomer(customer);
    setIsDetailOpen(false);
    setIsRebookOpen(true);
  };

  const applyFilters = () => {
    setAppliedFilters({ ...draftFilters, page: 1 });
    setDraftFilters((prev) => ({ ...prev, page: 1 }));
  };

  const resetFilters = () => {
    setDraftFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
  };

  const changePage = (page: number) => {
    setAppliedFilters((prev) => ({ ...prev, page }));
    setDraftFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const data = customerQuery.data;
  const hasActiveFilters = Boolean(
    appliedFilters.search ||
      appliedFilters.segment ||
      appliedFilters.serviceCategory ||
      appliedFilters.staffId ||
      appliedFilters.status ||
      appliedFilters.dateFrom ||
      appliedFilters.dateTo
  );

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-600">
              Salon Customer CRM
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">Khách hàng</h2>
            <p className="mt-1 max-w-3xl text-sm text-slate-500">
              Theo dõi hành vi, lịch sử làm tóc, công thức màu, ghi chú tư vấn và tạo
              lịch chăm sóc lại từ một hồ sơ thống nhất.
            </p>
          </div>
          <button
            type="button"
            onClick={() => customerQuery.refetch()}
            disabled={customerQuery.isFetching}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCcw
              size={16}
              className={customerQuery.isFetching ? "animate-spin" : ""}
            />
            Làm mới dữ liệu
          </button>
        </div>
      </section>

      <CustomerSummaryCards summary={data?.summary} />

      <CustomerFilters
        value={draftFilters}
        options={data?.filterOptions}
        onChange={setDraftFilters}
        onApply={applyFilters}
        onReset={resetFilters}
      />

      {customerQuery.isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12">
          <LoadingSpinner size="lg" label="Đang tải dữ liệu CRM khách hàng..." />
        </div>
      ) : null}

      {customerQuery.isError ? (
        <section className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
          <p className="font-semibold text-rose-800">
            Không thể tải dữ liệu khách hàng từ máy chủ.
          </p>
          <button
            type="button"
            onClick={() => customerQuery.refetch()}
            className="mt-4 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Thử tải lại
          </button>
        </section>
      ) : null}

      {!customerQuery.isLoading && !customerQuery.isError ? (
        <>
          <div className="space-y-4">
            {(data?.items || []).map((customer) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                onOpen={(section) => openDetail(customer, section)}
                onRebook={() => openRebook(customer)}
              />
            ))}
          </div>

          {!data?.items.length ? (
            <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <Users className="mx-auto text-slate-300" size={42} />
              <h3 className="mt-4 font-semibold text-slate-900">
                {hasActiveFilters
                  ? "Không có khách hàng phù hợp bộ lọc"
                  : "Chưa có dữ liệu khách hàng"}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {hasActiveFilters
                  ? "Hãy thử bỏ bớt điều kiện tìm kiếm hoặc đặt lại bộ lọc."
                  : "Chạy seed hoặc tạo lịch hẹn đầu tiên để hình thành hồ sơ CRM."}
              </p>
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-4 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
                >
                  Đặt lại bộ lọc
                </button>
              ) : null}
            </section>
          ) : null}

          {data && data.pagination.totalPages > 1 ? (
            <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Hiển thị trang {data.pagination.page}/{data.pagination.totalPages} ·{" "}
                {data.pagination.total} khách hàng
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => changePage(data.pagination.page - 1)}
                  disabled={data.pagination.page <= 1}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                  Trước
                </button>
                <button
                  type="button"
                  onClick={() => changePage(data.pagination.page + 1)}
                  disabled={data.pagination.page >= data.pagination.totalPages}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40"
                >
                  Sau
                  <ChevronRight size={16} />
                </button>
              </div>
            </section>
          ) : null}
        </>
      ) : null}

      <CustomerDetailModal
        customerId={isDetailOpen ? selectedCustomer?.id || null : null}
        initialSection={detailSection}
        onClose={() => setIsDetailOpen(false)}
        onRebook={() => setIsRebookOpen(true)}
      />

      {selectedCustomer ? (
        <RebookModal
          customer={selectedCustomer}
          options={data?.filterOptions}
          isOpen={isRebookOpen}
          isSaving={rebookMutation.isPending}
          onClose={() => setIsRebookOpen(false)}
          onSave={(payload) => rebookMutation.mutate(payload)}
        />
      ) : null}
    </div>
  );
};

export default CustomersPage;
