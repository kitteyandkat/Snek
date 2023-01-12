window.onload = function() {
    document.getElementById("themeSong").play();
}

function hideElements(x){
 setTimeout(()=>x.style.display= "none", 500)
}

let startScreen = document.querySelector('.startScreen')
function enterGame() {
    startScreen.classList.toggle('fade');
    setTimeout(hideElements(startScreen), 1000)
  }

// autoplay on chrome maybe?
//src="https://unpkg.com/pixi.js/dist/browser/pixi.min.js"

// // <!-- found here, if not using CDN "./node_modules/@pixi/sound/dist/pixi-sound.js" -->
// // <script src="https://unpkg.com/@pixi/sound/dist/pixi-sound.js"></script>

// PIXI.sound.add('themeSong', 'HeatleyBros - HeatleyBros II - 06 8 Bit Adventure.mp3"');
//     PIXI.sound.play('themeSong');
//     PIXI.sound.add('themeSong', 'HeatleyBros - HeatleyBros II - 06 8 Bit Adventure.mp3"');
//     PIXI.sound.play('themeSong');
