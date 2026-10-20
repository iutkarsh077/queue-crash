import mongoose from "mongoose";
import { ORDER_MAX_AGE_MS, ORDER_STATUS } from "@/lib/order-status-copy";

export { ORDER_MAX_AGE_MS, ORDER_STATUS };

const orderSchema = new mongoose.Schema(
  {
    publicId: { type: String, required: true, unique: true, index: true },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tokenNumber: { type: Number, required: true, min: 1 },
    tokenDate: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      required: true,
      default: ORDER_STATUS.PREPARING,
    },
    label: { type: String, default: "" },
    readyAt: { type: Date, default: null },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

orderSchema.index({ ownerId: 1, tokenDate: 1, tokenNumber: 1 }, { unique: true });
orderSchema.index({ status: 1, createdAt: 1 });

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
