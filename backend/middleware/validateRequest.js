const ApiError = require('../utils/ApiError');

const validateRequest = (schema, property = 'body') => (req, res, next) => {
  const source =
    property === 'body' && req[property] === undefined ? {} : req[property];

  const { error, value } = schema.validate(source, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    return next(
      new ApiError(
        400,
        error.details.map((detail) => detail.message).join(', '),
        error.details
      )
    );
  }

  req[property] = value;
  return next();
};

module.exports = validateRequest;
