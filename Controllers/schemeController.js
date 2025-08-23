const Scheme = require("../models/scheme");
const cache = require("../utils/cache");
/**
 * Add new scheme
 */
//add expirey date to the prompt
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

    // Validate each scheme
    for (const scheme of schemes) {
      if (!scheme.name || !scheme.documents) {
        return res
          .status(400)
          .json({ error: "Each scheme must have name and documents" });
      }
    }

    // Get all existing scheme names
    const existingSchemes = await Scheme.find({}, "name").lean();
    const existingNames = new Set(existingSchemes.map((s) => s.name));

    // Remove duplicates from request body
    const newSchemes = schemes.filter((s) => !existingNames.has(s.name));

    if (newSchemes.length === 0) {
      return res.status(400).json({ error: "No new schemes to insert" });
    }

    // Insert only the new ones
    const inserted = await Scheme.insertMany(newSchemes, { ordered: false });

    res.status(201).json({
      message: "Schemes added successfully",
      insertedCount: inserted.length,
      skippedCount: schemes.length - newSchemes.length,
    });
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
    // Escape special regex characters in name
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // 1️⃣ Try exact match (ignores case)
    const exactScheme = await Scheme.findOne({
      name: { $regex: `^${escapedName}$`, $options: "i" },
    });
    if (exactScheme) return res.status(200).json(exactScheme);

    // 2️⃣ Fallback to partial match
    const partialSchemes = await Scheme.find({
      name: { $regex: escapedName, $options: "i" },
    });

    if (!partialSchemes.length) {
      return res.status(404).json({ error: "No schemes found" });
    }

    return res.status(200).json(partialSchemes);
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};


// ✅ Get all scheme names with timestamps + caching
exports.getAllSchemeNames = async (req, res) => {
  try {
    // 1. Check cache
    const cached = cache.get("schemeNames");
    if (cached) {
      return res.status(200).json({
        source: "cache",
        count: cached.length,
        schemes: cached,
      });
    }

    // 2. Fetch from DB
    const schemes = await Scheme.find({}, "name createdAt updatedAt")
      .sort({ name: 1 })
      .lean();

    if (!schemes || schemes.length === 0) {
      return res.status(404).json({ error: "No schemes found" });
    }

    const formatted = schemes.map((scheme) => ({
      name: scheme.name,
      createdAt: scheme.createdAt,
      updatedAt: scheme.updatedAt,
    }));

    // 3. Store in cache for 5 min
    cache.set("schemeNames", formatted, 300);

    // 4. Return response
    return res.status(200).json({
      source: "database",
      count: formatted.length,
      schemes: formatted,
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error", details: err.message });
  }
};



//not much scalable
// only using name and documents to update and not usign other fields if they are present
exports.updateScheme = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, documents } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Scheme ID is required" });
    }

    // Ensure at least one field is provided
    if (!name && !documents) {
      return res
        .status(400)
        .json({
          error:
            "At least one field (name or documents) is required for update",
        });
    }

    // Check for duplicate name if updating name
    if (name) {
      const existing = await Scheme.findOne({
        name: name.trim(),
        _id: { $ne: id },
      });
      if (existing) {
        return res
          .status(400)
          .json({ error: "Another scheme with the same name already exists" });
      }
    }

    const updated = await Scheme.findByIdAndUpdate(
      id,
      //add scheme info to the prompt
      { ...(name && { name: name.trim() }), ...(documents && { documents }) },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Scheme not found" });
    }

    res
      .status(200)
      .json({ message: "Scheme updated successfully", scheme: updated });
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

exports.deleteAll = async (req, res) => {
  try {
    const result = await Scheme.deleteMany({});
    
    res.status(200).json({ 
      message: "All schemes deleted successfully", 
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    res.status(500).json({ 
      error: "Server error", 
      details: error.message 
    });
  }
};

