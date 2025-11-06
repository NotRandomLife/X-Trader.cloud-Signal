import { getStore } from "@netlify/blobs";

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "no-store"
};

export default async () => {
  const store = getStore({ name: "xtrader-signals", consistency: "strong" });
  const raw = await store.get("signals"); // string | null
  const body = raw || JSON.stringify({ history: [] });
  return new Response(body, { status: 200, headers });
};

export const config = { path: "/api/latest" };
