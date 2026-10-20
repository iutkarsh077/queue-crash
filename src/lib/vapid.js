export function readVapidConfig(env = process.env) {
  const publicKey = env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  const privateKey = env.VAPID_PRIVATE_KEY?.trim();
  const subject = env.VAPID_SUBJECT?.trim();
  const missing = [];

  if (!publicKey) {
    missing.push("NEXT_PUBLIC_VAPID_PUBLIC_KEY");
  }
  if (!privateKey) {
    missing.push("VAPID_PRIVATE_KEY");
  }
  if (!subject) {
    missing.push("VAPID_SUBJECT");
  }

  return { publicKey, privateKey, subject, missing };
}

export function assertVapidConfig(env = process.env) {
  const config = readVapidConfig(env);
  if (config.missing.length > 0) {
    throw new Error(
      `VAPID settings are missing: ${config.missing.join(", ")}.`,
    );
  }
  if (!config.subject.startsWith("mailto:") && !config.subject.startsWith("https://")) {
    throw new Error("VAPID_SUBJECT must start with mailto: or https://.");
  }
  return {
    publicKey: config.publicKey,
    privateKey: config.privateKey,
    subject: config.subject,
  };
}

export function getVapidConfig() {
  return assertVapidConfig();
}
