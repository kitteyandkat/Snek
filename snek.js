window.onload = function() {
    document.getElementById("themeSong").play();
}

let startScreen = document.getElementById('.startScreen');
let startButton = document.getElementsByClassName('btn')

startButton.onclick = function () {
  startScreen.classList.toggle('fade');
}