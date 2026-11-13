const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const CustomerNote = require('../models/CustomerNote');
const HairFormula = require('../models/HairFormula');
const customerService = require('../services/customerService');

const Cart = require('../models/Cart');

async function run() {
  try {
    await connectDB();
    console.log('--- STARTING ALL CUSTOMER DATA RESET ---');

    // 1. Delete all Bookings
    const bookingRes = await Booking.deleteMany({});
    console.log(`Deleted ${bookingRes.deletedCount} bookings.`);

    // 2. Delete all Orders
    const orderRes = await Order.deleteMany({});
    console.log(`Deleted ${orderRes.deletedCount} orders.`);

    // 3. Delete all Customer Notes
    const noteRes = await CustomerNote.deleteMany({});
    console.log(`Deleted ${noteRes.deletedCount} customer notes.`);

    // 4. Delete all Hair Formulas
    const formulaRes = await HairFormula.deleteMany({});
    console.log(`Deleted ${formulaRes.deletedCount} hair formulas.`);

    // 5. Delete all Carts
    const cartRes = await Cart.deleteMany({});
    console.log(`Deleted ${cartRes.deletedCount} carts.`);

    // 6. Delete all Customer Profiles
    const customerDelRes = await Customer.deleteMany({});
    console.log(`Deleted ${customerDelRes.deletedCount} customer profiles.`);

    // 7. Delete all User accounts with role = 'customer'
    const userDelRes = await User.deleteMany({ role: 'customer' });
    console.log(`Deleted ${userDelRes.deletedCount} customer user accounts.`);

    console.log('--- RESET COMPLETED SUCCESSFULLY ---');
  } catch (error) {
    console.error('Reset failed:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

run();
