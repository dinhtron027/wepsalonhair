import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Copy,
  Clock,
  Download,
  Home,
  ShoppingBag,
  Maximize2,
  Check
} from "lucide-react";
import { fetchOrderPaymentDetail, reportOrderPaid } from "../services/adminApi";
import LoadingSpinner from "../components/LoadingSpinner";
import { getApiErrorMessage } from "../services/api";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

/**
 * PaymentPage: Trang thanh toán chuyển khoản ngân hàng qua mã VietQR tự động.
 * Quản lý vòng đời đơn hàng, đếm ngược thời gian hết hạn và cập nhật trạng thái thanh toán theo thời gian thực.
 */
const PaymentPage = () => {
  // useParams: Lấy mã đơn hàng orderId từ đường dẫn URL (/checkout/payment/:orderId)
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedContent, setCopiedContent] = useState(false);
  const [isQrMaximized, setIsQrMaximized] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  /**
   * useQuery tải thông tin thanh toán đơn hàng:
   * Tích hợp cơ chế Polling (thăm dò chu kỳ) với `refetchInterval`:
   * Nếu đơn hàng đang ở trạng thái 'pending' (chờ chuyển khoản), hệ thống sẽ tự động gọi lại API
   * mỗi 5 giây (5000ms) để kiểm tra xem Webhook ngân hàng đã xác nhận tiền vào tài khoản hay chưa.
   */
  const { data: paymentDetail, isLoading, error, refetch } = useQuery({
    queryKey: ["orderPayment", orderId],
    queryFn: () => fetchOrderPaymentDetail(orderId!),
    enabled: !!orderId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && data.paymentMethod === "bank_transfer" && data.paymentStatus === "pending") {
        return 5000; // Tự động refetch mỗi 5 giây
      }
      return false; // Dừng polling khi đơn hàng đã thanh toán hoặc đã hủy
    }
  });

  /**
   * Mutation cho phép khách hàng nhấn nút "Tôi đã chuyển khoản":
   * Gửi thông báo đến ban quản lý salon để nhân viên đối soát thủ công nhanh chóng.
   */
  const reportPaidMutation = useMutation({
    mutationFn: () => reportOrderPaid(orderId!),
    onSuccess: () => {
      toast.success("Đã gửi thông báo xác nhận thanh toán! Salon đang kiểm tra.");
      refetch();
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Không thể gửi báo cáo thanh toán"));
    }
  });

  /**
   * Đồng hồ đếm ngược (Countdown Timer) 15 phút:
   * - Tính chênh lệch thời gian giữa paymentExpiresAt của đơn hàng và thời gian thực hiện tại.
   * - Sử dụng setInterval() để giảm thời gian đếm ngược mỗi giây (1000ms).
   * - Trả về hàm cleanup () => clearInterval(interval) để tránh rò rỉ bộ nhớ khi rời trang.
   */
  useEffect(() => {
    if (!paymentDetail?.paymentExpiresAt || paymentDetail.paymentStatus !== "pending") {
      setTimeLeft(null);
      return;
    }

    const calculateTimeLeft = () => {
      const difference = +new Date(paymentDetail.paymentExpiresAt) - +new Date();
      if (difference <= 0) {
        setTimeLeft(0);
        refetch(); // Kích hoạt kiểm tra trạng thái khi hết hạn
        return 0;
      }
      return Math.floor(difference / 1000);
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          refetch();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [paymentDetail?.paymentExpiresAt, paymentDetail?.paymentStatus, refetch]);

  /**
   * Sao chép số tài khoản hoặc nội dung chuyển khoản vào Clipboard của máy:
   * Sử dụng Web API `navigator.clipboard.writeText(text)` hiện đại thay vì execCommand cũ.
   */
  const copyToClipboard = (text: string, type: "account" | "content") => {
    navigator.clipboard.writeText(text);
    if (type === "account") {
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    } else {
      setCopiedContent(true);
      setTimeout(() => setCopiedContent(false), 2000);
    }
    toast.success("Đã sao chép vào bộ nhớ tạm");
  };

  const handleDownloadQr = () => {
    if (!paymentDetail?.qrUrl) return;
    const link = document.createElement("a");
    link.href = paymentDetail.qrUrl;
    link.download = `VietQR_${paymentDetail.orderCode}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Bắt đầu tải xuống ảnh QR");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <LoadingSpinner label="Đang tải thông tin thanh toán..." size="lg" />
      </div>
    );
  }

  if (error || !paymentDetail) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF9F6] p-4 text-center">
        <XCircle className="h-16 w-16 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Lỗi tải dữ liệu thanh toán</h2>
        <p className="text-slate-500 mb-6 max-w-sm">Không thể lấy thông tin chi tiết về đơn hàng này. Vui lòng kiểm tra lại đường dẫn hoặc quyền truy cập.</p>
        <button
          onClick={() => navigate("/")}
          className="rounded-full bg-slate-950 hover:bg-slate-900 text-white font-semibold text-sm px-6 py-3 transition"
        >
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  const isBank = paymentDetail.paymentMethod === "bank_transfer";
  const { paymentStatus, orderStatus } = paymentDetail;

  // --- COD VIEW ---
  if (!isBank || paymentStatus === "pay_at_store" || paymentDetail.paymentMethod === "cod") {
    return (
      <div className="min-h-[100dvh] bg-[#FAF9F6] py-16 px-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-lg p-2 rounded-[2rem] bg-black/5 ring-1 ring-black/5">
          <div className="bg-white rounded-[calc(2rem-0.5rem)] shadow-xl p-8 space-y-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" strokeWidth={1.5} />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 font-display">Đặt đơn thành công!</h2>
              <p className="text-sm text-slate-500">Cảm ơn bạn đã lựa chọn dịch vụ của chúng tôi.</p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-left text-xs text-slate-600 space-y-3.5">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="font-medium text-slate-400">Mã đơn hàng</span>
                <span className="font-mono font-bold text-slate-900 text-sm">#{paymentDetail.orderCode}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="font-medium text-slate-400">Tổng thanh toán</span>
                <span className="font-black text-rose-600 text-sm">{formatCurrency(paymentDetail.amount)}</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="font-medium text-slate-400">Hình thức</span>
                <span className="font-bold text-slate-800 uppercase">Thanh toán khi nhận hàng (COD)</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 italic leading-relaxed">
              * Nhân viên Salon sẽ liên hệ xác nhận và tiến hành giao hàng hoặc chuẩn bị sản phẩm cho bạn trong thời gian sớm nhất.
            </p>

            <div className="pt-2 flex gap-4">
              <button
                onClick={() => navigate("/")}
                className="flex-1 rounded-full border border-slate-200 bg-white py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition active:scale-98"
              >
                Về trang chủ
              </button>
              <button
                onClick={() => navigate("/products")}
                className="flex-1 rounded-full bg-slate-950 py-3 text-xs font-bold text-white hover:bg-slate-900 transition active:scale-98"
              >
                Xem sản phẩm
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- BANK TRANSFER VIEW ---
  return (
    <div className="min-h-[100dvh] bg-[#FAF9F6] py-12 px-4 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-2xl p-2 rounded-[2rem] bg-black/5 ring-1 ring-black/5 shadow-2xl">
        <div className="bg-white rounded-[calc(2rem-0.5rem)] p-6 md:p-8 space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2 pb-2 border-b border-slate-100">
            {paymentStatus === "paid" ? (
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 animate-bounce">
                <CheckCircle2 className="h-9 w-9 text-emerald-500" strokeWidth={1.5} />
              </div>
            ) : paymentStatus === "expired" || orderStatus === "payment_expired" ? (
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50">
                <XCircle className="h-9 w-9 text-rose-500" strokeWidth={1.5} />
              </div>
            ) : paymentStatus === "cancelled" || orderStatus === "cancelled" ? (
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                <XCircle className="h-9 w-9 text-slate-500" strokeWidth={1.5} />
              </div>
            ) : (
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 animate-pulse">
                <Clock className="h-8 w-8 text-amber-500" strokeWidth={1.5} />
              </div>
            )}

            <h2 className="text-lg md:text-xl font-black text-slate-900 font-display">
              {paymentStatus === "paid"
                ? "Thanh toán thành công"
                : paymentStatus === "expired" || orderStatus === "payment_expired"
                ? "Đơn hàng đã hết thời gian thanh toán"
                : paymentStatus === "cancelled" || orderStatus === "cancelled"
                ? "Đơn hàng đã bị hủy"
                : "Hoàn tất chuyển khoản để xác nhận đơn hàng"}
            </h2>

            <p className="text-xs text-slate-500">
              {paymentStatus === "paid"
                ? "Cảm ơn bạn. Salon Dương Chi đã nhận đủ số tiền."
                : paymentStatus === "expired" || orderStatus === "payment_expired"
                ? "Đơn hàng này đã quá 30 phút mà chưa thanh toán nên đã bị hủy tự động."
                : paymentStatus === "cancelled" || orderStatus === "cancelled"
                ? "Đơn hàng đã bị hủy trên hệ thống."
                : "Đơn hàng đang chờ thanh toán chuyển khoản."}
            </p>
          </div>

          {/* Pending Details: QR & Bank details */}
          {paymentStatus === "pending" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              
              {/* VietQR Double Bezel */}
              <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-50/50 border border-slate-100 relative group">
                {paymentDetail.qrUrl ? (
                  <div className="relative overflow-hidden rounded-xl bg-white border border-slate-200 p-2 shadow-xs">
                    <img
                      src={paymentDetail.qrUrl}
                      alt="VietQR Chuyển khoản"
                      className="w-44 h-44 md:w-52 md:h-52 object-contain"
                    />
                    <button
                      onClick={() => setIsQrMaximized(true)}
                      className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-colors"
                      title="Phóng to"
                    >
                      <Maximize2 size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="w-44 h-44 flex items-center justify-center bg-slate-100 text-slate-400 text-xs rounded-xl">
                    Không thể tạo VietQR
                  </div>
                )}
                
                <div className="mt-3 flex gap-2 w-full px-2">
                  <button
                    onClick={handleDownloadQr}
                    className="flex-1 py-2 rounded-full border border-slate-200 bg-white text-[11px] font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition flex items-center justify-center gap-1"
                  >
                    <Download size={12} /> Tải mã QR
                  </button>
                </div>

                {/* Countdown display */}
                {timeLeft !== null && (
                  <div className="absolute -top-3.5 bg-rose-500 text-white rounded-full px-3.5 py-1 text-[11px] font-bold flex items-center gap-1 shadow-sm shadow-rose-200 animate-pulse">
                    <Clock size={12} />
                    Giữ đơn: {formatTime(timeLeft)}
                  </div>
                )}
              </div>

              {/* Bank Details */}
              <div className="space-y-4 text-xs">
                <div className="border-b border-slate-100 pb-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Ngân hàng</span>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">{paymentDetail.bankInfo.bankCode.toUpperCase()}</p>
                </div>

                <div className="border-b border-slate-100 pb-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Số tài khoản</span>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="font-mono font-bold text-slate-900 text-sm">{paymentDetail.bankInfo.accountNumber}</p>
                    <button
                      onClick={() => copyToClipboard(paymentDetail.bankInfo.accountNumber, "account")}
                      className="p-1 rounded-md text-cyan-600 hover:bg-cyan-50 active:scale-95 transition"
                    >
                      {copiedAccount ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div className="border-b border-slate-100 pb-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Chủ tài khoản</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{paymentDetail.bankInfo.accountName}</p>
                </div>

                <div className="border-b border-slate-100 pb-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Số tiền chính xác</span>
                  <p className="font-black text-rose-600 text-base mt-0.5">{formatCurrency(paymentDetail.amount)}</p>
                </div>

                <div className="border-b border-slate-100 pb-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Nội dung chuyển khoản bắt buộc</span>
                  <div className="flex items-center justify-between mt-0.5 bg-amber-50/55 p-1.5 rounded-lg border border-amber-100">
                    <p className="font-mono font-black text-cyan-700 text-sm">
                      {paymentDetail.transferContent}
                    </p>
                    <button
                      onClick={() => copyToClipboard(paymentDetail.transferContent, "content")}
                      className="p-1 rounded-md text-cyan-600 hover:bg-amber-100/50 active:scale-95 transition"
                    >
                      {copiedContent ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Warnings and Notes for Pending Payment */}
          {paymentStatus === "pending" && (
            <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl flex items-start gap-2 text-[11px] text-rose-700 leading-relaxed">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>
                <strong>Cảnh báo quan trọng:</strong> Vui lòng chuyển <strong>đúng số tiền</strong> và <strong>đúng nội dung</strong> như trên để hệ thống ghi nhận giao dịch của bạn. Đơn hàng sẽ bị hủy nếu hết hạn giữ đơn.
              </span>
            </div>
          )}

          {/* Status logs */}
          {paymentDetail.customerPaymentNote === "customer_reported_paid" && paymentStatus === "pending" && (
            <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-start gap-2 text-[11px] text-emerald-800">
              <CheckCircle2 size={15} className="shrink-0 mt-0.5 text-emerald-600" />
              <div>
                <strong>Bạn đã báo chuyển khoản:</strong> Salon Dương Chi đã nhận được thông báo chuyển khoản của bạn lúc {paymentDetail.customerReportedPaidAt ? new Date(paymentDetail.customerReportedPaidAt).toLocaleTimeString("vi-VN") : ""}. Chúng tôi đang đối soát giao dịch thực tế và sẽ cập nhật trạng thái đơn hàng sớm nhất.
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
            {paymentStatus === "pending" && (
              <button
                onClick={() => reportPaidMutation.mutate()}
                disabled={reportPaidMutation.isPending || paymentDetail.customerPaymentNote === "customer_reported_paid"}
                className="flex-1 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs py-3.5 transition flex items-center justify-center gap-1.5 active:scale-98 shadow-sm shadow-emerald-100"
              >
                <CheckCircle2 size={14} /> 
                {paymentDetail.customerPaymentNote === "customer_reported_paid"
                  ? "Đã gửi thông báo cho Salon"
                  : "Tôi đã chuyển khoản"}
              </button>
            )}

            <button
              onClick={() => navigate("/")}
              className="flex-1 rounded-full border border-slate-200 bg-white hover:bg-slate-50 py-3.5 text-xs font-bold text-slate-700 transition flex items-center justify-center gap-1 active:scale-98"
            >
              <Home size={14} /> Quay lại trang chủ
            </button>

            <button
              onClick={() => navigate("/products")}
              className="flex-1 rounded-full bg-slate-950 hover:bg-slate-900 py-3.5 text-xs font-bold text-white transition flex items-center justify-center gap-1 active:scale-98"
            >
              <ShoppingBag size={14} /> Mua sắm tiếp
            </button>
          </div>

        </div>
      </div>

      {/* Maximized QR Modal */}
      {isQrMaximized && paymentDetail.qrUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 relative animate-scaleUp">
            <h3 className="text-center font-bold text-slate-800 text-sm">Quét mã VietQR bằng ứng dụng Ngân hàng</h3>
            <img
              src={paymentDetail.qrUrl}
              alt="VietQR code enlarged"
              className="w-full h-auto object-contain rounded-2xl border border-slate-100"
            />
            <div className="flex gap-2">
              <button
                onClick={handleDownloadQr}
                className="flex-1 py-2.5 rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Tải xuống
              </button>
              <button
                onClick={() => setIsQrMaximized(false)}
                className="flex-1 py-2.5 rounded-full bg-slate-950 text-white text-xs font-bold hover:bg-slate-900 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
