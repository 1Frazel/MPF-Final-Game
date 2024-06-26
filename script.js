const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const notification = document.getElementById('notification');
const mainMenu = document.getElementById('mainMenu');
const playButton = document.getElementById('playButton');
const gameOverMenu = document.getElementById('gameOverMenu');
const restartButton = document.getElementById('restartButton');
const quitButton = document.getElementById('quitButton');
const winMenu = document.getElementById('winMenu');
const backToMainButton = document.getElementById('backToMainButton');

const gravity = 0.6;
const jumpStrength = -15;

canvas.width = 1680;
canvas.height = 720;

const mapWidth = 6144; // Define the map width larger than the canvas
const mapHeight = 960; // Keep the map height same as the canvas

const backgroundImage = new Image();
backgroundImage.src = './assets/stage3.png'; // Replace with the path to your background image

const idleSprite = new Image();
idleSprite.src = './assets/Insomnomnomnia_maincharIdle_R.png'; // Replace with the path to your sprite sheet

const walkSprite = new Image();
walkSprite.src = './assets/Insomnomnomnia_maincharWalk_R.png'; // Replace with the path to your sprite sheet

const jumpSprite = new Image();
jumpSprite.src = './assets/Insomnomnomnia_maincharJump_R.png'; // Replace with the path to your sprite sheet

const monsterSprite = new Image();
monsterSprite.src = './assets/Insomsomnia_enemySlimeBMove.png'; // Replace with the path to your sprite sheet

const obstacleHeight = 100; // Define the obstacle height
const playerHeight = obstacleHeight / 2; // Define the player's height as half the obstacle height
const playerWidth = playerHeight * 0.8; // Define the player's width relative to height

const initialSpawnX = 5;
const initialSpawnY = 610 - playerHeight; // Position player above the floor

// Sound effects and background music
const walkSound = new Audio('/music/Sound Effects - Footsteps.mp3');
const jumpSound = new Audio('/music/Jump Sound Effect.mp3');
const gameOverSound = new Audio('/music/Pou game over sound effect.mp3');
const hitSound = new Audio('/music/Dead body hitting ground sound effect.mp3');
const bgm = new Audio('/music/Pokémon League (Night) - Pokémon Brilliant Diamond and Shining Pearl OST (Gamerip).mp3');

// Set the volume for the background music
bgm.volume = 0.6;
bgm.loop = true; // Loop the background music

const player = {
    x: initialSpawnX,
    y: initialSpawnY,
    width: playerWidth,
    height: playerHeight,
    speed: 5,
    dx: 0,
    dy: 0,
    isJumping: false,
    canDoubleJump: false, // Track if the player can double jump
    isInvincible: false,
    invincibleDuration: 2000,
    invincibleStart: null,
    blink: false,
    frameIndex: 0,
    tickCount: 0,
    ticksPerFrame: 10,
    numberOfFrames: 8,
    state: 'idle',
    direction: 'right',
};

const bed = {
    x: mapWidth - 350,
    y: 610 - playerHeight,
    width: playerWidth * 2,
    height: playerHeight,
};

const monsters = [
    { x: 400, y: 610 - playerHeight, width: playerWidth, height: playerHeight, speed: 2, direction: -1, frameIndex: 0, tickCount: 0, ticksPerFrame: 10, numberOfFrames: 4 },
    { x: 700, y: 610 - playerHeight, width: playerWidth, height: playerHeight, speed: 2, direction: 1, frameIndex: 0, tickCount: 0, ticksPerFrame: 10, numberOfFrames: 4 },
    { x: 1400, y: 610 - playerHeight, width: playerWidth, height: playerHeight, speed: 0.5, direction: -1, frameIndex: 0, tickCount: 0, ticksPerFrame: 10, numberOfFrames: 4 },
    { x: 1500, y: 430, width: playerWidth, height: playerHeight, speed: 0.1, direction: -1, frameIndex: 0, tickCount: 0, ticksPerFrame: 10, numberOfFrames: 4 },
    { x: 1700, y: 610 - playerHeight, width: playerWidth, height: playerHeight, speed: 0.5, direction: -1, frameIndex: 0, tickCount: 0, ticksPerFrame: 10, numberOfFrames: 4 },
    { x: 2300, y: 610 - playerHeight, width: playerWidth, height: playerHeight, speed: 0.5, direction: -1, frameIndex: 0, tickCount: 0, ticksPerFrame: 10, numberOfFrames: 4 },
    { x: 3200, y: 610 - playerHeight, width: playerWidth, height: playerHeight, speed: 0.5, direction: -1, frameIndex: 0, tickCount: 0, ticksPerFrame: 10, numberOfFrames: 4 },
    { x: 4690, y: 250, width: playerWidth, height: playerHeight, speed: 0.1, direction: -1, frameIndex: 0, tickCount: 0, ticksPerFrame: 10, numberOfFrames: 4 },
];

const platforms = [
    { x: 0, y: 610, width: 6144, height: 20 },
    // buildings
    { x: 1441, y: 430, width: 40, height: 40 },
    { x: 1441, y: 470, width: 245, height: 140 },
    { x: 2302, y: 468, width: 240, height: 145 },
    { x: 2639, y: 395, width: 430, height: 215 },
    { x: 3313, y: 468, width: 245, height: 145 },
    { x: 3744, y: 428, width: 245, height: 185 },
    { x: 4130, y: 397, width: 435, height: 215 },
    { x: 4320, y: 285, width: 195, height: 115 },
    { x: 4657, y: 250, width: 340, height: 365 },
    // obstacles
    { x: 244, y: 570, width: 40, height: 40 },
    { x: 485, y: 570, width: 40, height: 40 },
    { x: 530, y: 570, width: 40, height: 40 },
    { x: 868, y: 570, width: 40, height: 40 },
    { x: 915, y: 540, width: 40, height: 40 },
    { x: 962, y: 504, width: 40, height: 40 },
    { x: 1009, y: 540, width: 40, height: 40 },
    { x: 1009, y: 570, width: 40, height: 80 },
    { x: 1210, y: 570, width: 40, height: 40 },
    { x: 1254, y: 540, width: 40, height: 40 },
    { x: 1301, y: 504, width: 40, height: 40 },
    { x: 1301, y: 540, width: 40, height: 40 },
    { x: 1301, y: 570, width: 40, height: 80 },
    { x: 1441, y: 430, width: 40, height: 40 },
    { x: 1488, y: 430, width: 40, height: 40 },
    { x: 1535, y: 430, width: 40, height: 40 },
    { x: 1582, y: 430, width: 40, height: 40 },
    { x: 1629, y: 430, width: 54, height: 40 },
    { x: 1925, y: 570, width: 90, height: 40 },
    { x: 2068, y: 570, width: 140, height: 40 },
    { x: 2115, y: 540, width: 90, height: 40 },
    { x: 2162, y: 504, width: 43, height: 40 },
    { x: 2452, y: 430, width: 90, height: 40 },
    { x: 2499, y: 400, width: 43, height: 40 },
    { x: 2789, y: 360, width: 43, height: 40 },
    { x: 2929, y: 360, width: 94, height: 40 },
    { x: 2976, y: 320, width: 43, height: 40 },
    { x: 3412, y: 428, width: 140, height: 40 },
    { x: 3459, y: 388, width: 93, height: 40 },
    { x: 3506, y: 348, width: 45, height: 40 },
    { x: 3793, y: 388, width: 190, height: 40 },
    { x: 3840, y: 348, width: 140, height: 40 },
    { x: 3938, y: 318, width: 40, height: 40 },
    { x: 4177, y: 357, width: 90, height: 40 },
    { x: 4420, y: 245, width: 90, height: 40 },
    { x: 4467, y: 205, width: 40, height: 40 },
    { x: 5090, y: 570, width: 335, height: 40 },
    { x: 5137, y: 540, width: 240, height: 40 },
    { x: 5184, y: 504, width: 95, height: 40 },
    { x: 5184, y: 464, width: 45, height: 40 },
];

const obstacles = [
    { x: 200, y: canvas.height - obstacleHeight - 10, width: obstacleHeight * 0.5, height: obstacleHeight },
    { x: 500, y: canvas.height - obstacleHeight - 10, width: obstacleHeight * 0.5, height: obstacleHeight }
];

let caffeineBar = 3;
let gameRunning = false;
let animationFrameId;

function drawBackground(cameraX) {
    ctx.drawImage(backgroundImage, -cameraX, 0, mapWidth, canvas.height);
}

function drawPlayer(cameraX) {
    let sprite;
    let frameWidth;
    let frameHeight;

    if (player.state === 'idle') {
        sprite = idleSprite;
    } else if (player.state === 'walk') {
        sprite = walkSprite;
    } else if (player.state === 'jump') {
        sprite = jumpSprite;
    }

    frameWidth = sprite.width / player.numberOfFrames;
    frameHeight = sprite.height;

    ctx.save();

    if (player.direction === 'left') {
        ctx.scale(-1, 1);
        ctx.drawImage(
            sprite,
            player.frameIndex * frameWidth,
            0,
            frameWidth,
            frameHeight,
            -(player.x - cameraX) - player.width,
            player.y,
            player.width,
            player.height
        );
    } else {
        ctx.drawImage(
            sprite,
            player.frameIndex * frameWidth,
            0,
            frameWidth,
            frameHeight,
            player.x - cameraX,
            player.y,
            player.width,
            player.height
        );
    }

    ctx.restore();

    player.tickCount += 1;

    if (player.tickCount > player.ticksPerFrame) {
        player.tickCount = 0;
        player.frameIndex = (player.frameIndex + 1) % player.numberOfFrames;
    }
}

function drawMonsters(cameraX) {
    monsters.forEach(monster => {
        const frameWidth = monsterSprite.width / monster.numberOfFrames;
        const frameHeight = monsterSprite.height;

        ctx.save();

        if (monster.direction === -1) {
            ctx.scale(-1, 1);
            ctx.drawImage(
                monsterSprite,
                monster.frameIndex * frameWidth,
                0,
                frameWidth,
                frameHeight,
                -(monster.x - cameraX) - monster.width,
                monster.y,
                monster.width,
                monster.height
            );
        } else {
            ctx.drawImage(
                monsterSprite,
                monster.frameIndex * frameWidth,
                0,
                frameWidth,
                frameHeight,
                monster.x - cameraX,
                monster.y,
                monster.width,
                monster.height
            );
        }

        ctx.restore();

        monster.tickCount += 1;

        if (monster.tickCount > monster.ticksPerFrame) {
            monster.tickCount = 0;
            monster.frameIndex = (monster.frameIndex + 1) % monster.numberOfFrames;
        }
    });
}

function drawPlatforms(cameraX) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0)'; // Change to your preferred platform color
    platforms.forEach(platform => {
        ctx.fillRect(platform.x - cameraX, platform.y, platform.width, platform.height);
    });
}

function drawObstacles(cameraX) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x - cameraX, obstacle.y, obstacle.width, obstacle.height);
    });
}

function drawBed(cameraX) {
    ctx.fillStyle = 'rgba(144, 238, 144, 0.3)';
    ctx.fillRect(bed.x - cameraX, bed.y, bed.width, bed.height);
}

function drawCaffeineBar() {
    ctx.fillStyle = 'rgba(227, 186, 143, 1)';
    ctx.fillRect(10, 10, caffeineBar * 50, 20);
}

function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function movePlayer() {
    player.x += player.dx;
    player.y += player.dy;

    let isOnPlatform = false;

    // Apply gravity
    player.dy += gravity;

    // Check collision with platforms
    platforms.forEach(platform => {
        // Check for collision from above (falling onto the platform)
        if (player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height <= platform.y + platform.height &&
            player.y + player.height + player.dy >= platform.y) {
            player.dy = 0;
            player.isJumping = false;
            player.y = platform.y - player.height;
            isOnPlatform = true;
            player.canDoubleJump = false; // Reset double jump state when landing
        }
        // Check for collision from below (hitting the underside of the platform)
        else if (player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y >= platform.y &&
            player.y + player.dy <= platform.y + platform.height) {
            player.dy = 0;
            player.y = platform.y + platform.height;
        }
        // Check for collision from the left side
        else if (player.y < platform.y + platform.height &&
            player.y + player.height > platform.y &&
            player.x + player.width <= platform.x + platform.width &&
            player.x + player.width + player.dx >= platform.x) {
            player.dx = 0;
            player.x = platform.x - player.width;
        }
        // Check for collision from the right side
        else if (player.y < platform.y + platform.height &&
            player.y + player.height > platform.y &&
            player.x >= platform.x &&
            player.x + player.dx <= platform.x + platform.width) {
            player.dx = 0;
            player.x = platform.x + platform.width;
        }
    });

    // Prevent player from going out of bounds
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > mapWidth) player.x = mapWidth - player.width;
    if (player.y < 0) player.y = 0;

    // If the player is not on any platform and is above the ground, apply gravity
    if (!isOnPlatform && player.y + player.height < canvas.height) {
        player.dy += gravity;
    }

    // Update player state
    if (player.dx !== 0 && !player.isJumping) {
        player.state = 'walk';
        walkSound.play(); // Play walking sound effect
    } else if (player.dy !== 0) {
        player.state = 'jump';
    } else {
        player.state = 'idle';
    }
}

function moveMonsters() {
    monsters.forEach(monster => {
        monster.x += monster.speed * monster.direction;
        monster.y += gravity;

        platforms.forEach(platform => {
            // Check for collision from above (falling onto the platform)
            if (monster.x < platform.x + platform.width &&
                monster.x + monster.width > platform.x &&
                monster.y + monster.height <= platform.y + platform.height &&
                monster.y + monster.height + gravity >= platform.y) {
                monster.y = platform.y - monster.height;
            }
            // Check for collision from below (hitting the underside of the platform)
            else if (monster.x < platform.x + platform.width &&
                monster.x + monster.width > platform.x &&
                monster.y >= platform.y &&
                monster.y + gravity <= platform.y + platform.height) {
                monster.y = platform.y + platform.height;
            }
            // Check for collision from the left side
            else if (monster.y < platform.y + platform.height &&
                monster.y + monster.height > platform.y &&
                monster.x + monster.width <= platform.x + platform.width &&
                monster.x + monster.width + monster.speed * monster.direction >= platform.x) {
                monster.direction *= -1;
            }
            // Check for collision from the right side
            else if (monster.y < platform.y + platform.height &&
                monster.y + monster.height > platform.y &&
                monster.x >= platform.x &&
                monster.x + monster.speed * monster.direction <= platform.x + platform.width) {
                monster.direction *= -1;
            }
        });

        // Prevent monsters from going out of bounds
        if (monster.x < 0) monster.direction = 1;
        if (monster.x + monster.width > mapWidth) monster.direction = -1;
    });
}

function checkCollisions() {
    monsters.forEach(monster => {
        if (player.isInvincible) return;

        if (player.x < monster.x + monster.width &&
            player.x + player.width > monster.x &&
            player.y < monster.y + monster.height &&
            player.y + player.height > monster.y) {
            caffeineBar--;
            player.isInvincible = true;
            player.invincibleStart = Date.now();
            hitSound.play(); // Play hit sound effect

            if (caffeineBar === 0) {
                showNotification('Game Over!');
                gameOverSound.play(); // Play game over sound effect
                bgm.pause(); // Stop background music
                showGameOverMenu();
            }
        }
    });

    if (player.x < bed.x + bed.width &&
        player.x + player.width > bed.x &&
        player.y < bed.y + bed.height &&
        player.y + player.height > bed.y) {
        showNotification('You Win! Time to sleep.');
        bgm.pause(); // Stop background music
        showWinMenu();
    }
}

function showNotification(message) {
    notification.textContent = message;
    notification.classList.remove('hidden');
}

function hideNotification() {
    notification.classList.add('hidden');
}

function showGameOverMenu() {
    gameRunning = false;
    cancelAnimationFrame(animationFrameId);
    gameOverMenu.classList.remove('hidden');
    canvas.classList.add('hidden');
}

function showWinMenu() {
    gameRunning = false;
    cancelAnimationFrame(animationFrameId);
    winMenu.classList.remove('hidden');
    canvas.classList.add('hidden');
}

function returnToMainMenu() {
    gameRunning = false;
    cancelAnimationFrame(animationFrameId);
    canvas.classList.add('hidden');
    mainMenu.classList.remove('hidden');
    gameOverMenu.classList.add('hidden');
    winMenu.classList.add('hidden');
    hideNotification();
}

function resetGame() {
    player.x = initialSpawnX;
    player.y = initialSpawnY; // Position player above the floor
    player.dx = 0;
    player.dy = 0;
    player.isJumping = false;
    player.canDoubleJump = false; // Reset double jump state when the game is reset
    player.isInvincible = false;
    player.state = 'idle';
    player.direction = 'right';
    caffeineBar = 3;
    monsters.forEach(monster => {
        monster.frameIndex = 0;
        monster.tickCount = 0;
        monster.y = 610 - monster.height; // Position monsters above the floor
    });
}

function update() {
    if (!gameRunning) return;

    clear();
    const cameraX = Math.max(0, Math.min(player.x - canvas.width / 2, mapWidth - canvas.width));
    drawBackground(cameraX);
    drawPlayer(cameraX);
    drawBed(cameraX);
    drawMonsters(cameraX);
    drawPlatforms(cameraX);
    drawObstacles(cameraX);
    drawCaffeineBar();
    movePlayer();
    moveMonsters();
    checkCollisions();

    if (player.isInvincible) {
        player.blink = !player.blink;
        if (Date.now() - player.invincibleStart >= player.invincibleDuration) {
            player.isInvincible = false;
            player.blink = false;
        }
    }

    animationFrameId = requestAnimationFrame(update);
}

function keyDown(e) {
    if (e.key === 'ArrowRight' || e.key === 'd') {
        player.dx = player.speed;
        player.direction = 'right';
        walkSound.play(); // Play walking sound effect
    } else if (e.key === 'ArrowLeft' || e.key === 'a') {
        player.dx = -player.speed;
        player.direction = 'left';
        walkSound.play(); // Play walking sound effect
    } else if ((e.key === 'ArrowUp' || e.key === 'w') && !player.isJumping) {
        player.dy = jumpStrength;
        player.isJumping = true;
        player.canDoubleJump = true; // Allow double jump after the first jump
        jumpSound.play(); // Play jumping sound effect
    } else if ((e.key === 'ArrowUp' || e.key === 'w') && player.canDoubleJump) {
        player.dy = jumpStrength;
        player.canDoubleJump = false; // Use the double jump
        jumpSound.play(); // Play jumping sound effect
    }
}

function keyUp(e) {
    if (
        e.key === 'ArrowRight' || e.key === 'd' ||
        e.key === 'ArrowLeft' || e.key === 'a'
    ) {
        player.dx = 0;
    }
}

function startGame() {
    if (!gameRunning) {
        resetGame();
        mainMenu.classList.add('hidden');
        gameOverMenu.classList.add('hidden');
        winMenu.classList.add('hidden');
        canvas.classList.remove('hidden');
        hideNotification();
        gameRunning = true;
        bgm.currentTime = 0; // Restart background music from the beginning
        bgm.play(); // Play background music
        update();
    }
}

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);
playButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);
quitButton.addEventListener('click', returnToMainMenu);
backToMainButton.addEventListener('click', returnToMainMenu);
