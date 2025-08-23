const express = require("express");
const router = express.Router();

const schemeController = require("../Controllers/schemeController");
const validateAddScheme = require("../validators/validateAddScheme");
const validateGetSchemeByName = require("../validators/validateGetSchemeByName");
const validateUpdateScheme = require("../validators/validateUpdateScheme");
const validateDeleteScheme = require("../validators/validateDeleteScheme");

// POST /schemes/add — add new scheme (with validation)
router.post("/add", validateAddScheme, schemeController.addScheme);

// In your routes file
router.post("/bulk-add", schemeController.bulkAddSchemes);

// GET /schemes — get all scheme names (no validation needed here)
router.get("/", schemeController.getAllSchemeNames);

// GET /schemes/:name — get schemes by partial name match (with validation)
router.get(
  "/:name",
  validateGetSchemeByName,
  schemeController.getSchemeDocumentThroughTitle
);

// PUT /schemes/:id — update scheme by ID (with validation)
router.put("/:id", validateUpdateScheme, schemeController.updateScheme);

//delete all the scheme
router.delete("/all", schemeController.deleteAll);

// DELETE /schemes/:id — delete scheme by ID (with optional validation)
router.delete("/:id", validateDeleteScheme, schemeController.deleteScheme);

module.exports = router;
