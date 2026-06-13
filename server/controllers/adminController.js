const User = require("../models/User");
const Prediction = require("../models/Prediction");
const Prescription = require("../models/Prescription");
const ChatHistory = require("../models/ChatHistory");

const getAdminAnalytics = async (req, res) => {
  try {
    // 1. Total counts
    const totalUsers = await User.countDocuments();
    const totalPredictions = await Prediction.countDocuments();
    const totalPrescriptions = await Prescription.countDocuments();

    // 2. Disease Distribution Aggregation
    const diseaseDistribution = await Prediction.aggregate([
      {
        $group: {
          _id: "$predictedDisease",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // 3. Chat Usage Analytics
    const chatStats = await ChatHistory.aggregate([
      {
        $project: {
          messagesCount: { $size: "$messages" },
        },
      },
      {
        $group: {
          _id: null,
          totalMessages: { $sum: "$messagesCount" },
          averageMessagesPerSession: { $avg: "$messagesCount" },
        },
      },
    ]);

    const totalChatMessages = chatStats.length > 0 ? chatStats[0].totalMessages : 0;
    const avgChatMessages = chatStats.length > 0 ? Math.round(chatStats[0].averageMessagesPerSession * 10) / 10 : 0;

    // 4. Prescription File Type Distribution
    const prescriptionStats = await Prescription.aggregate([
      {
        $group: {
          _id: "$fileType",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // 5. Daily Active Users (last 24 hours of activity across predictions, chats, prescriptions)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const activeUsersInPredictions = await Prediction.distinct("userId", { createdAt: { $gte: oneDayAgo } });
    const activeUsersInChats = await ChatHistory.distinct("userId", { updatedAt: { $gte: oneDayAgo } });
    const activeUsersInPrescriptions = await Prescription.distinct("userId", { createdAt: { $gte: oneDayAgo } });

    const activeUsersSet = new Set([
      ...activeUsersInPredictions.map((id) => String(id)),
      ...activeUsersInChats.map((id) => String(id)),
      ...activeUsersInPrescriptions.map((id) => String(id)),
    ]);
    const dailyActiveUsers = activeUsersSet.size;

    // 6. Monthly Growth Metrics (User signups per month)
    const monthlyGrowth = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const formattedGrowth = monthlyGrowth.map((item) => {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthLabel = `${monthNames[item._id.month - 1]} ${item._id.year}`;
      return {
        month: monthLabel,
        count: item.count,
      };
    });

    res.json({
      success: true,
      analytics: {
        totalUsers,
        totalPredictions,
        totalPrescriptions,
        totalChatMessages,
        avgChatMessages,
        dailyActiveUsers,
        diseaseDistribution: diseaseDistribution.map(item => ({
          disease: item._id,
          count: item.count
        })),
        prescriptionStats: prescriptionStats.map(item => ({
          fileType: item._id?.toUpperCase() || "UNKNOWN",
          count: item.count
        })),
        monthlyGrowth: formattedGrowth,
      },
    });
  } catch (err) {
    console.error("[Admin Analytics Error]", err.message);
    res.status(500).json({ success: false, message: "Failed to load dashboard metrics." });
  }
};

module.exports = { getAdminAnalytics };
