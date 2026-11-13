import SectionTitle from "../components/SectionTitle";
import BookingForm from "../components/BookingForm";
import AnimatedContainer from "../components/AnimatedContainer";
import { stylists } from "../constant/data";

/**
 * Component Booking (Trang Đặt Lịch Hẹn):
 * 
 * Vai trò trong cấu trúc website:
 * - Cung cấp giao diện trung tâm để khách hàng đặt trước dịch vụ salon.
 * - Thiết kế phân chia bố cục 2 cột (Two-Column Bento Layout) hiện đại:
 *   + Cột chính (trái, tỉ lệ 1.2): Form nhập liệu đặt lịch (BookingForm).
 *   + Cột phụ (phải, tỉ lệ 0.8): Thẻ thông tin trợ lý khách hàng (Concierge Notes) và thẻ hồ sơ các Stylist phụ trách.
 * - Responsive: Trên thiết bị di động hiển thị 1 cột xếp dọc (Mobile-First),
 *   lên kích thước lớn (`lg: 1024px`) tự động tách thành 2 cột song song.
 */
const Booking = () => {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 space-y-12">
      {/* Tiêu đề trang đặt lịch với định dạng căn lề trái */}
      <SectionTitle
        eyebrow="Đặt lịch"
        title="Giữ chỗ cho phiên chăm sóc của bạn"
        description="Chọn stylist, dịch vụ và giờ hẹn phù hợp tại Salon Duong Chi. Chúng tôi sẽ xác nhận ngay sau khi nhận yêu cầu."
        align="left"
      />

      {/* Bố cục Grid 2 cột: Form đặt lịch và Thông tin lưu ý */}
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-start">
        {/* Cột trái: Form nhập liệu đặt lịch */}
        <BookingForm />

        {/* Cột phải: Khung ghi chú dịch vụ và danh sách Stylist với hiệu ứng mượt mà */}
        <AnimatedContainer className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-charcoal uppercase tracking-wider">Ghi chú concierge</h3>
          <ul className="mt-4 space-y-3.5 text-xs text-slate-500 font-light leading-relaxed">
            <li>Xác nhận qua SMS trong 30 phút giờ làm việc.</li>
            <li>Đến sớm 10 phút để thưởng trà ấm và thư giãn.</li>
            <li>Miễn phí cắt dáng mái bay trong 2 tuần đầu.</li>
            <li>Hủy/đổi lịch vui lòng thông báo trước 12 giờ.</li>
          </ul>

          {/* Danh sách các chuyên viên tạo mẫu tóc chính của salon */}
          <div className="mt-8 space-y-4">
            <h4 className="text-[10px] font-semibold text-taupe uppercase tracking-[0.25em]">
              Stylist Phụ Trách
            </h4>
            <div className="grid gap-3 sm:grid-cols-2">
              {stylists.map((stylist) => (
                <div
                  key={stylist.name}
                  className="rounded-xl border border-neutral-200/60 bg-white px-4 py-3 text-xs text-slate-700 font-light"
                >
                  <p className="font-medium text-charcoal">{stylist.name}</p>
                  <p className="text-taupe mt-0.5 font-normal">{stylist.specialty}</p>
                </div>
              ))}
            </div>
          </div>
        </AnimatedContainer>
      </div>
    </div>
  );
};

export default Booking;
