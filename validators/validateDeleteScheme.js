const { param, validationResult } = require("express-validator");

const validateDeleteScheme = [
  // Validate scheme ID param
  param("id")
    .isMongoId()
    .withMessage("Invalid scheme ID"),

  // Middleware to check for errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = validateDeleteScheme;
