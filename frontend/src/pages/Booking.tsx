import SectionTitle from "../components/SectionTitle";
import BookingForm from "../components/BookingForm";
import AnimatedContainer from "../components/AnimatedContainer";
import { stylists } from "../constant/data";

const Booking = () => {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 space-y-12">
      <SectionTitle
        eyebrow="Đặt lịch"
        title="Giữ chỗ cho phiên chăm sóc của bạn"
        description="Chọn stylist, dịch vụ và giờ hẹn phù hợp tại Salon Duong Chi. Chúng tôi sẽ xác nhận ngay sau khi nhận yêu cầu."
        align="left"
      />
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-start">
        <BookingForm />
        <AnimatedContainer className="rounded-3xl border border-rose-100 bg-white/70 p-6 shadow-lg shadow-rose-100 backdrop-blur-lg">
          <h3 className="text-lg font-semibold text-slate-900">Ghi chú concierge</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-700">
            <li>- Xác nhận qua SMS trong 30 phút giờ làm việc.</li>
            <li>- Đến sớm 10 phút để thưởng trà ấm và thư giãn.</li>
            <li>- Miễn phí cắt mái trong 2 tuần sau khi cắt.</li>
            <li>- Hủy/đổi lịch vui lòng báo trước 12 giờ.</li>
          </ul>
          <div className="mt-6 space-y-4">
            <h4 className="text-sm font-semibold text-rose-500 uppercase tracking-[0.2em]">
              Stylist
            </h4>
            <div className="grid gap-3 sm:grid-cols-2">
              {stylists.map((stylist) => (
                <div
                  key={stylist.name}
                  className="rounded-2xl border border-rose-100 bg-white/90 px-4 py-3 text-sm text-slate-800 shadow-sm"
                >
                  <p className="font-semibold text-slate-900">{stylist.name}</p>
                  <p className="text-rose-500">{stylist.specialty}</p>
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
