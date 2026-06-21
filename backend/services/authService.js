const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { generateToken } = require('../utils/security');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');
const customerService = require('./customerService');
const env = require('../config/env');

// Khởi tạo client với GOOGLE_CLIENT_ID đã được validate từ env module
const googleClient = env.GOOGLE_CLIENT_ID ? new OAuth2Client(env.GOOGLE_CLIENT_ID) : null;

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  phone: user.phone,
  email: user.email,
  role: user.role,
  avatar: user.avatar || ''
});

const ensureUniqueIdentity = async (email, phone) => {
  const existingUser = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { phone }]
  });

  if (existingUser) {
    throw new ApiError(409, 'Email hoac so dien thoai da duoc su dung');
  }
};

const registerCustomer = async (payload) => {
  await ensureUniqueIdentity(payload.email, payload.phone);

  const user = await User.create({
    ...payload,
    email: payload.email.toLowerCase(),
    role: 'customer'
  });
  await customerService.ensureCustomerProfile({
    userId: user._id,
    fullName: user.name,
    phone: user.phone,
    email: user.email
  });

  const token = generateToken(user);

  return {
    token,
    user: sanitizeUser(user)
  };
};

const login = async ({ identifier, password }) => {
  const normalizedIdentifier = identifier.trim().toLowerCase();

  const user = await User.findOne({
    $or: [{ email: normalizedIdentifier }, { phone: identifier.trim() }]
  }).select('+password');

  if (!user) {
    throw new ApiError(401, 'Thong tin dang nhap khong chinh xac');
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new ApiError(401, 'Thong tin dang nhap khong chinh xac');
  }

  return {
    token: generateToken(user),
    user: sanitizeUser(user)
  };
};

const loginWithGoogle = async (idToken) => {
  if (!googleClient) {
    throw new ApiError(503, 'Chức năng đăng nhập Google chưa được cấu hình trên máy chủ');
  }

  let ticket;
  try {
    ticket = await googleClient.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID
    });
  } catch (error) {
    throw new ApiError(401, 'Token Google không hợp lệ hoặc đã hết hạn');
  }
  
  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    throw new ApiError(400, 'Không lấy được thông tin email từ Google');
  }

  const { email, name, picture, sub: googleId } = payload;
  
  let user = await User.findOne({ email });
  if (user) {
    if (!user.googleId) {
      user.googleId = googleId;
      user.provider = 'google';
      user.avatar = user.avatar || picture;
      await user.save();
    }
  } else {
    user = await User.create({
      email,
      name,
      googleId,
      provider: 'google',
      avatar: picture,
      role: 'customer'
    });
  }

  await customerService.ensureCustomerProfile({
    userId: user._id,
    fullName: user.name,
    phone: user.phone,
    email: user.email
  });

  return {
    token: generateToken(user),
    user: sanitizeUser(user)
  };
};

const loginWithFacebook = async (accessToken) => {
  let fbData;
  try {
    const response = await axios.get(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`);
    fbData = response.data;
  } catch (error) {
    throw new ApiError(401, 'Token Facebook không hợp lệ');
  }

  const { id: facebookId, name, email } = fbData;
  const picture = fbData.picture?.data?.url || '';

  if (!email) {
    throw new ApiError(400, 'Tài khoản Facebook chưa liên kết email');
  }

  let user = await User.findOne({ email });
  if (user) {
    if (!user.facebookId) {
      user.facebookId = facebookId;
      user.provider = 'facebook';
      user.avatar = user.avatar || picture;
      await user.save();
    }
  } else {
    user = await User.create({
      email,
      name,
      facebookId,
      provider: 'facebook',
      avatar: picture,
      role: 'customer'
    });
  }

  await customerService.ensureCustomerProfile({
    userId: user._id,
    fullName: user.name,
    phone: user.phone,
    email: user.email
  });

  return {
    token: generateToken(user),
    user: sanitizeUser(user)
  };
};

module.exports = {
  sanitizeUser,
  registerCustomer,
  login,
  loginWithGoogle,
  loginWithFacebook
};
