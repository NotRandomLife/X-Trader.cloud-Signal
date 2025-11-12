
(function(){
  var LANGS = ["en","it","es","fr","de","nl","pt","pl","ru","uk","tr","ja","ko","zh","hi","id","ar","vi"];

  function detectLangAndBase(){
    var pathname = (location.pathname||"/");
    var segs = pathname.split("/").filter(Boolean);
    var langSeg=null, idx=-1;
    for (var i=0;i<segs.length;i++){
      var s=segs[i].toLowerCase();
      if (LANGS.indexOf(s)>=0){ langSeg=s; idx=i; break; }
    }
    var base="/";
    if (idx>0){
      base="/"+segs.slice(0,idx).join("/")+"/";
    } else if (idx===0){
      base="/";
    } else {
      var htmlLang=(document.documentElement.lang||"").toLowerCase();
      if (LANGS.indexOf(htmlLang)>=0) langSeg=htmlLang;
      else throw new Error("Cannot detect language from URL or <html lang>. Path="+pathname);
    }
    return {lang:langSeg, base:base};
  }

  function killLangDropdownsIfEnglish(lang){
    if (lang !== "en") return;
    try{
      var scopes = document.querySelectorAll("header, nav, .navbar, .header");
      scopes.forEach(function(scope){
        // Remove any native <select> elements
        scope.querySelectorAll("select").forEach(function(s){ s.remove(); });
        // Remove common custom dropdown containers
        scope.querySelectorAll("[id*='lang'],[class*='lang'],[data-lang],[data-language]").forEach(function(el){
          // keep the simple link back to home (id=langBtn) if present
          if (el.id === "langBtn") return;
          // if it's a select-like or has role combobox/listbox, remove
          var role = el.getAttribute("role")||"";
          if (el.tagName === "SELECT" || /combobox|listbox/i.test(role) || /select|dropdown/i.test(el.className)){
            el.remove();
          }
        });
      });
    }catch(e){}
  }

  async function loadDict(lang, base){
    var url=(window.I18N_BASE||(base+"i18n/"))+lang+".json";
    var res=await fetch(url,{cache:"no-store"});
    if(!res.ok) throw new Error("i18n load failed "+res.status+" @ "+url);
    return await res.json();
  }

  function apply(dict, lang){
    document.querySelectorAll("[data-i18n]").forEach(function(el){
      var k=el.getAttribute("data-i18n");
      if(!(k in dict)) throw new Error("Missing i18n key: "+k+" in "+lang);
      el.textContent=dict[k];
    });
    document.querySelectorAll("[data-i18n-attr]").forEach(function(el){
      var map=el.getAttribute("data-i18n-attr");
      if(!map) return;
      map.split(";").forEach(function(pair){
        var bits=pair.split(":");
        if(bits.length!==2) return;
        var attr=bits[0].trim(), key=bits[1].trim();
        if(!(key in dict)) throw new Error("Missing i18n key: "+key+" in "+lang);
        el.setAttribute(attr, dict[key]);
      });
    });
  }

  (function init(){
    var cfg=detectLangAndBase();
    killLangDropdownsIfEnglish(cfg.lang);
    // If dictionaries exist, they will be applied (pages already have some data-i18n)
    loadDict(cfg.lang, cfg.base)
      .then(function(dict){ apply(dict, cfg.lang); })
      .catch(function(err){
        // If i18n folder not present, skip silently (no fallback text injection)
        console.warn("[i18n] non-blocking:", err.message);
      });
  })();
})();
