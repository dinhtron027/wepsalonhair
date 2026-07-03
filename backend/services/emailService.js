const nodemailer = require('nodemailer');
const env = require('../config/env');
const { formatDateForDisplay } = require('../utils/date');

const createTransporter = () => {
  if (env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: Number(env.SMTP_PORT) === 465,
      auth:
        env.SMTP_USER && env.SMTP_PASS
          ? {
              user: env.SMTP_USER,
              pass: env.SMTP_PASS
            }
          : undefined
    });
  }

  return nodemailer.createTransport({
    jsonTransport: true
  });
};

const transporter = createTransporter();

const sendBookingConfirmation = async (booking) => {
  if (!booking.email) {
    return {
      skipped: true,
      reason: 'Customer email not provided'
    };
  }

  return transporter.sendMail({
    from: env.EMAIL_FROM,
    to: booking.email,
    subject: `Xac nhan lich hen - ${booking.serviceName}`,
    text: [
      `Xin chao ${booking.customerName},`,
      '',
      'Salon Duong Chi da nhan lich hen cua ban.',
      `Dich vu: ${booking.serviceName}`,
      `Thoi gian: ${formatDateForDisplay(booking.date, booking.time)}`,
      `Tong chi phi du kien: ${booking.totalPrice.toLocaleString('vi-VN')} VND`,
      '',
      'Hen gap ban tai salon.'
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Salon Duong Chi</h2>
        <p>Xin chao <strong>${booking.customerName}</strong>,</p>
        <p>Salon da nhan lich hen cua ban.</p>
        <ul>
          <li>Dich vu: <strong>${booking.serviceName}</strong></li>
          <li>Thoi gian: <strong>${formatDateForDisplay(booking.date, booking.time)}</strong></li>
          <li>Tong chi phi du kien: <strong>${booking.totalPrice.toLocaleString('vi-VN')} VND</strong></li>
        </ul>
        <p>Hen gap ban tai Salon Duong Chi.</p>
      </div>
    `
  });
};

module.exports = {
  sendBookingConfirmation
};
