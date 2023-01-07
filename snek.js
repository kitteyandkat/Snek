window.onload = function() {
    document.getElementById("themeSong").play();
}

let startScreen = document.querySelector('.startScreen')

function enterGame() {
    startScreen.classList.toggle('fade');
  }