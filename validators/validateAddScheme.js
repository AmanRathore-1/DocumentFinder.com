const { body, param, validationResult } = require("express-validator");

// Validation for adding a scheme
const validateAddScheme = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters long"),
  body("documents")
    .notEmpty()
    .withMessage("Documents are required")
    // optionally validate documents format (array, string, etc)
    .isArray()
    .withMessage("Documents must be an array"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = validateAddScheme;
