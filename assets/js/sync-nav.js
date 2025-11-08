(function(){
  function cloneHeaderToFooter(){
    var header = document.querySelector('header');
    if(!header) return;
    var navH = header.querySelector('nav');
    var navF = document.querySelector('footer nav');
    if(!navF) return;

    // Clone menu items 1:1
    if(navH){
      navF.innerHTML = navH.innerHTML;
    }

    // Clone brand anchor (logo + X TRADER)
    var brand = header.querySelector('a[href="./"], a[href="index.html"]');
    if(brand){
      var brandClone = brand.cloneNode(true);
      // make brand smaller in footer on mobile
      var img = brandClone.querySelector('img');
      if(img){ img.style.height = '24px'; img.style.width='auto'; }
      // insert brand before nav content
      var wrap = navF.parentElement;
      if(wrap){
        // Create a flex container if not already
        wrap.style.display = 'flex';
        wrap.style.flexWrap = 'wrap';
        wrap.style.gap = '8px';
        wrap.style.alignItems = 'center';
        wrap.style.justifyContent = 'center';
        wrap.insertBefore(brandClone, navF);
      }
    }
  }
  if (document.readyState === 'complete') { setTimeout(cloneHeaderToFooter, 0); }
  window.addEventListener('load', function(){ setTimeout(cloneHeaderToFooter, 0); });
})();