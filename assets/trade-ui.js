
// X-TRADER — Trading UI for /<lang>/bot.html ONLY
(function(){
  const LANG = (document.documentElement.lang || 'en').toLowerCase();
  const TALL = {
    en:{ title:"Auto-Trade (Margin)", apiKey:"API Key", secretKey:"API Secret", symbol:"Pair", leverage:"Leverage", orderPct:"Order %", slPct:"Stop Loss %", tpPct:"Take Profit %", mode:"Mode", cross:"Cross", isolated:"Isolated", autoBorrow:"Auto-Borrow", autoRepay:"Auto-Repay", save:"Save", saved:"Saved", on:"ON", off:"OFF", enable:"Enable", disable:"Disable", status:"Status", idle:"Idle", listening:"Listening", lastSignal:"Last signal", connect:"Start", stop:"Stop", logs:"Action log" },
    it:{ title:"Auto-Trade (Margine)", apiKey:"API Key", secretKey:"API Secret", symbol:"Coppia", leverage:"Leva", orderPct:"Ordine %", slPct:"Stop Loss %", tpPct:"Take Profit %", mode:"Modalità", cross:"Cross", isolated:"Isolato", autoBorrow:"Auto-Prestito", autoRepay:"Auto-Rimborso", save:"Salva", saved:"Salvato", on:"ON", off:"OFF", enable:"Abilita", disable:"Disabilita", status:"Stato", idle:"In attesa", listening:"In ascolto", lastSignal:"Ultimo segnale", connect:"Avvia", stop:"Ferma", logs:"Log azioni" },
    es:{ title:"Auto-Trading (Margen)", apiKey:"Clave API", secretKey:"Secreto API", symbol:"Par", leverage:"Apalancamiento", orderPct:"Orden %", slPct:"Stop Loss %", tpPct:"Take Profit %", mode:"Modo", cross:"Cruzado", isolated:"Aislado", autoBorrow:"Auto-Préstamo", autoRepay:"Auto-Reembolso", save:"Guardar", saved:"Guardado", on:"ON", off:"OFF", enable:"Activar", disable:"Desactivar", status:"Estado", idle:"En espera", listening:"Escuchando", lastSignal:"Última señal", connect:"Iniciar", stop:"Detener", logs:"Registro de acciones" },
    fr:{ title:"Auto-Trade (Marge)", apiKey:"Clé API", secretKey:"Secret API", symbol:"Paire", leverage:"Levier", orderPct:"Ordre %", slPct:"Stop Loss %", tpPct:"Take Profit %", mode:"Mode", cross:"Croisé", isolated:"Isolé", autoBorrow:"Auto-Emprunt", autoRepay:"Auto-Remboursement", save:"Enregistrer", saved:"Enregistré", on:"ON", off:"OFF", enable:"Activer", disable:"Désactiver", status:"Statut", idle:"En attente", listening:"À l’écoute", lastSignal:"Dernier signal", connect:"Démarrer", stop:"Arrêter", logs:"Journal d’actions" },
    de:{ title:"Auto-Trade (Margin)", apiKey:"API-Schlüssel", secretKey:"API-Secret", symbol:"Paar", leverage:"Hebel", orderPct:"Order %", slPct:"Stop Loss %", tpPct:"Take Profit %", mode:"Modus", cross:"Cross", isolated:"Isoliert", autoBorrow:"Auto-Leihen", autoRepay:"Auto-Rückzahlung", save:"Speichern", saved:"Gespeichert", on:"AN", off:"AUS", enable:"Aktivieren", disable:"Deaktivieren", status:"Status", idle:"Leerlauf", listening:"Lauscht", lastSignal:"Letztes Signal", connect:"Start", stop:"Stopp", logs:"Aktionslog" },
    pt:{ title:"Auto-Trade (Margem)", apiKey:"Chave API", secretKey:"Segredo API", symbol:"Par", leverage:"Alavancagem", orderPct:"Ordem %", slPct:"Stop Loss %", tpPct:"Take Profit %", mode:"Modo", cross:"Cruzado", isolated:"Isolado", autoBorrow:"Auto-Empréstimo", autoRepay:"Auto-Reembolso", save:"Salvar", saved:"Salvo", on:"ON", off:"OFF", enable:"Ativar", disable:"Desativar", status:"Status", idle:"Inativo", listening:"Ouvindo", lastSignal:"Último sinal", connect:"Iniciar", stop:"Parar", logs:"Log de ações" },
    nl:{ title:"Auto-Trade (Marge)", apiKey:"API-sleutel", secretKey:"API-geheim", symbol:"Paar", leverage:"Hefboom", orderPct:"Order %", slPct:"Stop Loss %", tpPct:"Take Profit %", mode:"Modus", cross:"Cross", isolated:"Geïsoleerd", autoBorrow:"Auto-Lenen", autoRepay:"Auto-Terugbetalen", save:"Opslaan", saved:"Opgeslagen", on:"AAN", off:"UIT", enable:"Inschakelen", disable:"Uitschakelen", status:"Status", idle:"Idle", listening:"Luistert", lastSignal:"Laatste signaal", connect:"Start", stop:"Stop", logs:"Actielog" },
    pl:{ title:"Auto-Trade (Margin)", apiKey:"Klucz API", secretKey:"Sekret API", symbol:"Para", leverage:"Dźwignia", orderPct:"Zlecenie %", slPct:"Stop Loss %", tpPct:"Take Profit %", mode:"Tryb", cross:"Cross", isolated:"Izolowany", autoBorrow:"Auto-Pożyczka", autoRepay:"Auto-Spłata", save:"Zapisz", saved:"Zapisano", on:"ON", off:"OFF", enable:"Włącz", disable:"Wyłącz", status:"Status", idle:"Bezczynny", listening:"Nasłuch", lastSignal:"Ostatni sygnał", connect:"Start", stop:"Stop", logs:"Dziennik działań" },
    ru:{ title:"Автотрейд (Маржа)", apiKey:"API ключ", secretKey:"API секрет", symbol:"Пара", leverage:"Плечо", orderPct:"Ордер %", slPct:"Стоп-лосс %", tpPct:"Тейк-профит %", mode:"Режим", cross:"Кросс", isolated:"Изолир.", autoBorrow:"Авто-заём", autoRepay:"Авто-погашение", save:"Сохранить", saved:"Сохранено", on:"ВКЛ", off:"ВЫКЛ", enable:"Включить", disable:"Выключить", status:"Статус", idle:"Ожидание", listening:"Прослушивание", lastSignal:"Последний сигнал", connect:"Старт", stop:"Стоп", logs:"Журнал действий" },
    tr:{ title:"Oto-Ticaret (Marjin)", apiKey:"API Anahtarı", secretKey:"API Sırrı", symbol:"Parite", leverage:"Kaldıraç", orderPct:"Emir %", slPct:"Stop Loss %", tpPct:"Take Profit %", mode:"Mod", cross:"Çapraz", isolated:"İzole", autoBorrow:"Oto-Borç", autoRepay:"Oto-Geri ödeme", save:"Kaydet", saved:"Kaydedildi", on:"AÇIK", off:"KAPALI", enable:"Etkinleştir", disable:"Devre dışı", status:"Durum", idle:"Boşta", listening:"Dinlemede", lastSignal:"Son sinyal", connect:"Başlat", stop:"Durdur", logs:"İşlem günlüğü" },
    uk:{ title:"Автотрейд (Маржа)", apiKey:"Ключ API", secretKey:"Секрет API", symbol:"Пара", leverage:"Плече", orderPct:"Ордер %", slPct:"Стоп-лосс %", tpPct:"Тейк-профіт %", mode:"Режим", cross:"Крос", isolated:"Ізоль.", autoBorrow:"Авто-позика", autoRepay:"Авто-погашення", save:"Зберегти", saved:"Збережено", on:"УВІМК", off:"ВИМК", enable:"Увімкнути", disable:"Вимкнути", status:"Статус", idle:"Очікування", listening:"Прослуховування", lastSignal:"Останній сигнал", connect:"Пуск", stop:"Стоп", logs:"Журнал дій" },
    ar:{ title:"تداول تلقائي (هامش)", apiKey:"مفتاح API", secretKey:"سر API", symbol:"زوج", leverage:"رافعة", orderPct:"نسبة الأمر %", slPct:"إيقاف خسارة %", tpPct:"جني ربح %", mode:"الوضع", cross:"متقاطع", isolated:"معزول", autoBorrow:"اقتراض تلقائي", autoRepay:"سداد تلقائي", save:"حفظ", saved:"تم الحفظ", on:"تشغيل", off:"إيقاف", enable:"تفعيل", disable:"تعطيل", status:"الحالة", idle:"خامل", listening:"استماع", lastSignal:"آخر إشارة", connect:"بدء", stop:"إيقاف", logs:"سجل الإجراءات" },
    hi:{ title:"ऑटो-ट्रेड (मार्जिन)", apiKey:"API कुंजी", secretKey:"API सीक्रेट", symbol:"पेयर", leverage:"लेवरेज", orderPct:"ऑर्डर %", slPct:"स्टॉप लॉस %", tpPct:"टेक प्रॉफिट %", mode:"मोड", cross:"क्रॉस", isolated:"आइसोलेटेड", autoBorrow:"ऑटो-बोरो", autoRepay:"ऑटो-रीपे", save:"सेव", saved:"सेव्ड", on:"ON", off:"OFF", enable:"एनेबल", disable:"डिसेबल", status:"स्टेटस", idle:"निष्क्रिय", listening:"सुन रहा", lastSignal:"आखिरी सिग्नल", connect:"स्टार्ट", stop:"स्टॉप", logs:"कार्रवाई लॉग" },
    id:{ title:"Auto-Trade (Margin)", apiKey:"Kunci API", secretKey:"Rahasia API", symbol:"Pair", leverage:"Leverage", orderPct:"Order %", slPct:"Stop Loss %", tpPct:"Take Profit %", mode:"Mode", cross:"Silang", isolated:"Terisolasi", autoBorrow:"Auto-Pinjam", autoRepay:"Auto-Lunas", save:"Simpan", saved:"Tersimpan", on:"ON", off:"OFF", enable:"Aktifkan", disable:"Nonaktifkan", status:"Status", idle:"Idle", listening:"Mendengar", lastSignal:"Sinyal terakhir", connect:"Mulai", stop:"Stop", logs:"Log aksi" },
    ja:{ title:"オートトレード（マージン）", apiKey:"APIキー", secretKey:"APIシークレット", symbol:"銘柄", leverage:"レバレッジ", orderPct:"注文 %", slPct:"ストップロス %", tpPct:"テイクプロフィット %", mode:"モード", cross:"クロス", isolated:"アイソレ", autoBorrow:"自動借入", autoRepay:"自動返済", save:"保存", saved:"保存済み", on:"ON", off:"OFF", enable:"有効化", disable:"無効化", status:"ステータス", idle:"待機", listening:"待受", lastSignal:"最新シグナル", connect:"開始", stop:"停止", logs:"アクションログ" },
    ko:{ title:"자동 거래 (마진)", apiKey:"API 키", secretKey:"API 시크릿", symbol:"페어", leverage:"레버리지", orderPct:"주문 %", slPct:"스탑로스 %", tpPct:"테이크프로핏 %", mode:"모드", cross:"크로스", isolated:"격리", autoBorrow:"자동 대출", autoRepay:"자동 상환", save:"저장", saved:"저장됨", on:"ON", off:"OFF", enable:"활성화", disable:"비활성화", status:"상태", idle:"대기", listening:"청취", lastSignal:"최근 신호", connect:"시작", stop:"중지", logs:"작업 로그" },
    vi:{ title:"Tự động giao dịch (Ký quỹ)", apiKey:"Khóa API", secretKey:"Bí mật API", symbol:"Cặp", leverage:"Đòn bẩy", orderPct:"Lệnh %", slPct:"Cắt lỗ %", tpPct:"Chốt lời %", mode:"Chế độ", cross:"Chéo", isolated:"Cô lập", autoBorrow:"Tự vay", autoRepay:"Tự trả", save:"Lưu", saved:"Đã lưu", on:"BẬT", off:"TẮT", enable:"Bật", disable:"Tắt", status:"Trạng thái", idle:"Nhàn", listening:"Nghe", lastSignal:"Tín hiệu cuối", connect:"Bắt đầu", stop:"Dừng", logs:"Nhật ký hành động" },
    zh:{ title:"自动交易（杠杆）", apiKey:"API 密钥", secretKey:"API 密码", symbol:"交易对", leverage:"杠杆", orderPct:"下单 %", slPct:"止损 %", tpPct:"止盈 %", mode:"模式", cross:"全仓", isolated:"逐仓", autoBorrow:"自动借贷", autoRepay:"自动还款", save:"保存", saved:"已保存", on:"开", off:"关", enable:"启用", disable:"停用", status:"状态", idle:"空闲", listening:"监听中", lastSignal:"最新信号", connect:"开始", stop:"停止", logs:"操作日志" }
  };
  const T = TALL[LANG] || TALL['en'];

  // Only mount on /bot.html pages
  if(!/\/bot\.html(\?|#|$)/.test(location.pathname)) return;

  function el(tag, attrs={}, children=[]){
    const e = document.createElement(tag);
    for(const [k,v] of Object.entries(attrs)){
      if(k==='class') e.className=v;
      else if(k==='text') e.textContent=v;
      else e.setAttribute(k, v);
    }
    for(const c of children) e.appendChild(c);
    return e;
  }
  function row(label, id, type="text", ph=""){
    return el('div', {}, [
      el('div', {class:'xtr-label', text: label}),
      el('input', {class:'xtr-input', id, type, placeholder: ph})
    ]);
  }
  function select(label, id, options){
    const sel = el('select', {class:'xtr-input', id});
    for(const [v,txt] of options) sel.appendChild(el('option', {value:v, text:txt}));
    return el('div', {}, [ el('div', {class:'xtr-label', text: label}), sel ]);
  }
  function styleTag(){
    const css = `
      .xtr-card{background:#101825;border:1px solid #1e293b;border-radius:16px;padding:12px}
      .xtr-label{font-size:12px;color:#94a3b8;margin-bottom:2px}
      .xtr-input{background:#0b1220;border:1px solid #334155;border-radius:10px;padding:8px 10px;width:100%;color:#e2e8f0}
      .xtr-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
      .xtr-btn{background:#1f2937;border:1px solid #334155;border-radius:12px;padding:8px 14px;color:#e5e7eb}
      .xtr-btn:hover{background:#334155}
      .xtr-kv{display:flex;justify-content:space-between;font-size:12px;color:#94a3b8;margin-top:6px}
      .xtr-logs{background:#0b1220;border:1px solid #334155;border-radius:12px; padding:10px; height:420px; overflow:auto; font: 12px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace; color:#e5e7eb}
      .xtr-logs .muted{color:#94a3b8}
    `;
    const s = document.createElement('style'); s.textContent = css; return s;
  }

  // Container
  function mount(){
    const target = document.getElementById('trade-ui');
    if(!target) return;
    const grid = el('div', {class:'grid grid-cols-1 md:grid-cols-2 gap-4'});
    const panel = el('div', {class:'xtr-card', id:'xtr-trade-panel'});
    const logs  = el('div', {class:'xtr-card'});
    logs.appendChild(el('div', {class:'flex items-center justify-between mb-2'}, [
      el('h3', {class:'font-bold', text: T.logs}),
      el('span', {class:'text-xs text-slate-400 muted', id:'xtr-log-count', text:"0"})
    ]));
    const logBox = el('div', {class:'xtr-logs', id:'xtr-logs'});
    logs.appendChild(logBox);

    panel.appendChild(styleTag());
    panel.appendChild(el('div', {class:'flex items-center justify-between mb-2'}, [
      el('h3', {class:'font-bold', text: T.title}),
      el('span', {class:'text-xs text-slate-400', id:'xtr-status', text: T.idle})
    ]));
    panel.appendChild(el('div', {class:'xtr-grid'}, [
      row(T.apiKey, 'xtr-api-key'),
      row(T.secretKey, 'xtr-api-secret'),
      row(T.symbol, 'xtr-symbol', 'text', 'BTCUSDC'),
      row(T.leverage, 'xtr-leverage', 'number', '9'),
      row(T.orderPct, 'xtr-order-pct', 'number', '25'),
      row(T.slPct, 'xtr-sl-pct', 'number', '0.8'),
      row(T.tpPct, 'xtr-tp-pct', 'number', '0'),
      select(T.mode, 'xtr-mode', [['cross', T.cross], ['isolated', T.isolated]]),
      select('', 'xtr-borrow', [['TRUE', T.autoBorrow], ['FALSE', T.autoRepay]])
    ]));
    const ctrl = el('div', {class:'flex items-center justify-between mt-2'}, [
      el('button', {id:'xtr-save', class:'xtr-btn', text: T.save}),
      el('label', {class:'flex items-center gap-2 cursor-pointer'}, [
        el('input', {type:'checkbox', id:'xtr-autotrade'}),
        el('span', {text: T.enable})
      ])
    ]);
    panel.appendChild(ctrl);
    panel.appendChild(el('div', {class:'xtr-kv'}, [ el('span',{text:T.lastSignal}), el('span',{id:'xtr-last', text:'-'}) ]));

    grid.appendChild(panel);
    grid.appendChild(logs);
    target.innerHTML = "";
    target.appendChild(grid);

    return { logBox };
  }

  // Logging
  function now(){ return new Date().toISOString().replace('T',' ').replace('Z',''); }
  function loadLogs(){ try{ return JSON.parse(localStorage.getItem('xtr.logs')||'[]'); }catch{ return []; } }
  function saveLogs(arr){ try{ localStorage.setItem('xtr.logs', JSON.stringify(arr.slice(-200))); }catch(e){} }
  function writeLog(line){
    const box = document.getElementById('xtr-logs'); if(!box) return;
    const arr = loadLogs(); arr.push(line); saveLogs(arr);
    box.innerHTML = arr.slice(-200).map(x=>`<div>${x}</div>`).join("");
    const cnt = document.getElementById('xtr-log-count'); if(cnt) cnt.textContent = String(arr.length);
    box.scrollTop = box.scrollHeight;
  }
  function log(msg){ writeLog(`<span class="muted">${now()}</span> — ${msg}`); }

  // Config
  const LSKEY = 'xtr.settings.v1';
  function loadCfg(){ try{ return JSON.parse(localStorage.getItem(LSKEY)||'{}'); }catch(e){ return {}; } }
  function saveCfg(cfg){ localStorage.setItem(LSKEY, JSON.stringify(cfg)); return true; }

  function cfgFromInputs(){
    return {
      api_key: document.getElementById('xtr-api-key').value.trim(),
      api_secret: document.getElementById('xtr-api-secret').value.trim(),
      symbol: (document.getElementById('xtr-symbol').value.trim()||'BTCUSDC').toUpperCase(),
      leverage: Number(document.getElementById('xtr-leverage').value||9),
      order_pct: Number(document.getElementById('xtr-order-pct').value||25),
      sl_pct: Number(document.getElementById('xtr-sl-pct').value||0.8),
      tp_pct: Number(document.getElementById('xtr-tp-pct').value||0),
      margin_mode: document.getElementById('xtr-mode').value,
      auto_borrow: document.getElementById('xtr-borrow').value==='TRUE',
      auto_repay: document.getElementById('xtr-borrow').value!=='TRUE'
    };
  }
  function fillInputs(cfg){
    document.getElementById('xtr-api-key').value = cfg.api_key||'';
    document.getElementById('xtr-api-secret').value = cfg.api_secret||'';
    document.getElementById('xtr-symbol').value = (cfg.symbol||'BTCUSDC').toUpperCase();
    document.getElementById('xtr-leverage').value = cfg.leverage||9;
    document.getElementById('xtr-order-pct').value = cfg.order_pct||25;
    document.getElementById('xtr-sl-pct').value = cfg.sl_pct ?? 0.8;
    document.getElementById('xtr-tp-pct').value = cfg.tp_pct ?? 0;
    document.getElementById('xtr-mode').value = (cfg.margin_mode||'cross');
    document.getElementById('xtr-borrow').value = (cfg.auto_borrow?'TRUE':'FALSE');
    document.getElementById('xtr-autotrade').checked = !!cfg.autotrade;
  }

  // Polling & actions
  let lastSignalId = null;
  async function poll(){
    try{
      const res = await fetch('/.netlify/functions/latest');
      if(!res.ok) throw new Error('net');
      const data = await res.json();
      const at = data?.at || null;
      const sig = (data?.signal||'hold').toLowerCase();
      document.getElementById('xtr-last').textContent = sig.toUpperCase() + (at?` @ ${at}`:'');
      const cfg = loadCfg();
      if(cfg.autotrade && at && at!==lastSignalId){
        log(`Signal: <b>${sig.toUpperCase()}</b> (${at})`);
        await actOnSignal(sig, cfg);
        lastSignalId = at;
      }
    }catch(e){ log(`Error latest: ${String(e)}`); }
    setTimeout(poll, 4000);
  }
  function getState(){ try{ return JSON.parse(localStorage.getItem('xtr.state')||'{}'); }catch{ return {}; } }
  function setState(s){ localStorage.setItem('xtr.state', JSON.stringify(s)); }

  async function actOnSignal(sig, cfg){
    const st = getState();
    const last = st.last || null;
    if(sig==='hold'){ log('HOLD — no action'); return; }
    if(last && ((last==='buy' && sig==='sell') || (last==='sell' && sig==='buy'))){
      try{
        log('Closing opposite position…');
        const r = await fetch('/api/trade', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ...cfg, action:'close', side: sig })});
        const j = await r.json().catch(()=>({}));
        log('Close result: ' + (r.ok ? 'OK' : 'ERR') + ' ' + JSON.stringify(j));
      }catch(e){ log('Close error: ' + String(e)); }
    }
    try{
      log(`Opening ${sig.toUpperCase()}…`);
      const r = await fetch('/api/trade', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ...cfg, action:'open', side: sig==='buy'?'BUY':'SELL' })});
      const j = await r.json().catch(()=>({}));
      log('Open result: ' + (r.ok ? 'OK' : 'ERR') + ' ' + JSON.stringify(j));
      setState({ last: sig });
    }catch(e){ log('Open error: ' + String(e)); }
  }

  // Boot
  document.addEventListener('DOMContentLoaded', ()=>{
    const m = mount(); if(!m) return;
    const cfg0 = loadCfg(); fillInputs(cfg0);
    // Events
    document.getElementById('xtr-save').addEventListener('click', ()=>{
      const cfg = Object.assign({}, loadCfg(), cfgFromInputs());
      saveCfg(cfg);
      log('Saved settings');
      const btn = document.getElementById('xtr-save');
      const old = btn.textContent; btn.textContent = T.saved; setTimeout(()=> btn.textContent = old, 800);
    });
    document.getElementById('xtr-autotrade').addEventListener('change', (e)=>{
      const cfg = Object.assign({}, loadCfg(), { autotrade: !!e.target.checked });
      saveCfg(cfg);
      document.getElementById('xtr-status').textContent = cfg.autotrade ? T.listening : T.idle;
      log('Auto-Trade: ' + (cfg.autotrade ? 'ON' : 'OFF'));
    });
    // Load persisted logs
    const existing = (function(){ try{ return JSON.parse(localStorage.getItem('xtr.logs')||'[]'); }catch{ return []; } })();
    if(existing.length){
      const box = document.getElementById('xtr-logs');
      box.innerHTML = existing.map(x=>`<div>${x}</div>`).join("");
      document.getElementById('xtr-log-count').textContent = String(existing.length);
      box.scrollTop = box.scrollHeight;
    }
    poll();
  });
})();
