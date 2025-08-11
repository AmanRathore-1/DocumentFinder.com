const express = require("express");
const router = express.Router();

const schemeController = require("../Controllers/schemeController");

// POST /schemes — add new scheme
router.post("/add", schemeController.addScheme);
router.get("/", schemeController.getAllSchemeNames);
// GET /schemes/:name — get schemes by partial name match
router.get("/:name", schemeController.getSchemeDocumentThroughTitle);

module.exports = router;
