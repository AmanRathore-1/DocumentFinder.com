const { body, param, validationResult } = require('express-validator');

// Validation for fetching schemes by name param
const validateGetSchemeByName = [
  param('name')
    .trim()
    .notEmpty().withMessage('Name parameter is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = validateGetSchemeByName;
