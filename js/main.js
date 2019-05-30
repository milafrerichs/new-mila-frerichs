window.onload = function() {
  document.getElementById('menu').addEventListener('click', function() {
    var menu = document.querySelector("#menu-items");
    menu.classList.toggle("hidden");
    menu.classList.toggle("block");
  });
}
