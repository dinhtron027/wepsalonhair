const BaseRepository = require('./BaseRepository');
const Booking = require('../../models/Booking');

class BookingRepository extends BaseRepository {
  constructor() {
    super(Booking);
  }

  // Optimized query for getting occupied time slots using indexed query and projection
  async getOccupiedSlots(dateStr) {
    const records = await this.model.find({
      date: new Date(dateStr),
      status: { $in: ['pending', 'confirmed', 'in_service'] }
    })
    .select('time -_id')
    .lean();

    return records.map((record) => record.time);
  }

  async isSlotOccupied(date, time) {
    const booking = await this.model.findOne({
      date,
      time,
      status: { $in: ['pending', 'confirmed', 'in_service'] }
    })
    .select('_id')
    .lean();

    return !!booking;
  }
}

module.exports = new BookingRepository();
