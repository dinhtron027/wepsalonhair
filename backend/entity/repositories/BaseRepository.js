/**
 * Base Repository for database operations.
 * Implements the Repository Pattern for loose coupling with MongoDB.
 */
class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async find(query = {}, options = {}) {
    const { sort, limit, skip, populate, lean = true } = options;
    let queryBuilder = this.model.find(query);

    if (lean) queryBuilder = queryBuilder.lean();
    if (sort) queryBuilder = queryBuilder.sort(sort);
    if (skip) queryBuilder = queryBuilder.skip(skip);
    if (limit) queryBuilder = queryBuilder.limit(limit);
    if (populate) queryBuilder = queryBuilder.populate(populate);

    return queryBuilder.exec();
  }

  async findOne(query = {}, options = {}) {
    const { populate, lean = true } = options;
    let queryBuilder = this.model.findOne(query);

    if (lean) queryBuilder = queryBuilder.lean();
    if (populate) queryBuilder = queryBuilder.populate(populate);

    return queryBuilder.exec();
  }

  async findById(id, options = {}) {
    return this.findOne({ _id: id }, options);
  }

  async create(data) {
    return this.model.create(data);
  }

  async updateById(id, data, options = { new: true, runValidators: true }) {
    return this.model.findByIdAndUpdate(id, data, options);
  }

  async deleteById(id) {
    return this.model.findByIdAndDelete(id);
  }
}

module.exports = BaseRepository;
