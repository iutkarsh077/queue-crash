export function shouldDeleteSubscription(statusCode) {
  return statusCode === 404 || statusCode === 410;
}
