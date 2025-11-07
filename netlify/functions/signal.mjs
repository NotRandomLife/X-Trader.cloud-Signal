import { getStore } from "@netlify/blobs";

export default async (req) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization,content-type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Content-Type": "application/json"
  };
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const expected = process.env.BOT_TOKEN || "MIO_TOKEN_BOT";
  const store = getStore("xtrader-signals"); // spazio KV persistente

  if (req.method === "POST") {
    if (token !== expected) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: cors });
    const body = await req.json().catch(() => ({}));
    const record = {
      signal: (body.signal || "hold").toLowerCase(),
      pair: body.pair || "BTCUSDC",
      at: new Date().toISOString()
    };
    await store.setJSON("last", record);
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: cors });
  }

  if (req.method === "GET") {
    const last = (await store.get("last", { type: "json" })) || null;
    return new Response(JSON.stringify(last), { status: 200, headers: cors });
  }

  return new Response(JSON.stringify({ error: "method_not_allowed" }), { status: 405, headers: cors });
};
