const BaseRepository = require('./BaseRepository');
const Order = require('../../models/Order');

class OrderRepository extends BaseRepository {
  constructor() {
    super(Order);
  }

  // Optimized query for populating user summary for an order
  async findOrderWithDetails(orderId) {
    return this.model.findById(orderId)
      .populate('userId', 'name email phone')
      .lean()
      .exec();
  }
}

module.exports = new OrderRepository();
