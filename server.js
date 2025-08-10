const express = require("express");
const connectDB=require("./db/MongoConnect");
const ServerListening=require("./db/ServerListening");
const schemeRoutes = require("./routes/schemeRoutes");
require("dotenv").config(); 
const app = express();

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

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