const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const env = require('../config/env');
const Product = require('../models/Product');
const Service = require('../models/Service');
const User = require('../models/User');

const serviceSeeds = [
  {
    name: 'Cat Toc Nu Premium',
    category: 'Haircut',
    price: 250000,
    description: 'Cat, goi, say va tao form co ban.',
    image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f',
    durationMinutes: 75,
    addons: [
      {
        name: 'U phuc hoi collagen',
        price: 120000,
        description: 'Duong toc bong muot va giam xo roi.'
      },
      {
        name: 'Massage da dau 15 phut',
        price: 80000,
        description: 'Thu gian va kich thich tuan hoan.'
      }
    ]
  },
  {
    name: 'Nhuom Mau Thoi Trang',
    category: 'Color',
    price: 850000,
    description: 'Nhuom mau thoi trang voi quy trinh bao ve toc.',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df',
    durationMinutes: 180,
    addons: [
      {
        name: 'Tay nen premium',
        price: 350000,
        description: 'Nang tong mau an toan hon.'
      }
    ]
  },
  {
    name: 'Uon Song Nuoc',
    category: 'Styling',
    price: 950000,
    description: 'Uon giu nep mem mai cho toc nu.',
    image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388',
    durationMinutes: 210,
    addons: [
      {
        name: 'Cat tang form sau uon',
        price: 100000,
        description: 'Canh chinh form de len song dep hon.'
      }
    ]
  }
];

const productSeeds = [
  {
    name: 'Dau Goi Phuc Hoi Keratin',
    price: 320000,
    description: 'Lam sach nhe diu va phuc hoi suon toc hu ton.',
    stock: 24,
    image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1',
    category: 'Hair Care',
    isActive: true
  },
  {
    name: 'Tinh Dau Duong Toc Argan',
    price: 280000,
    description: 'Giam roi, tang do bong muot cho toc sau nhuom.',
    stock: 18,
    image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702',
    category: 'Treatment',
    isActive: true
  },
  {
    name: 'Sap Tao Kieu Silk Hold',
    price: 190000,
    description: 'Giu nep mem, de restyle trong ngay.',
    stock: 35,
    image: 'https://images.unsplash.com/photo-1517837016564-bfc4fdfde7d4',
    category: 'Styling',
    isActive: true
  }
];

const ensureUser = async ({ name, email, phone, password, role }) => {
  let user = await User.findOne({ email }).select('+password');

  if (!user) {
    user = new User({
      name,
      email,
      phone,
      password,
      role
    });

    await user.save();
    return user;
  }

  user.name = name;
  user.phone = phone;
  user.role = role;
  await user.save();
  return user;
};

const seed = async () => {
  try {
    await connectDB();

    for (const service of serviceSeeds) {
      await Service.findOneAndUpdate({ name: service.name }, service, {
        upsert: true,
        new: true,
        runValidators: true
      });
    }

    for (const product of productSeeds) {
      await Product.findOneAndUpdate({ name: product.name }, product, {
        upsert: true,
        new: true,
        runValidators: true
      });
    }

    await ensureUser({
      name: env.DEFAULT_ADMIN_NAME,
      email: env.DEFAULT_ADMIN_EMAIL,
      phone: env.DEFAULT_ADMIN_PHONE,
      password: env.DEFAULT_ADMIN_PASSWORD,
      role: 'admin'
    });

    await ensureUser({
      name: 'Salon Staff',
      email: env.DEFAULT_STAFF_EMAIL,
      phone: env.DEFAULT_STAFF_PHONE,
      password: env.DEFAULT_STAFF_PASSWORD,
      role: 'staff'
    });

    await ensureUser({
      name: 'Sample Customer',
      email: env.DEFAULT_CUSTOMER_EMAIL,
      phone: env.DEFAULT_CUSTOMER_PHONE,
      password: env.DEFAULT_CUSTOMER_PASSWORD,
      role: 'customer'
    });

    console.log('Seed data created successfully');
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seed();
