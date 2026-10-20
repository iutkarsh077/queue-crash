export function getPublicAppOrigin(headersList) {
  const configured = process.env.APP_URL?.replace(/\/$/, "");
  if (configured) {
    return configured;
  }

  if (process.env.VERCEL_ENV === "production") {
    const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
    if (productionHost) {
      return productionHost.startsWith("http")
        ? productionHost.replace(/\/$/, "")
        : `https://${productionHost}`;
    }
  }

  const host = headersList.get("x-forwarded-host") || headersList.get("host");
  if (!host) {
    throw new Error("Host is missing.");
  }

  const proto =
    headersList.get("x-forwarded-proto") ||
    (process.env.NODE_ENV === "production" ? "https" : "http");

  return `${proto}://${host}`;
}
