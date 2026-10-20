import mongoose from "mongoose";

const pushSubscriptionSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    endpoint: { type: String, required: true },
    p256dh: { type: String, required: true },
    auth: { type: String, required: true },
  },
  { timestamps: true },
);

pushSubscriptionSchema.index({ orderId: 1, endpoint: 1 }, { unique: true });

const PushSubscription =
  mongoose.models.PushSubscription ||
  mongoose.model("PushSubscription", pushSubscriptionSchema);

export default PushSubscription;
