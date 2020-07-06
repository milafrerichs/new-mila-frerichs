var script = document.createElement('script');
script.src = "https://cdn.metrical.xyz/script.js";
document.body.append(script);
window.metrical = {
  "app": "5ardjg6ou"
};
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
    };
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
window.addEventListener('scroll', function() {
  if(window.pageYOffset > 100) {
    document.querySelector('body').classList.add("scroll")
  } else {
    document.querySelector('body').classList.remove("scroll")
  }
});
