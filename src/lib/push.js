import webPushPackage from "web-push";

const webpush = webPushPackage.default ?? webPushPackage;
import PushSubscription from "@/models/PushSubscription";
import { foodReadyPayload, READY_PUSH_OPTIONS } from "@/lib/order-lifecycle";
import { shouldDeleteSubscription } from "@/lib/push-result";
import { getVapidConfig } from "@/lib/vapid";

export async function sendReadyPush(order) {
  const vapid = getVapidConfig();
  webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);

  const subscriptions = await PushSubscription.find({
    orderId: order._id,
  }).lean();

  let sent = 0;
  let removed = 0;
  let failed = 0;
  const payload = JSON.stringify(
    foodReadyPayload(order.tokenNumber, order.publicId),
  );

  for (const subscription of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        },
        payload,
        READY_PUSH_OPTIONS,
      );
      sent += 1;
    } catch (error) {
      const statusCode = error?.statusCode;
      if (shouldDeleteSubscription(statusCode)) {
        await PushSubscription.deleteOne({ _id: subscription._id });
        removed += 1;
      } else {
        failed += 1;
      }
    }
  }

  console.info(
    JSON.stringify({
      event: "push-ready",
      publicId: order.publicId,
      sent,
      removed,
      failed,
    }),
  );

  return { sent, removed, failed };
}

export async function deleteOrderSubscriptions(orderId) {
  const result = await PushSubscription.deleteMany({ orderId });
  return result.deletedCount ?? 0;
}
