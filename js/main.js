const gameContainer = document.getElementById("gameContainer");
const basket = document.getElementById("basket");
const scoreElement = document.getElementById("score");
const livesElement = document.getElementById("lives");
const levelElement = document.getElementById("level");
const gameOverScreen = document.getElementById("gameOver");
const finalScoreElement = document.getElementById("finalScore");
const eggsCaughtElement = document.getElementById("eggsCaught");

let gameState = {
  score: 0,
  lives: 3,
  level: 1,
  basketPosition: 360,
  eggs: [],
  gameRunning: true,
  eggsCaught: 0,
  spawnRate: 1500,
  eggSpeed: 3000,
};

let keys = {};
let mouseX = 400;
let lastEggSpawn = 0;

// Event listeners
document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});

document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

gameContainer.addEventListener("mousemove", (e) => {
  const rect = gameContainer.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
});

function updateBasket() {
  if (!gameState.gameRunning) return;

  // Keyboard controls
  if (keys["ArrowLeft"] && gameState.basketPosition > 0) {
    gameState.basketPosition -= 5;
  }
  if (keys["ArrowRight"] && gameState.basketPosition < 720) {
    gameState.basketPosition += 5;
  }

  // Mouse controls
  const targetX = Math.max(0, Math.min(720, mouseX - 40));
  gameState.basketPosition += (targetX - gameState.basketPosition) * 0.2;

  basket.style.left = gameState.basketPosition + "px";
}

function spawnEgg() {
  if (!gameState.gameRunning) return;

  const now = Date.now();
  if (now - lastEggSpawn < gameState.spawnRate) return;

  lastEggSpawn = now;

  const egg = document.createElement("div");
  const isGolden = Math.random() < 0.1; // 10% chance for golden egg

  egg.className = isGolden ? "egg golden-egg" : "egg";
  egg.style.left = Math.random() * 750 + "px";
  egg.style.animationDuration = gameState.eggSpeed + "ms";

  gameContainer.appendChild(egg);
  gameState.eggs.push({
    element: egg,
    isGolden: isGolden,
    caught: false,
  });

  // Remove egg after animation
  setTimeout(() => {
    if (egg.parentNode && !egg.caught) {
      egg.parentNode.removeChild(egg);
      gameState.eggs = gameState.eggs.filter((e) => e.element !== egg);

      if (!egg.caught) {
        gameState.lives--;
        livesElement.textContent = gameState.lives;
        createCrackEffect(egg.offsetLeft + 15, 570);

        if (gameState.lives <= 0) {
          gameOver();
        }
      }
    }
  }, gameState.eggSpeed + 100);
}

function checkCollisions() {
  if (!gameState.gameRunning) return;

  gameState.eggs.forEach((eggData, index) => {
    const egg = eggData.element;
    if (!egg || eggData.caught) return;

    const eggRect = egg.getBoundingClientRect();
    const basketRect = basket.getBoundingClientRect();

    if (
      eggRect.bottom >= basketRect.top &&
      eggRect.left < basketRect.right &&
      eggRect.right > basketRect.left &&
      eggRect.bottom <= basketRect.bottom + 20
    ) {
      // Egg caught!
      eggData.caught = true;
      egg.caught = true;

      const points = eggData.isGolden ? 5 : 1;
      gameState.score += points;
      gameState.eggsCaught++;

      scoreElement.textContent = gameState.score;

      // Remove egg
      if (egg.parentNode) {
        egg.parentNode.removeChild(egg);
      }

      gameState.eggs.splice(index, 1);

      // Level progression
      if (gameState.score > 0 && gameState.score % 20 === 0) {
        levelUp();
      }
    }
  });
}

function levelUp() {
  gameState.level++;
  gameState.spawnRate = Math.max(800, gameState.spawnRate - 100);
  gameState.eggSpeed = Math.max(1500, gameState.eggSpeed - 200);
  levelElement.textContent = gameState.level;
}

function createCrackEffect(x, y) {
  const crack = document.createElement("div");
  crack.className = "cracked-egg";
  crack.style.left = x + "px";
  crack.style.top = y + "px";
  gameContainer.appendChild(crack);

  setTimeout(() => {
    if (crack.parentNode) {
      crack.parentNode.removeChild(crack);
    }
  }, 500);
}

function gameOver() {
  gameState.gameRunning = false;
  finalScoreElement.textContent = gameState.score;
  eggsCaughtElement.textContent = gameState.eggsCaught;
  gameOverScreen.style.display = "block";
}

function restartGame() {
  // Reset game state
  gameState = {
    score: 0,
    lives: 3,
    level: 1,
    basketPosition: 360,
    eggs: [],
    gameRunning: true,
    eggsCaught: 0,
    spawnRate: 1500,
    eggSpeed: 3000,
  };

  // Update UI
  scoreElement.textContent = "0";
  livesElement.textContent = "3";
  levelElement.textContent = "1";
  gameOverScreen.style.display = "none";

  // Clear all eggs
  document.querySelectorAll(".egg, .cracked-egg").forEach((egg) => {
    if (egg.parentNode) {
      egg.parentNode.removeChild(egg);
    }
  });

  lastEggSpawn = 0;
}

// Game loop
function gameLoop() {
  updateBasket();
  spawnEgg();
  checkCollisions();
  requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();


