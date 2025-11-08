
import crypto from "crypto";

const BINANCE_BASE = "https://api.binance.com";

function qs(params){ return new URLSearchParams(params).toString(); }
function signQuery(query, secret){
  return crypto.createHmac('sha256', secret).update(query).digest('hex');
}
async function binancePublic(path, params={}){
  const url = `${BINANCE_BASE}${path}?${qs(params)}`;
  const r = await fetch(url);
  if(!r.ok) throw new Error(`HTTP ${r.status} ${path}`);
  return r.json();
}
async function binanceSigned(method, path, params, apiKey, secret){
  const p = { ...params, timestamp: Date.now(), recvWindow: 5000 };
  const query = qs(p);
  const sig = signQuery(query, secret);
  const url = `${BINANCE_BASE}${path}?${query}&signature=${sig}`;
  const r = await fetch(url, { method, headers: { 'X-MBX-APIKEY': apiKey } });
  const txt = await r.text();
  if(!r.ok){
    throw new Error(`HTTP ${r.status} ${path} -> ${txt}`);
  }
  try { return JSON.parse(txt); } catch { return { raw: txt }; }
}

// Helpers
function parseSymbolParts(symbol){
  // crude split for quote assets commonly used
  const knownQuotes = ["USDT","USDC","BUSD","FDUSD","TUSD","EUR","BTC","ETH"];
  for(const q of knownQuotes){
    if(symbol.endsWith(q)) return { base: symbol.slice(0, -q.length), quote: q };
  }
  // fallback: last 4 as quote
  return { base: symbol.slice(0,-4), quote: symbol.slice(-4) };
}

async function getExchangeFilters(symbol){
  const info = await binancePublic("/api/v3/exchangeInfo", { symbol });
  const s = info.symbols && info.symbols[0];
  if(!s) throw new Error("exchangeInfo missing symbol");
  const filters = {};
  for(const f of s.filters){
    filters[f.filterType] = f;
  }
  return filters;
}
function clampQuantity(qty, filters, price){
  let q = qty;
  const lot = filters["LOT_SIZE"];
  if(lot){
    const step = parseFloat(lot.stepSize);
    const minQ = parseFloat(lot.minQty);
    const precision = Math.max(0, Math.round(-Math.log10(step)));
    q = Math.floor(q / step) * step;
    q = parseFloat(q.toFixed(precision));
    if(q < minQ) return 0;
  }
  const minNot = filters["MIN_NOTIONAL"];
  if(minNot){
    const minNotional = parseFloat(minNot.minNotional || minNot.notional);
    if(price*q < minNotional) return 0;
  }
  return q;
}

async function getMaxBorrowable(asset, isolatedSymbol, apiKey, secret){
  // For cross margin omit isolatedSymbol; for isolated include it
  const params = isolatedSymbol ? { asset, isolatedSymbol } : { asset };
  return await binanceSigned("GET", "/sapi/v1/margin/maxBorrowable", params, apiKey, secret);
}

async function placeStopLoss({ symbol, side, quantity, stopPrice, isIsolated, apiKey, secret }){
  // STOP_LOSS (limit) or STOP_LOSS_MARKET (market). We'll use STOP_LOSS to be explicit and clamp quantity.
  const params = {
    symbol,
    side, // SELL for long, BUY for short
    type: "STOP_LOSS",
    quantity: quantity,
    stopPrice: stopPrice,
    timeInForce: "GTC",
    isIsolated: isIsolated ? "TRUE" : "FALSE",
    newClientOrderId: `xtrader-sl-${Date.now()}`
  };
  return await binanceSigned("POST", "/sapi/v1/margin/order", params, apiKey, secret);
}

export default async (req) => {
  const cors = { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json", "Access-Control-Allow-Headers": "content-type" };
  if(req.method === "OPTIONS"){
    return new Response("", { status: 204, headers: cors });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), { status: 405, headers: cors });
  }
  try{
    const body = await req.json();
    const {
      api_key, api_secret, symbol: rawSym,
      leverage, order_pct, sl_pct, tp_pct,
      margin_mode, auto_borrow, auto_repay,
      action, side
    } = body || {};

    if(!api_key || !api_secret) throw new Error("missing_api_keys");
    const symbol = (rawSym||"BTCUSDC").toUpperCase();
    const { base, quote } = parseSymbolParts(symbol);
    const isIsolated = (String(margin_mode||"cross").toLowerCase() === "isolated");

    // Get price & filters
    const ticker = await binancePublic("/api/v3/ticker/price", { symbol });
    const price = parseFloat(ticker.price);
    const filters = await getExchangeFilters(symbol);

    // Compute target size (rough): use free + maxBorrowable with AUTO_BORROW to estimate buying power
    const pct = Math.max(0.1, Math.min(100, Number(order_pct||10))) / 100.0;
    const maxBorrowQ = await getMaxBorrowable(quote, isIsolated ? symbol : undefined, api_key, api_secret).catch(()=>({ amount: 0 }));
    const maxBorrowB = await getMaxBorrowable(base,  isIsolated ? symbol : undefined, api_key, api_secret).catch(()=>({ amount: 0 }));
    const borrowQuote = Number(maxBorrowQ.amount || 0);
    const borrowBase  = Number(maxBorrowB.amount || 0);

    // NOTE: We cannot read your exact free balances safely without extra signed calls + per-asset pricing;
    // to keep it robust with AUTO_BORROW we size from borrowable side only (conservative).
    const targetNotional = Math.max(1, pct * (borrowQuote || (price * borrowBase) || 100)); // ensure >=1 quote unit
    const targetQty = targetNotional / price;

    const sideEffectOpen = auto_borrow ? "AUTO_BORROW" : "NO_SIDE_EFFECT";
    const sideEffectClose = auto_repay ? "AUTO_REPAY" : "NO_SIDE_EFFECT";

    if(action === "open"){
      let resOpen;
      if((side||"").toLowerCase() === "buy"){
        // BUY market using quoteOrderQty
        const params = {
          symbol,
          side: "BUY",
          type: "MARKET",
          quoteOrderQty: targetNotional.toFixed(6),
          isIsolated: isIsolated ? "TRUE":"FALSE",
          sideEffectType: sideEffectOpen,
          newClientOrderId: `xtrader-open-${Date.now()}`
        };
        resOpen = await binanceSigned("POST", "/sapi/v1/margin/order", params, api_key, api_secret);
        // compute filled qty
        const executedQty = parseFloat(resOpen.executedQty || resOpen.origQty || 0);
        const entryAvg = executedQty ? (parseFloat(resOpen.cummulativeQuoteQty||0)/executedQty) : price;
        // place SL
        if(sl_pct){
          const stopPrice = (entryAvg * (1 - (Number(sl_pct)/100)));
          const qtyForSL = clampQuantity(executedQty, filters, price);
          if(qtyForSL>0){
            await placeStopLoss({ symbol, side: "SELL", quantity: qtyForSL, stopPrice: stopPrice.toFixed(6), isIsolated, apiKey: api_key, secret: api_secret });
          }
        }
        return new Response(JSON.stringify({ ok:true, open: resOpen }), { status:200, headers:cors });
      } else if((side||"").toLowerCase() === "sell"){
        // SELL market using quantity
        let qty = clampQuantity(targetQty, filters, price);
        if(qty <= 0) throw new Error("quantity_below_min");
        const params = {
          symbol,
          side: "SELL",
          type: "MARKET",
          quantity: qty.toString(),
          isIsolated: isIsolated ? "TRUE":"FALSE",
          sideEffectType: sideEffectOpen,
          newClientOrderId: `xtrader-open-${Date.now()}`
        };
        resOpen = await binanceSigned("POST", "/sapi/v1/margin/order", params, api_key, api_secret);
        const executedQty = parseFloat(resOpen.executedQty || params.quantity);
        const entryAvg = executedQty ? (parseFloat(resOpen.cummulativeQuoteQty||0)/executedQty) : price;
        if(sl_pct){
          const stopPrice = (entryAvg * (1 + (Number(sl_pct)/100)));
          const qtyForSL = clampQuantity(executedQty, filters, price);
          if(qtyForSL>0){
            await placeStopLoss({ symbol, side: "BUY", quantity: qtyForSL, stopPrice: stopPrice.toFixed(6), isIsolated, apiKey: api_key, secret: api_secret });
          }
        }
        return new Response(JSON.stringify({ ok:true, open: resOpen }), { status:200, headers:cors });
      } else {
        throw new Error("invalid_side_for_open");
      }
    }

    if(action === "close"){
      // Close by market in opposite direction with AUTO_REPAY if requested
      // We estimate quantity similarly; in practice, you may want to query open debt or orders and close exactly.
      let qty = clampQuantity(targetQty, filters, price);
      if(qty <= 0) throw new Error("quantity_below_min");
      const sideClose = "BUY"; // default for short
      const paramsSell = {
        symbol, side:"SELL", type:"MARKET", quantity: qty.toString(),
        isIsolated: isIsolated ? "TRUE":"FALSE", sideEffectType: sideEffectClose,
        newClientOrderId: `xtrader-close-${Date.now()}`
      };
      const paramsBuy = {
        symbol, side:"BUY", type:"MARKET",
        isIsolated: isIsolated ? "TRUE":"FALSE", sideEffectType: sideEffectClose,
        // If we have qty, buy base; otherwise fallback to quoteOrderQty
        quantity: qty.toString(),
        newClientOrderId: `xtrader-close-${Date.now()}`
      };
      // Heuristic: if last open was BUY, we need SELL to close; if last open was SELL, we need BUY.
      let resClose;
      if((side||"").toLowerCase()==="buy"){
        // closing a long position => SELL
        resClose = await binanceSigned("POST", "/sapi/v1/margin/order", paramsSell, api_key, api_secret);
      } else if((side||"").toLowerCase()==="sell"){
        // closing a short position => BUY
        resClose = await binanceSigned("POST", "/sapi/v1/margin/order", paramsBuy, api_key, api_secret);
      } else {
        // If side unknown, default to both attempts: try SELL then BUY small
        try { resClose = await binanceSigned("POST", "/sapi/v1/margin/order", paramsSell, api_key, api_secret); }
        catch { resClose = await binanceSigned("POST", "/sapi/v1/margin/order", paramsBuy, api_key, api_secret); }
      }
      return new Response(JSON.stringify({ ok:true, close: resClose }), { status:200, headers:cors });
    }

    if(action === "hold"){
      // No-op here. Your Python bot can optionally adjust SL/TP if in profit.
      return new Response(JSON.stringify({ ok:true, hold:true }), { status:200, headers:cors });
    }

    return new Response(JSON.stringify({ error:"invalid_action" }), { status:400, headers:cors });
  }catch(e){
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: cors });
  }
};
