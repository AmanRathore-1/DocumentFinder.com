const { body, param, validationResult } = require("express-validator");

const validateUpdateScheme = [
  // Validate scheme ID param (must be a valid MongoDB ObjectId)
  param("id")
    .isMongoId()
    .withMessage("Invalid scheme ID"),

  // At least one of these fields must be provided to update
  body().custom(body => {
    if (!body.name && !body.documents) {
      throw new Error("At least one field (name or documents) is required for update");
    }
    return true;
  }),

  // Optional: Validate name if provided
  body("name")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty"),

  // Optional: Validate documents if provided
  body("documents")
    .optional()
    .isArray()
    .withMessage("Documents must be an array"),

  // Middleware to check for errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = validateUpdateScheme;
