import QRCode from "qrcode";

export async function createOrderQrDataUrl(orderUrl) {
  return QRCode.toDataURL(orderUrl, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 320,
    color: {
      dark: "#0A0A0A",
      light: "#FFFFFF",
    },
  });
}
