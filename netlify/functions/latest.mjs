import { getStore } from "@netlify/blobs";

export default async () => {
  const cors = { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" };
  const store = getStore("xtrader-signals");
  const last = (await store.get("last", { type: "json" })) || null;
  return new Response(JSON.stringify(last), { status: 200, headers: cors });
};

