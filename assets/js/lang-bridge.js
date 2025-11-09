
(function(){
  // Source of truth for active language
  window.getActiveLang = function(){
    const I = window.I18N || {};
    const pref = localStorage.getItem('lang');
    const nav  = (navigator.language || 'en').toLowerCase();
    const html = (document.documentElement && document.documentElement.lang || 'en').toLowerCase();
    if (pref && I[pref]) return pref;
    if (I[nav]) return nav;
    const baseNav = (nav.split('-')[0]||'en');
    if (I[baseNav]) return baseNav;
    if (I[html]) return html;
    const baseHtml = (html.split('-')[0]||'en');
    if (I[baseHtml]) return baseHtml;
    return 'en';
  };

  // Patch setLang to broadcast a global event every time user changes language
  var _origSetLang = window.setLang;
  window.setLang = function(l){
    if (typeof _origSetLang === 'function') { _origSetLang(l); }
    var lang = (l && (window.I18N||{})[l]) ? l : window.getActiveLang();
    try {
      window.dispatchEvent(new CustomEvent('xtr:langchange', { detail: { lang: lang }}));
    } catch(e){
      // IE fallback (not needed here)
    }
  };

  // Also broadcast on DOMContentLoaded so late scripts can sync
  document.addEventListener('DOMContentLoaded', function(){
    var lang = window.getActiveLang();
    try { window.dispatchEvent(new CustomEvent('xtr:langchange', { detail:{ lang: lang }})); } catch(e){}
  });
})();
