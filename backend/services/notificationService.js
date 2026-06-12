const { formatDateForDisplay } = require('../utils/date');
const emailService = require('./emailService');
const zaloService = require('./zaloService');

const notifyBookingCreated = async (booking) => {
  const humanTime = formatDateForDisplay(booking.date, booking.time);
  const zaloMessage = `Lich hen moi: ${booking.customerName} - ${booking.serviceName} - ${humanTime}`;

  const results = {
    email: null,
    zalo: null
  };

  try {
    results.email = await emailService.sendBookingConfirmation(booking);
  } catch (error) {
    console.error('Booking confirmation email failed:', error.message);
    results.email = {
      delivered: false,
      error: error.message
    };
  }

  try {
    results.zalo = await zaloService.sendZaloNotification(zaloMessage, {
      bookingId: booking._id.toString(),
      customerName: booking.customerName,
      serviceName: booking.serviceName,
      time: humanTime
    });
  } catch (error) {
    console.error('Zalo notification failed:', error.message);
    results.zalo = {
      delivered: false,
      error: error.message
    };
  }

  return results;
};

module.exports = {
  notifyBookingCreated
};
