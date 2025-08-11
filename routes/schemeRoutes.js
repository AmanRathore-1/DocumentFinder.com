const express = require("express");
const router = express.Router();

const schemeController = require("../Controllers/schemeController");
const validateAddScheme = require('../validators/validateAddScheme');
const validateGetSchemeByName = require('../validators/validateGetSchemeByName');

// POST /schemes — add new scheme (with validation)
router.post("/add", validateAddScheme, schemeController.addScheme);

// GET /schemes — get all scheme names (no validation needed here)
router.get("/", schemeController.getAllSchemeNames);

// GET /schemes/:name — get schemes by partial name match (with validation)
router.get("/:name", validateGetSchemeByName, schemeController.getSchemeDocumentThroughTitle);

module.exports = router;
