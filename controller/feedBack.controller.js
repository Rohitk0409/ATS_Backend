const Feedback = require("../Schema/feedBackSchema");

exports.createFeedBack = async (req, res) => {
  try {
    const { name, email, feedback } = req.body;

    // Basic manual validation (extra safety)
    if (!email || !feedback) {
      return res.status(400).json({
        success: false,
        message: "Email and feedback are required",
      });
    }

    const newFeedback = await Feedback.create({
      name,
      email,
      feedback,
    });

    return res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      data: newFeedback,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllFeedBacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: feedbacks.length,
      data: feedbacks,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
