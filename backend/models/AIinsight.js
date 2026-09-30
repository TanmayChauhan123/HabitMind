import mongoose from "mongoose";

const aiInsightSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["weekly", "suggestion", "recovery", "chat", "morning"],
      required: true,
    },

    content: { type: String, required: true },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
    generatedAt: { type: Date, default: Date.now },
  },

  { timestamps: true },
);

export default mongoose.model("AIinsight", aiInsightSchema);
