export function shouldDeleteSubscription(statusCode) {
  return statusCode === 404 || statusCode === 410;
}

export function ownerReadyPushMessage(push) {
  const sent = Number(push?.sent) || 0;
  const failed = Number(push?.failed) || 0;
  const removed = Number(push?.removed) || 0;

  if (sent > 0) {
    return "Ready. Alert sent to the guest phone. Sound uses the phone notification channel, not media volume.";
  }
  if (failed > 0) {
    return "Ready. Phone alert failed. Check VAPID keys on Vercel and that the guest tapped Notify me.";
  }
  if (removed > 0) {
    return "Ready. The guest subscription is gone. Ask them to open the order and tap Notify me again.";
  }
  return "Ready. No guest tapped Notify me, so the closed app will not sound.";
}
