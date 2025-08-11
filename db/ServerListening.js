require("dotenv").config(); 
const express = require("express");
const app = express();
const PORT = process.env.PORT;
const ServerListening = (app) => {
  return new Promise((resolve) => {
    const PORT = process.env.PORT || 3000; // ✅ Render assigns PORT
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      resolve();
    });
  });
};

module.exports = ServerListening;
