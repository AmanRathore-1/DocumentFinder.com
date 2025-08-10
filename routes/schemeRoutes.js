const express = require("express");
const router = express.Router();
const schemeController = require("../controllers/schemeController");

router.get("/documents", schemeController.getSchemeDocuments); // /schemes/documents?name=xyz
router.get("/title/:name", schemeController.getSchemeDocumentThroughTitle); // /schemes/search/xyz
router.post("/add", schemeController.addScheme); // /schemes/add

module.exports = router;
