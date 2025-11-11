
(function(){
  const $=(s,p=document)=>p.querySelector(s), $$=(s,p=document)=>[...p.querySelectorAll(s)];
  const I=window.I18N||{}; const pref=localStorage.getItem('lang'); const nav=(navigator.language||'en').toLowerCase();
  let lang=pref|| (I[nav] ? nav : (I[nav?.split('-')[0]] ? nav.split('-')[0] : 'en'));
  function T(k){ return (I[lang]&&I[lang][k])||(I['en']&&I['en'][k])||k; }

  function el(tag, attrs={}, children=[]){
    const e=document.createElement(tag);
    Object.entries(attrs).forEach(([k,v])=>{
      if(k==='class') e.className=v;
      else if(k==='html') e.innerHTML=v;
      else e.setAttribute(k,v);
    });
    children.forEach(c=> e.appendChild(typeof c==='string'? document.createTextNode(c) : c));
    return e;
  }

  function ui(){
    const form = el('form',{id:'tradeForm', class:'space-y-2'});
    const row = (label, input)=>el('div',{class:'flex flex-col gap-1'},[
      el('label',{class:'text-xs text-slate-400'},[label]), input
    ]);

    const api = el('input',{id:'apiKey', type:'text', class:'w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700', placeholder:'xxxxxxxx'});
    const sec = el('input',{id:'apiSecret', type:'password', class:'w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700', placeholder:'********'});
    const sym = el('input',{id:'symbol', type:'text', class:'w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700', value:(localStorage.getItem('sym')||'BTCUSDC')});
    const lev = el('input',{id:'leverage', type:'number', step:'1', min:'1', max:'20', class:'w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700', value:(localStorage.getItem('lev')||'9')});
    const pct = el('input',{id:'orderPct', type:'number', step:'0.1', min:'0.1', max:'100', class:'w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700', value:(localStorage.getItem('pct')||'20')});
    const sl  = el('input',{id:'sl', type:'number', step:'0.01', min:'0.01', max:'50', class:'w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700', value:(localStorage.getItem('sl')||'0.8')});
    const tp  = el('input',{id:'tp', type:'number', step:'0.01', min:'0.01', max:'200', class:'w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700', value:(localStorage.getItem('tp')||'0.8')});
    const url = el('input',{id:'tradeUrl', type:'text', class:'w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700', value:(localStorage.getItem('tradeUrl')||'http://localhost:5010/trade')});
    const iso = el('select',{id:'marginMode', class:'w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700'},[
      el('option',{value:'cross'},['Cross']),
      el('option',{value:'isolated'},['Isolated'])
    ]);
    iso.value = localStorage.getItem('mmode')||'cross';
    const borrow = el('input',{id:'autoBorrow', type:'checkbox', checked: (localStorage.getItem('autoBorrow')!=='0')});
    const repay  = el('input',{id:'autoRepay',  type:'checkbox', checked: (localStorage.getItem('autoRepay')!=='0')});
    const remember = el('input',{id:'remember', type:'checkbox', checked:(localStorage.getItem('remember')==='1')});
    const log = el('div',{id:'log', class:'text-xs text-slate-400 space-y-1'});

    function saveConfig(){
      localStorage.setItem('sym', sym.value.trim().toUpperCase());
      localStorage.setItem('lev', lev.value);
      localStorage.setItem('pct', pct.value);
      localStorage.setItem('sl', sl.value);
      localStorage.setItem('tp', tp.value);
      localStorage.setItem('mmode', iso.value);
            localStorage.setItem('autoBorrow', borrow.checked ? '1' : '0');
      localStorage.setItem('autoRepay', repay.checked ? '1' : '0');
      localStorage.setItem('remember', remember.checked ? '1' : '0');
      if(remember.checked){
        localStorage.setItem('apiKey', api.value);
        localStorage.setItem('apiSecret', sec.value);
      }else{
        localStorage.removeItem('apiKey'); localStorage.removeItem('apiSecret');
      }
    }

    // Prefill keys if user opted to remember
    if(localStorage.getItem('remember')==='1'){
      api.value=localStorage.getItem('apiKey')||'';
      sec.value=localStorage.getItem('apiSecret')||'';
    }

    form.append(
      row(T('api_key'), api),
      row(T('api_secret'), sec),
      row(T('symbol'), sym),
      row(T('leverage'), lev),
      row(T('order_pct'), pct),
      row(T('stop_loss_pct'), sl),
      row(T('take_profit_pct'), tp),
      row(T('margin_mode'), iso),
      el('label',{class:'flex items-center gap-2 text-xs'},[borrow, el('span',{},[T('auto_borrow')])]),
      el('label',{class:'flex items-center gap-2 text-xs'},[repay,  el('span',{},[T('auto_repay')])]),
      el('label',{class:'flex items-center gap-2 text-xs'},[remember, el('span',{},[T('remember_locally')])]),
    );

    const btnStart = el('button',{type:'button', id:'startBtn', class:'w-full btn bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2'},[T('start_autotrade')]);
    const btnStop  = el('button',{type:'button', id:'stopBtn',  class:'w-full btn bg-slate-700 hover:bg-slate-600 text-white rounded-xl py-2 hidden'},[T('stop_autotrade')]);
    const status   = el('div',{id:'status', class:'text-xs text-slate-300'},[T('status_idle')]);
    form.append(btnStart, btnStop, status, log);

    function logLine(txt){ const p=el('p',{},[txt]); log.appendChild(p); log.scrollTop=log.scrollHeight; }

    let timer=null, running=false, lastSignalId='', position=null;

    async function fetchJSON(u){ const r=await fetch(u,{cache:'no-store'}); if(!r.ok) throw new Error('HTTP '+r.status); return r.json(); }
    function now(){ return new Date(); }
    function msToNext5min(){
      const d=new Date();
      const next = new Date(d.getTime());
      const m = d.getMinutes();
      const nextMin = m + (5 - (m % 5));
      next.setMinutes(nextMin, 0, 50)
      return next.getTime() - d.getTime();
    }

    async function getSignal(){
      const base = location.origin;
      const urlLatest = base + '/api/latest';
      try {
        const s = await fetchJSON(urlLatest);
        // normalized shape: {pair, signal, timestamp}
        if(!s || !s.signal){ status.textContent=T('no_signal_yet'); return null; }
        s.pair = (s.pair||sym.value||'BTCUSDC').toUpperCase();
        s.signal = (s.signal||'').toLowerCase();
        return s;
      } catch(e){
        status.textContent=T('err_fetch_signal')+': '+e.message;
        return null;
      }
    }

    async function postTrade(payload){
      const endpoint = '/api/trade';
      try {
        const r = await fetch(endpoint, {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify(payload)
        });
        const txt = await r.text();
        if(!r.ok){ throw new Error('HTTP '+r.status+': '+txt); }
        logLine(T('trade_sent'));
        return txt;
      } catch(e){
        logLine(T('err_trade')+': '+e.message);
        throw e;
      }
    }

    function buildPayload(s){
      // s.signal is 'buy' | 'sell' | 'hold'
      const payload = {
        api_key: api.value.trim(),
        api_secret: sec.value.trim(),
        symbol: sym.value.trim().toUpperCase(),
        leverage: Number(lev.value||'1'),
        order_pct: Number(pct.value||'10'),
        sl_pct: Number(sl.value||'0.8'),
        tp_pct: Number(tp.value||'0.8'),
        margin_mode: iso.value, // 'cross' | 'isolated'
        auto_borrow: !!borrow.checked,
        auto_repay:  !!repay.checked,
        hold_action: 'update_sl_tp_if_profit',
        source: 'X-Trader.cloud',
        t: Date.now()
      };
      if(s.signal==='buy' || s.signal==='sell'){
        payload.action = 'open';
        payload.side = s.signal;
      }else{
        payload.action = 'hold';
        payload.side = null;
      }
      return payload;
    }

    async function tick(){
      try{
        const s = await getSignal();
        if(!s){ return; }
        const id = (s.signal||'') + '|' + (s.timestamp||'');
        if(id===lastSignalId){ status.textContent=T('status_waiting'); return; }
        lastSignalId = id;

        status.textContent = T('status_signal') + ': ' + (s.signal||'').toUpperCase();

        if(!running) return;

        // Local "position" memory to avoid duplicate opens; backend is the source of truth.
        if(s.signal==='hold'){
          const payload = buildPayload(s);
          logLine(T('acting_hold'));
          saveConfig();
          await postTrade(payload);
          return;
        }

        // If we have a local position and signal is same, do nothing
        if(position && position===s.signal){
          logLine(T('same_signal_skip'));
          return;
        }

        // If opposite, send 'close' first
        if(position && ((position==='buy' && s.signal==='sell')||(position==='sell'&& s.signal==='buy'))){
          const payloadClose = buildPayload(s);
          payloadClose.action='close';
          payloadClose.side=null;
          logLine(T('closing_position'));
          saveConfig();
          await postTrade(payloadClose);
          position=null;
          // fallthrough to open new
        }

        // Open new if BUY/SELL
        if(s.signal==='buy' || s.signal==='sell'){
          const payloadOpen = buildPayload(s);
          payloadOpen.action='open';
          payloadOpen.side=s.signal;
          logLine(T('opening_position')+' '+s.signal.toUpperCase());
          saveConfig();
          await postTrade(payloadOpen);
          position=s.signal;
          return;
        }
      }catch(e){
        // already logged
      }
    }

    function start(){
      if(running) return;
      running=true;
      btnStart.classList.add('hidden'); btnStop.classList.remove('hidden');
      status.textContent=T('status_running');
      // align to 5-minute boundary precisely
      const first = msToNext5min();
      logLine(T('next_tick_in')+' '+Math.round(first/1000)+'s');
      timer = setTimeout(()=>{
        tick();
        timer = setInterval(tick, 5*60*1000);
      }, first);
    }
    function stop(){
      running=false;
      if(timer){ clearTimeout(timer); clearInterval(timer); timer=null; }
      btnStop.classList.add('hidden'); btnStart.classList.remove('hidden');
      status.textContent=T('status_idle');
    }

    btnStart.addEventListener('click', start);
    btnStop.addEventListener('click', stop);

    return el('div',{class:'space-y-3'},[form]);
  }

  function mount(){
    const mountPoint = document.getElementById('trade-ui') || document.querySelector('main .container') || document.querySelector('main');
    if(!mountPoint) return;
    mountPoint.innerHTML='';
    // Title + subtitle
    mountPoint.appendChild(el('div',{class:'space-y-2'},[
      el('h1',{class:'text-lg font-semibold'},[T('auto_bot_title')]),
      el('p',{class:'text-xs text-slate-400'},[T('auto_bot_sub')])
    ]));
    const card = el('div',{class:'card rounded-2xl p-3'},[ ui() ]);
    mountPoint.appendChild(card);
  }

  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', mount); }
  else{ mount(); }
})();
