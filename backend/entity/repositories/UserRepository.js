const BaseRepository = require('./BaseRepository');
const User = require('../../models/User'); // Or entity/models/User

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByIdentifier(email, phone) {
    const query = [];
    if (email) query.push({ email: email.toLowerCase() });
    if (phone) query.push({ phone });
    
    if (query.length === 0) return null;
    
    return this.model.findOne({ $or: query }).select('+password').exec();
  }

  async findByEmail(email) {
    return this.model.findOne({ email: email.toLowerCase() }).exec();
  }
}

module.exports = new UserRepository();
