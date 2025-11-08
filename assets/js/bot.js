(function(){
  const UI = {
    apiKey:  document.getElementById('apiKey'),
    secret:  document.getElementById('secretKey'),
    symbol:  document.getElementById('symbol'),
    leverage:document.getElementById('leverage'),
    sl:      document.getElementById('slPct'),
    tp:      document.getElementById('tpPct'),
    lock:    document.getElementById('lockPass'),
    save:    document.getElementById('saveBtn'),
    start:   document.getElementById('startBtn'),
    stop:    document.getElementById('stopBtn'),
    log:     document.getElementById('log'),
    lastSig: document.getElementById('last-signal'),
    pos:     document.getElementById('position'),
    tPrice:  document.getElementById('ticker-price'),
    tChange: document.getElementById('ticker-change'),
    tTime:   document.getElementById('ticker-time'),
    tSym:    document.getElementById('ticker-symbol'),
  };

  const CONFIG = {
    SIGNAL_URL: '/api/signal/latest',
    TRADE_URL:  '/api/trade/execute',
    CLOSE_URL:  '/api/trade/close',
    STORAGE_KEY: 'xtrader_bot_settings_v1'
  };

  function log(msg){
    UI.log.textContent += `[${new Date().toLocaleTimeString()}] ${msg}\n`;
    UI.log.scrollTop = UI.log.scrollHeight;
  }

  // AES-GCM utilities for optional local encryption
  async function deriveKey(password){
    const enc = new TextEncoder();
    const baseKey = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
    const salt = enc.encode('xtrader-salt');
    return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:100000,hash:'SHA-256'}, baseKey, {name:'AES-GCM',length:256}, false, ['encrypt','decrypt']);
  }
  async function encryptJson(obj, password){
    const key = await deriveKey(password);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const data = new TextEncoder().encode(JSON.stringify(obj));
    const ct = await crypto.subtle.encrypt({name:'AES-GCM',iv}, key, data);
    return {iv: Array.from(iv), ct: Array.from(new Uint8Array(ct))};
  }
  async function decryptJson(payload, password){
    const key = await deriveKey(password);
    const iv = new Uint8Array(payload.iv);
    const ct = new Uint8Array(payload.ct);
    const pt = await crypto.subtle.decrypt({name:'AES-GCM',iv}, key, ct);
    return JSON.parse(new TextDecoder().decode(pt));
  }

  async function saveSettings(){
    const obj = {
      apiKey: UI.apiKey.value.trim(),
      secret: UI.secret.value.trim(),
      symbol: UI.symbol.value.trim(),
      leverage: parseInt(UI.leverage.value,10)||1,
      slPct: parseFloat(UI.sl.value)||0.8,
      tpPct: parseFloat(UI.tp.value)||0.8
    };
    if (UI.lock.value){
      const encrypted = await encryptJson(obj, UI.lock.value);
      localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify({enc:true, data: encrypted}));
    }else{
      localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify({enc:false, data: obj}));
    }
    log('✅ Impostazioni salvate localmente.');
  }

  async function loadSettings(){
    const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
    if(!raw) return;
    const wrap = JSON.parse(raw);
    let obj = wrap.data;
    if (wrap.enc){
      if (!UI.lock.value){ log('🔒 Imposta la password per caricare le chiavi.'); return; }
      try{ obj = await decryptJson(wrap.data, UI.lock.value); }
      catch(e){ log('❌ Password errata.'); return; }
    }
    UI.apiKey.value = obj.apiKey || '';
    UI.secret.value = obj.secret || '';
    UI.symbol.value = obj.symbol || 'BTCUSDC';
    UI.leverage.value = obj.leverage || 1;
    UI.sl.value = obj.slPct ?? 0.8;
    UI.tp.value = obj.tpPct ?? 0.8;
    UI.tSym.textContent = UI.symbol.value;
  }

  async function updateTicker(){
    try{
      const sym = UI.symbol.value || 'BTCUSDC';
      const r = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${encodeURIComponent(sym)}`, {cache:'no-store'});
      if(!r.ok) throw new Error('ticker http');
      const j = await r.json();
      UI.tPrice.textContent = Number(j.lastPrice).toLocaleString(undefined,{maximumFractionDigits:2});
      UI.tChange.textContent = (Number(j.priceChangePercent)).toFixed(2) + '%';
      UI.tChange.style.color = (Number(j.priceChangePercent) >= 0) ? '#22c55e' : '#ef4444';
      UI.tTime.textContent = new Date().toLocaleTimeString();
    }catch(e){
      UI.tTime.textContent = new Date().toLocaleTimeString();
    }
  }
  setInterval(updateTicker, 5000);

  function msToNextFive(){
    const now = new Date();
    const m = now.getUTCMinutes();
    const next = Math.ceil((m+1)/5)*5;
    const toMin = ((next%60) - m + 60) % 60;
    const sec = now.getUTCSeconds();
    const ms = now.getUTCMilliseconds();
    return (toMin*60*1000) + (1000 - sec*1000 - ms);
  }

  async function pollSignalOnce(){
    try{
      const r = await fetch(CONFIG.SIGNAL_URL, {cache:'no-store'});
      if(!r.ok) return;
      const j = await r.json();
      if(!j || !j.signal) return;
      UI.lastSig.textContent = String(j.signal).toUpperCase();
      log('Segnale: ' + j.signal);
      if(j.signal === 'hold') return;
      await actOnSignal(j.signal);
    }catch(e){
      log('❌ Errore fetch segnale.');
    }
  }

  function buildPayload(signal){
    return {
      symbol: UI.symbol.value || 'BTCUSDC',
      signal,
      leverage: parseInt(UI.leverage.value,10)||1,
      sl_pct: parseFloat(UI.sl.value)||0.8,
      tp_pct: parseFloat(UI.tp.value)||0.8,
      creds: { api_key: UI.apiKey.value, secret_key: UI.secret.value }
    };
  }

  async function actOnSignal(signal){
    try{
      const body = buildPayload(signal);
      const r = await fetch(CONFIG.TRADE_URL, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(body)
      });
      if(!r.ok){ log('❌ Errore esecuzione ordine (HTTP).'); return; }
      const j = await r.json();
      if(j && j.status === 'ok'){
        UI.pos.textContent = j.position || 'flat';
        log(`✔ Ordine eseguito. Posizione: ${j.position} | entry: ${j.entry} | SL: ${j.sl} | TP: ${j.tp}`);
      }else{
        log('⚠️ Risposta server non OK.');
      }
    }catch(e){ log('❌ Errore chiamata trade.'); }
  }

  let timer=null;
  async function startLoop(){
    await loadSettings();
    updateTicker();
    clearTimeout(timer);
    const tick = async () => { await pollSignalOnce(); timer = setTimeout(tick, msToNextFive()); };
    log('⏳ In attesa del prossimo multiplo di 5 minuti...');
    timer = setTimeout(tick, msToNextFive());
  }
  function stopLoop(){ clearTimeout(timer); timer=null; log('⏹️ Bot fermato.'); }

  UI.save.addEventListener('click', saveSettings);
  UI.start.addEventListener('click', startLoop);
  UI.stop.addEventListener('click', stopLoop);

  loadSettings();
  updateTicker();
})();