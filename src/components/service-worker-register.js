"use client";

import { useEffect } from "react";
import { registerQueueServiceWorker } from "@/lib/register-sw";

export function ServiceWorkerRegister() {
  useEffect(() => {
    registerQueueServiceWorker();
  }, []);
  return null;
}
