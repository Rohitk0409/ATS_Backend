const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Routes
const atsRoute = require("./routes/resumeAts.route");
const feedBackRoute = require("./routes/feedback.route");

app.get("/test", (req, res) => {
  res.send("Backend is working 🚀");
});

app.use("/api/v1", atsRoute);
app.use("/api/v1", feedBackRoute);

const port = process.env.PORT || 1000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.log("❌ MongoDB connection failed:", err.message);
  });
