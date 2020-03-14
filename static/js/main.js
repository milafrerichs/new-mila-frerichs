function addLoadEvent(func) {
  var oldonload = window.onload;
  if (typeof window.onload != 'function') {
    window.onload = func;
  } else {
    window.onload = function() {
      if (oldonload) {
        oldonload();
      }
      func();
    }
  }
}

addLoadEvent(function () {
  var menuEl = document.getElementById('menu');
  if(menuEl) {
    menuEl.addEventListener('click', function() {
      var menu = document.querySelector("#menu-items");
      menu.classList.toggle("hidden");
      menu.classList.toggle("block");
    });
  }
});
