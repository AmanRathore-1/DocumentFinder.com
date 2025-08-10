const Scheme = require("../models/scheme");

// Add new scheme
exports.addScheme = async (req, res) => {
  try {
    const { name, documents } = req.body;
    if (!name || !documents) {
      return res.status(400).json({ error: "Name and documents are required" });
    }

    const existing = await Scheme.findOne({ name });
    if (existing) {
      return res.status(400).json({ error: "Scheme already exists" });
    }

    const scheme = new Scheme({ name, documents });
    await scheme.save();
    res.status(201).json({ message: "Scheme added successfully", scheme });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// Get scheme documents by name (query param)
exports.getSchemeDocuments = async (req, res) => {
  try {
    const schemeName = req.query.name;
    if (!schemeName) {
      return res.status(400).json({ error: "Please provide a scheme name" });
    }

    const scheme = await Scheme.findOne({
      name: { $regex: new RegExp(schemeName, "i") }
    });

    if (!scheme) {
      return res.status(404).json({ error: "Scheme not found" });
    }

    res.json(scheme.documents);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// Get scheme(s) by partial match on name (path param)
exports.getSchemeDocumentThroughTitle = async (req, res) => {
  const { name } = req.params;
  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  try {
    const schemes = await Scheme.find({
      name: { $regex: name, $options: "i" }
    });

    if (!schemes.length) {
      return res.status(404).json({ error: "No schemes found" });
    }

    return res.status(200).json(schemes);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
