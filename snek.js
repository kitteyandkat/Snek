let canvas = document.querySelector(".game")
let themeSong = document.getElementById("themeSong")

function playSong(){
  themeSong.play()
  themeSong.volume = 0.1;
}

window.onload = function () {
  setTimeout(playSong, 1000) 
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


let headX = 3;
let headY = 4;
class SnakeSection {
  constructor(x, y) {
    this.x = x
    this.y = y
  }
}
const snakeBody = [new SnakeSection(headX, headY - .4), new SnakeSection(headX, headY - .8)]
window.snakeBody = snakeBody;
let fps = 2;
let gridPosition = 40
let gridSize = canvas.width / gridPosition - 2;


let treatX = 1;
let treatY = 2;

let horizontalDirection = 0;
let verticalDirection = 0;
let score = 0

//Set up game loop
function drawGame() {
  speed();
  // clear screen to start with blank game
  clearScreen();
  //snake keyboard movements
  if (!paused) {
    moveSnake()
  }
  //call eat function
  eat();
  //call the draw treat function
  drawTreat();
  //call the draw snake function
  drawSnake();
  drawScoreboard();
  gameOver();
  //how often screen gets updated
  setTimeout(drawGame, 1000 / fps);
}

function drawScoreboard() {
  ctx.fillStyle = "white";
  ctx.font = "15px Caveat";
  ctx.fillText("Score " + score, canvas.width - 60, 20);
}

function speed(){
  if (score > 5){
    fps = 3
  }
  if (score > 10){
    fps = 6
  }
  if (score > 20){
    fps = 8
  }
  if (score > 30){
    fps = 10
  }
  if (score > 40){
    fps = 15
  }
  if (score > 50){
    fps = 20
  }
}

function clearScreen() {
  //use context to draw background to be cleared
  ctx.fillStyle = "#666666";
  //square shaped background
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function drawSnake() {
  ctx.fillStyle = '#e7eb0a'
  ctx.fillRect(headX * gridPosition, headY * gridPosition, gridSize, gridSize)
  // For loop so that the snake's body can increase in length
  for (let i = 0; i < snakeBody.length; i++) {
    let body = snakeBody[i];
    ctx.fillRect(body.x * gridPosition, body.y * gridPosition, gridSize, gridSize);
  }

  // snakeBody.push(new SnakeSection(headX, headY))
}


function drawTreat() {
  ctx.fillStyle = 'purple'
  ctx.fillRect(treatX * gridPosition, treatY * gridPosition, gridSize, gridSize)
}

function moveTreatToRandomPosition() {
  // randomize by using math.random, round to nearest integer
  treatX = Math.round(Math.random() * gridPosition / 3.2);
  treatY = Math.round(Math.random() * gridPosition / 3.2);
}

function eat() {
  if (treatX === headX && treatY === headY) {
    // increase length of snake body by 1
    let newSection = [new SnakeSection(headX, headY)];
    snakeBody.push(newSection);
    score++
    moveTreatToRandomPosition();
    for (let i = snakeBody.length - 1; i >= 0; i--) {
      //grab current snake body 
      let currentBody = snakeBody[i];
      if (currentBody.x === treatX && currentBody.y === treatY) {
        moveTreatToRandomPosition();
        i = snakeBody.length - 1;
        i = 0
      }
    }
  }
  // if(treatX === )
}

// class history {
//   constructor(x, y) {
//     this.x = x
//     this.y = y
//   }
// }
// const prevPos = [new history(headX, headY)]




let startingPosition = [headX, headY]

function moveSnake() {
  // console.log(prevPos)
  // console.log(snakeBody[0])
  // let movedheadX = headX + horizontalDirection;
  // let movedheadY = headY + verticalDirection;
  // let currentPosition = [movedheadX, movedheadY]
  // loop through snakeBody in reverse order
  for (let i = snakeBody.length - 1; i >= 0; i--) {
    // console.log('BLAMMY!!!!')
    //grab current snake body 
    let currentBody = snakeBody[i]
    //grab next snake body
    let nextBody = snakeBody[i - 1]
    //if no next body, current body moves to neck
    if (!nextBody) {
      //gridPisition / headx * heady
      currentBody.x = headX
      currentBody.y = headY

      // if nextbody move current body to the nextbody
    } else {
      currentBody.x = nextBody.x
      currentBody.y = nextBody.y
    }
  }
  headX = headX + horizontalDirection;
  headY = headY + verticalDirection;


  // class currentPos {
  //   constructor(x, y) {
  //     this.x = x
  //     this.y = y
  //   }
  // }
  // const coordinates = [new currentPos(headX + horizontalDirection, headY + verticalDirection)]
  // console.log(currentPos)
  // console.log(prevPos)
  // if (currentPos.x === history.x && currentPos.y === history.y) {
  //   console.log('head still!')
  // } else {
  //   if (currentPos.x !== history.x) {
  //     console.log('moved vertically!')
  //   } else {
  //     if (currentPos.y !== history.y) {
  //       console.log('moved horizontally!')
  //     }
  //   }
  // }
}

// Game loop doesn't start until keydown
let paused = true

function resetBoard() {
  score = 0;
  fps = 2;
  treatX = 1;
  treatY = 2;
  headX = 3;
  headY = 4;
  snakeBody.length = 2;
  snakeBody[0].x = headX
  snakeBody[1].x = headX
  snakeBody[0].y = headY -.4
  snakeBody[1].y = headY -.8
}



function gameOver() {
  if (paused) {
    return;
  }
  if (horizontalDirection === 0 && verticalDirection === 0) {
    return false;
  }
  let endGame = false;
  if (headY <= -1 || headX <= -1 || headY >= 13 || headX >= 13) {
    console.log('hit wall')
    endGame = true;
    // } else {
    //   if (headX <= 0) {
    //     console.log('hit wall')
    //     endGame = true;
      }
    for (let i = snakeBody.length - 1; i >= 0; i--) {
      //grab current snake body 
      let currentBody = snakeBody[i];
      if (currentBody.x === headX && currentBody.y === headY) {
        endGame = true
      }

    if (endGame) {
      console.log('You lost!')
      paused = true
      setTimeout(resetBoard, 5000);
    }
    if (endGame && paused){
      ctx.fillStyle = "white";
      ctx.font = "50px Caveat";
      ctx.fillText("You Lose!", canvas.width/ 3.5 , canvas.height/ 2)
      }
    }
  }


//event listeners to set key binds to move snake
document.body.addEventListener('keydown', keydown);
function keydown(x) {
  x.preventDefault();
  if (x.keyCode === 38) {
    console.log('up arrow')
    // move the direction up on the y axis
    verticalDirection = -1;
    //limit to one direction at a time.
    horizontalDirection = 0;
    // if already moving down, can't also move up, break out of function
    if (verticalDirection === 1) {
      return
    }
  } else {
    if (x.keyCode === 40) {
      console.log('down arrow')
      // move the direction down on the y axis
      verticalDirection = +1;
      //limit to one direction at a time.
      horizontalDirection = 0;
      // if already moving down, can't also move up, break out of function
      if (verticalDirection === -1) {
        return
      }
    } else {
      if (x.keyCode === 37) {
        console.log('left arrow')
        // move the direction left on the x axis
        horizontalDirection = -1;
        //limit to one direction at a time.
        verticalDirection = 0;
        // if already moving right, can't also move left, break out of function
        if (horizontalDirection === 1) {
          return
        }
      } else {
        if (x.keyCode === 39) {
          console.log('right arrow')
          // move the direction right on the x axis
          horizontalDirection = 1;
          //limit to one direction at a time.
          verticalDirection = 0;
          // if already moving left, can't also move right, break out of function
          if (horizontalDirection === -1) {
            return;
          }
        }
      }
    }
  }
  if ((verticalDirection || horizontalDirection) && paused) {
    paused = false
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
