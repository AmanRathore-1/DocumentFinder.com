const Scheme = require("../models/scheme");

/**
 * Add new scheme
 */
exports.addScheme = async (req, res) => {
  try {
    const { name, documents } = req.body;
    if (!name || !documents) {
      return res.status(400).json({ error: "Name and documents are required" });
    }

    const existing = await Scheme.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ error: "Scheme already exists" });
    }

    const scheme = new Scheme({ name: name.trim(), documents });
    await scheme.save();
    res.status(201).json({ message: "Scheme added successfully", scheme });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// In your controller file
exports.bulkAddSchemes = async (req, res) => {
  try {
    const schemes = req.body;
    if (!Array.isArray(schemes) || schemes.length === 0) {
      return res.status(400).json({ error: "An array of schemes is required" });
    }

    // Optional: Validate each scheme object has name and documents
    for (const scheme of schemes) {
      if (!scheme.name || !scheme.documents) {
        return res.status(400).json({ error: "Each scheme must have name and documents" });
      }
    }

    // Insert all schemes at once
    const inserted = await Scheme.insertMany(schemes);
    res.status(201).json({ message: "Schemes added successfully", insertedCount: inserted.length });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};


/**
 * Get scheme(s) by partial name
 */
exports.getSchemeDocumentThroughTitle = async (req, res) => {
  const { name } = req.params;
  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  try {
    const schemes = await Scheme.find({
      name: { $regex: name.trim(), $options: "i" }
    });

    if (!schemes.length) {
      return res.status(404).json({ error: "No schemes found" });
    }

    return res.status(200).json(schemes);
  } catch (err) {
    return res.status(500).json({ error: "Server error", details: err.message });
  }
};

/**
 * Get all scheme names (sorted alphabetically)
 */
exports.getAllSchemeNames = async (req, res) => {
  try {
    const schemes = await Scheme.find({}, "name").sort({ name: 1 }).lean();
    const names = schemes.map(scheme => scheme.name);
    res.status(200).json(names);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

/**
 * Update a scheme by ID
 */
exports.updateScheme = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, documents } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Scheme ID is required" });
    }

    // Ensure at least one field is provided
    if (!name && !documents) {
      return res.status(400).json({ error: "At least one field (name or documents) is required for update" });
    }

    // Check for duplicate name if updating name
    if (name) {
      const existing = await Scheme.findOne({ name: name.trim(), _id: { $ne: id } });
      if (existing) {
        return res.status(400).json({ error: "Another scheme with the same name already exists" });
      }
    }

    const updated = await Scheme.findByIdAndUpdate(
      id,
      { ...(name && { name: name.trim() }), ...(documents && { documents }) },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Scheme not found" });
    }

    res.status(200).json({ message: "Scheme updated successfully", scheme: updated });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

/**
 * Delete a scheme by ID
 */
exports.deleteScheme = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Scheme ID is required" });
    }

    const deleted = await Scheme.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: "Scheme not found" });
    }

    res.status(200).json({ message: "Scheme deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};
