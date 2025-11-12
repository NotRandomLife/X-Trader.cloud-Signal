
(function(){
  const $=(s,p=document)=>p.querySelector(s), $$=(s,p=document)=>[...p.querySelectorAll(s)];
  const I=window.I18N||{};
  const pref = localStorage.getItem('lang');
  const htmlLang = (document.documentElement.lang||'').toLowerCase();
  const pathLang = (location.pathname.split('/').filter(Boolean)[0]||'').toLowerCase();
  let lang = (I[pathLang]?pathLang:(I[htmlLang]?htmlLang:(I[pref]?pref:'en')));
  document.documentElement.lang = lang;
  function T(k){return (I[lang]&&I[lang][k])||(I['en']&&I['en'][k])||k;}
  function apply(){ $$('[data-i18n]').forEach(el=>{ el.textContent=T(el.getAttribute('data-i18n')); }); document.documentElement.lang=lang; const sel=$('#langSelect'); if(sel) sel.value=lang; }
  window.setLang=function(l){ if(I[l]){ lang=l; localStorage.setItem('lang',l); apply(); } };
  document.addEventListener('DOMContentLoaded',()=>{
    const sel=$('#langSelect'); if(sel){ sel.innerHTML=Object.keys(I).map(k=>`<option value="${k}">${I[k].lang_name||k}</option>`).join(''); sel.value=lang; sel.onchange=e=>setLang(e.target.value); }
    apply();
    const list=$('#signals'); if(!list) return;
    async function fetchJSON(u){ const r=await fetch(u,{cache:'no-store'}); if(!r.ok) throw new Error('HTTP '+r.status); return r.json(); }
    function render(arr){ list.innerHTML=''; if(!arr||!arr.length){ const p=document.createElement('p'); p.className='text-slate-400 text-sm'; p.textContent=T('no_data'); list.appendChild(p); return; }
      arr.slice(0,5).forEach(s=>{ const d=new Date(s.timestamp); const el=document.createElement('div'); el.className='card rounded-xl p-2';
        el.innerHTML=`<div class="flex items-center justify-between">
          <div><p class="text-sm text-slate-400">${T('pair')}</p><p class="font-semibold">${s.pair}</p></div>
          <div class="text-right"><p class="text-sm text-slate-400">${T('signal')}</p><p class="font-semibold">${(s.signal||'').toUpperCase()}</p></div>
        </div><p class="text-xs text-slate-400 mt-2">${isFinite(d)?d.toLocaleString():(s.timestamp||'')}</p>`;
        list.appendChild(el);
      });
    }
    async function load(){ const err=$('#err'); err.textContent=''; try{ const data=await fetchJSON('/api/latest'); let items=[]; if(Array.isArray(data)) items=data; else if(data?.history) items=data.history; else if(data?.pair&&data?.signal) items=[data]; render(items);}catch(e){ err.textContent=T('error_loading')+': '+(e.message||e); } }
    $('#refresh')?.addEventListener('click',load);
    function schedule(){ const n=new Date(); const m=n.getMinutes()%5; const wait=((5-m)%5)*60000-(n.getSeconds()*1000+n.getMilliseconds());
      setTimeout(()=>{ load(); const GRACE=2e4,STEP=2e3; const end=Date.now()+GRACE; const id=setInterval(()=>{load(); if(Date.now()>=end) clearInterval(id);},STEP);
        setInterval(()=>{ load(); const end2=Date.now()+GRACE; const id2=setInterval(()=>{load(); if(Date.now()>=end2) clearInterval(id2);},STEP); },300000);
      }, Math.max(0, wait));
    }
    load(); schedule();
  });
})();

function t(key){return (I[lang]&&I[lang][key])||key}
function applyI18n(){document.querySelectorAll('[data-i18n]').forEach(el=>{const k=el.getAttribute('data-i18n'); const v=t(k); if(v) el.textContent=v})}
function fillLangOptions(){const sel=document.getElementById('langSelect'); if(!sel) return; sel.innerHTML=''; Object.entries(I).forEach(([code,obj])=>{const opt=document.createElement('option'); opt.value=code; opt.textContent=obj.lang_name||code; if(code===lang) opt.selected=true; sel.appendChild(opt)}); sel.addEventListener('change',()=>{lang=sel.value; localStorage.setItem('lang',lang); applyI18n();})}
document.addEventListener('DOMContentLoaded',()=>{fillLangOptions(); applyI18n();});


(function(){
  var I = window.I18N || {};
  var pref = localStorage.getItem('lang'); 
  var lang = pref || 'en'; 
  if(!I[lang]) lang = 'en';
  function t(k){ return (I[lang] && I[lang][k]) || k; }
  function ensureSelect(){
    var sel = document.getElementById('langSelect');
    if(!sel){
      var header = document.querySelector('header');
      sel = document.createElement('select');
      sel.id='langSelect';
      sel.className='bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-sm';
      var wrap = document.createElement('div');
      wrap.style.marginLeft='auto';
      wrap.appendChild(sel);
      if(header) header.appendChild(wrap); else document.body.insertBefore(wrap, document.body.firstChild);
    }
    return sel;
  }
  function applyI18n(){
    document.querySelectorAll('[data-i18n]').forEach(function(el){
      var k = el.getAttribute('data-i18n');
      var v = t(k);
      if(typeof v === 'string') el.textContent = v;
    });
  }
  function fillLangOptions(){
    var sel = ensureSelect();
    sel.innerHTML='';
    Object.keys(I).forEach(function(code){
      var opt = document.createElement('option');
      opt.value = code;
      opt.textContent = (I[code] && I[code].lang_name) ? I[code].lang_name : code;
      if(code === lang) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.onchange = function(){
      lang = sel.value; localStorage.setItem('lang', lang); applyI18n();
    };
  }
  function init(){ fillLangOptions(); applyI18n(); }
  if(document.readyState === 'loading'){ document.addEventListener('DOMContentLoaded', init); } else { init(); }
  // expose helpers if needed elsewhere
  window.__i18nApply = applyI18n;
})();
