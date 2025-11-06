import { getStore } from "@netlify/blobs";

const commonHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Cache-Control": "no-store"
};

export default async (req) => {
  if (req.method === "OPTIONS") return new Response("", { status: 204, headers: commonHeaders });
  if (req.method !== "POST")   return new Response("Method Not Allowed", { status: 405, headers: commonHeaders });

  const auth = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const okToken = Netlify.env.get("SIGNAL_TOKEN");
  if (!okToken || auth !== okToken) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: commonHeaders });
  }

  let payload = {};
  try { payload = await req.json(); } catch (_) {}
  const pair = String(payload.pair || "BTCUSDC").toUpperCase();
  const signal = String(payload.signal || "HOLD").toUpperCase();
  const entry = { pair, signal, timestamp: new Date().toISOString() };

  const store = getStore({ name: "xtrader-signals", consistency: "strong" });
  let current = {};
  try {
    const raw = await store.get("signals");
    if (raw) current = JSON.parse(raw);
  } catch (_) {}

  const history = Array.isArray(current.history) ? [entry, ...current.history].slice(0, 50) : [entry];
  const out = { ...entry, history };

  await store.set("signals", JSON.stringify(out));

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: commonHeaders });
};

export const config = { path: "/api/signal" };
