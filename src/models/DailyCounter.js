import mongoose from "mongoose";

const dailyCounterSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: { type: String, required: true },
    seq: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

dailyCounterSchema.index({ ownerId: 1, date: 1 }, { unique: true });

const DailyCounter =
  mongoose.models.DailyCounter ||
  mongoose.model("DailyCounter", dailyCounterSchema);

export default DailyCounter;
