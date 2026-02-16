const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },

    feedback: {
      type: String,
      required: [true, "Feedback is required"],
      trim: true,
      minlength: [5, "Feedback must be at least 5 characters"],
    },
  },
  {
    timestamps: true, // automatically adds createdAt & updatedAt
  },
);

module.exports = mongoose.model("Feedback", feedbackSchema);
