const express = require("express");
require("dotenv").config();
const goldAnalyzer = require("./goldAnalyzer");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", async (req, res) => {
  await goldAnalyzer();
  res.send("✅ Gold Analyzer executed.");
});

app.listen(PORT, () => console.log(`MarketPulse-AI server running on port ${PORT}`));
