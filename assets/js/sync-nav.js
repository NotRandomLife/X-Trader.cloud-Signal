(function(){
  function cloneNav(){
    var h = document.querySelector('header nav');
    var f = document.querySelector('footer nav');
    if(!h || !f) return;
    // Copy exact HTML so footer == header (order, classes, icons)
    f.innerHTML = h.innerHTML;
  }
  // Run after page fully ready (translations applied)
  if (document.readyState === 'complete') { setTimeout(cloneNav, 0); }
  window.addEventListener('load', function(){ setTimeout(cloneNav, 0); });
})();