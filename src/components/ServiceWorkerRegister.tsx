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

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").then(async (reg) => {
      // Pede permissão de notificação
      if (Notification.permission === "default") {
        await Notification.requestPermission();
      }

      if (Notification.permission === "granted") {
        // Push server-side (app fechado)
        await subscribeToPush(reg);

        // Fallback local (app aberto)
        const sw = reg.active || reg.installing || reg.waiting;
        if (sw) scheduleLocalNotifications(sw);
      }

      // Re-agenda fallback local a cada hora
      const interval = setInterval(async () => {
        const r = await navigator.serviceWorker.getRegistration();
        if (r?.active) scheduleLocalNotifications(r.active);
      }, 60 * 60 * 1000);

      return () => clearInterval(interval);
    }).catch(() => {});
  }, []);

  return null;
}
