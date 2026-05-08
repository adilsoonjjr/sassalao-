const CACHE = "sassalao-v2";

const STATIC = [
  "/",
  "/login",
  "/dashboard",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(STATIC)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  if (e.request.url.includes("/api/")) return;

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// ── Push server-side (VAPID) ──────────────────────────────────────────────────
self.addEventListener("push", (e) => {
  let data = { title: "Sassalão", body: "Lembrete de agendamento", url: "/agendamentos", whatsappUrl: null };
  try { data = { ...data, ...e.data.json() }; } catch {}

  const actions = [{ action: "agenda", title: "Ver agenda" }];
  if (data.whatsappUrl) actions.push({ action: "whatsapp", title: "Enviar WhatsApp" });

  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: "sassalao-lembrete",
      renotify: true,
      actions,
      data: { url: data.url, whatsappUrl: data.whatsappUrl },
    })
  );
});

// ── Fallback: agenda local quando app está aberto ─────────────────────────────
const pendingTimers = new Map();

self.addEventListener("message", (e) => {
  if (e.data?.type !== "SCHEDULE_NOTIFICATIONS") return;

  for (const t of pendingTimers.values()) clearTimeout(t);
  pendingTimers.clear();

  const now = Date.now();

  for (const ag of (e.data.agendamentos || [])) {
    const [y, m, d] = ag.data.split("T")[0].split("-").map(Number);
    const [h, min] = ag.horario.split(":").map(Number);
    const agDateTime = new Date(y, m - 1, d, h, min).getTime();
    const notifyAt = agDateTime - 30 * 60 * 1000;
    const delay = notifyAt - now;

    if (delay < 0 || delay > 24 * 60 * 60 * 1000) continue;

    const timer = setTimeout(() => {
      self.registration.showNotification("Sassalão – Lembrete", {
        body: `${ag.clienteNome} às ${ag.horario} — ${ag.servico}`,
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        tag: ag.id,
        data: { url: "/agendamentos" },
      });
    }, delay);

    pendingTimers.set(ag.id, timer);
  }
});

// ── Clique na notificação ─────────────────────────────────────────────────────
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const { url, whatsappUrl } = e.notification.data || {};
  const target = (e.action === "whatsapp" && whatsappUrl) ? whatsappUrl : (url || "/agendamentos");

  e.waitUntil(
    clients.matchAll({ type: "window" }).then((cs) => {
      // WhatsApp abre externamente — sempre openWindow
      if (target.startsWith("https://wa.me")) {
        clients.openWindow(target);
        return;
      }
      for (const c of cs) {
        if (c.url.includes(self.location.origin)) { c.focus(); c.navigate(target); return; }
      }
      clients.openWindow(target);
    })
  );
});
