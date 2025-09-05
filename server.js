const express = require("express");
const connectDB = require("./db/MongoConnect");
const ServerListening = require("./db/ServerListening");
const schemeRoutes = require("./routes/schemeRoutes");
const helmet=require("helmet");
require("dotenv").config();
const cors = require("cors");

const app = express();
app.use(helmet());
app.use(cors());

// Middleware
app.use(express.urlencoded({ extended: false, limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));

// Routes
app.use("/schemes", schemeRoutes);

// Start server after DB connects
async function startServer() {
  try {
    await connectDB();
    await ServerListening(app);
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
}

startServer();
