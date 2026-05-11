"use client";
import { useEffect } from "react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

async function subscribeToPush(reg: ServiceWorkerRegistration) {
  if (!VAPID_PUBLIC_KEY) return;
  try {
    const existing = await reg.pushManager.getSubscription();
    const sub = existing ?? await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sub.toJSON()),
    });
  } catch {
    // silently ignore (e.g. browser doesn't support push)
  }
}

async function scheduleLocalNotifications(sw: ServiceWorker) {
  try {
    const res = await fetch("/api/agendamentos");
    if (!res.ok) return;
    const agendamentos = await res.json();
    sw.postMessage({ type: "SCHEDULE_NOTIFICATIONS", agendamentos });
  } catch {
    // silently ignore
  }
}

async function waitForActiveWorker(reg: ServiceWorkerRegistration): Promise<ServiceWorker> {
  if (reg.active) return reg.active;
  return new Promise((resolve) => {
    const sw = reg.installing ?? reg.waiting;
    if (!sw) { resolve(reg.active!); return; }
    sw.addEventListener("statechange", function handler() {
      if (sw.state === "activated") {
        sw.removeEventListener("statechange", handler);
        resolve(sw);
      }
    });
  });
}

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let interval: ReturnType<typeof setInterval> | null = null;

    navigator.serviceWorker.register("/sw.js").then(async (reg) => {
      if (Notification.permission === "default") {
        await Notification.requestPermission();
      }

      if (Notification.permission === "granted") {
        await subscribeToPush(reg);

        const sw = await waitForActiveWorker(reg);
        scheduleLocalNotifications(sw);
      }

      // Re-agenda a cada 5 min e quando app volta ao foco
      const reSchedule = async () => {
        const r = await navigator.serviceWorker.getRegistration();
        if (r?.active && Notification.permission === "granted") {
          scheduleLocalNotifications(r.active);
        }
      };

      interval = setInterval(reSchedule, 5 * 60 * 1000);
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") reSchedule();
      });
    }).catch(() => {});

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  return null;
}
