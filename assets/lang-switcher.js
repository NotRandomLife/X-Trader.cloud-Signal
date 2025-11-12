
(function(){
  function onReady(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  onReady(()=>{
    const sel = document.getElementById('langSelect');
    if(!sel) return;
    // Build options if empty
    if(sel.options && sel.options.length<2){
      const langs = ['en','it','es','fr','de','pt','nl','pl','ru','uk','ar','hi','id','ja','ko','vi','tr','zh'];
      for(const l of langs){
        const o = document.createElement('option');
        o.value = l; o.textContent = l.toUpperCase();
        sel.appendChild(o);
      }
    }
    // Set current
    const parts = location.pathname.split('/').filter(Boolean);
    const lang = parts[0] && parts[0].length<=3 ? parts[0] : (document.documentElement.lang||'en');
    if(sel.value !== lang) sel.value = lang;
    // Navigate maintaining page path
    sel.addEventListener('change', (e)=>{
      const to = e.target.value;
      const file = (parts.length>1 ? parts.slice(1).join('/') : 'index.html');
      const target = `/${to}/${file}`;
      location.href = target;
    });
  });
})();
