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
        <AnimatedContainer className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-charcoal uppercase tracking-wider">Ghi chú concierge</h3>
          <ul className="mt-4 space-y-3.5 text-xs text-slate-500 font-light leading-relaxed">
            <li>Xác nhận qua SMS trong 30 phút giờ làm việc.</li>
            <li>Đến sớm 10 phút để thưởng trà ấm và thư giãn.</li>
            <li>Miễn phí cắt dáng mái bay trong 2 tuần đầu.</li>
            <li>Hủy/đổi lịch vui lòng thông báo trước 12 giờ.</li>
          </ul>
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
