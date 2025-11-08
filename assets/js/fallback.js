
(function(){
  function ensureLangSelect(){
    var header = document.querySelector('header');
    var sel = document.getElementById('langSelect');
    if(!sel){
      sel = document.createElement('select');
      sel.id = 'langSelect';
      sel.className = 'bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-sm';
      var wrap = document.createElement('div');
      wrap.style.marginLeft = 'auto';
      wrap.appendChild(sel);
      if(header){ header.appendChild(wrap); }
      else { document.body.insertBefore(wrap, document.body.firstChild); }
    }
    return sel;
  }
  function initI18N(){
    var I = window.I18N || {};
    var pref = localStorage.getItem('lang');
    var lang = pref || 'en';
    if(!I[lang]) lang = 'en';
    function t(k){ return (I[lang] && I[lang][k]) || k; }
    function apply(){
      document.querySelectorAll('[data-i18n]').forEach(function(el){
        var k = el.getAttribute('data-i18n');
        var v = t(k);
        if(typeof v === 'string') el.textContent = v;
      });
    }
    var sel = ensureLangSelect();
    sel.innerHTML='';
    Object.keys(I).forEach(function(code){
      var opt = document.createElement('option');
      opt.value = code;
      opt.textContent = (I[code] && I[code].lang_name) ? I[code].lang_name : code;
      if(code === lang) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.onchange = function(){
      lang = sel.value; localStorage.setItem('lang', lang); apply();
    };
    apply();
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initI18N);
  }else{
    initI18N();
  }
})();
