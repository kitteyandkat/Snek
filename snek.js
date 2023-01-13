let canvas = document.querySelector(".game")

window.onload = function () {
  document.getElementById("themeSong").play();
  canvas.style.display = "none"
}

function hideElements(x) {
  setTimeout(() => x.style.display = "none", 500)
}

let startScreen = document.querySelector('.startScreen')
function enterGame() {
  startScreen.classList.toggle('fade');
  setTimeout(hideElements(startScreen), 1000);
  canvas.style.display = "flex"

}

const ctx = canvas.getContext('2d')

let snakeSpeed = 2;
let tileCount = 40
let tileSize = canvas.width / tileCount - 2;

let headX = 3;
let headY = 4;

let horizontalDirection = 0;
let verticalDirection = 0;

//Set up game loop
function drawGame() {
  // clear screen to start with blank game
  clearScreen();
  //snake keyboard movements
  moveSnake();
  //call the draw snake function
  drawSnake();
  //how often screen gets updated
  setTimeout(drawGame, 1000 / speed);
}
function clearScreen() {
  //use context to draw background to be cleared
  ctx.fillStyle = "#666666";
  //square shaped background
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function drawSnake() {
  ctx.fillStyle = '#e7eb0a'
  ctx.fillRect(headX * tileCount, headY * tileCount, tileSize, tileSize)
}

function moveSnake(){
  headX = headX + horizontalDirection;
  headY = headY + verticalDirection;
}

//event listeners to set key binds to move snake
document.body.addEventListener('keydown', keydown);
function keydown(x) {
  if (x.keyCode === 38){
    console.log('up arrow')
    // move the direction up on the y axis
    verticalDirection = -1;
    //limit to one direction at a time.
    horizontalDirection = 0;
  } else {
    if (x.keyCode === 40) {
      console.log('down arrow')
       // move the direction down on the y axis
       verticalDirection = +1;
       //limit to one direction at a time.
       horizontalDirection = 0;
    } else {
      if (x.keyCode === 37) {
        console.log('left arrow')
         // move the direction left on the x axis
         horizontalDirection = -1;
         //limit to one direction at a time.
         verticalDirection = 0;
      } else {
        if (x.keyCode === 39) {
          console.log('right arrow')
           // move the direction right on the x axis
           horizontalDirection = +1;
           //limit to one direction at a time.
           verticalDirection = 0;
        }
      }
    }
  }
}
drawGame();















// autoplay on chrome maybe?
//src="https://unpkg.com/pixi.js/dist/browser/pixi.min.js"

// // <!-- found here, if not using CDN "./node_modules/@pixi/sound/dist/pixi-sound.js" -->
// // <script src="https://unpkg.com/@pixi/sound/dist/pixi-sound.js"></script>

// PIXI.sound.add('themeSong', 'HeatleyBros - HeatleyBros II - 06 8 Bit Adventure.mp3"');
//     PIXI.sound.play('themeSong');
//     PIXI.sound.add('themeSong', 'HeatleyBros - HeatleyBros II - 06 8 Bit Adventure.mp3"');
//     PIXI.sound.play('themeSong');
