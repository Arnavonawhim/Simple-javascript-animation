const SPRITE_WIDTH = 150;
const SPRITE_HEIGHT = 148;
const SPRITE_SCALE = 2;
const BORDER_WIDTH = 1;
const SPACING_WIDTH = 1;

let imagesLoaded = 0;
const totalImages = 2;

const canvas = document.getElementById('Game');
const ctx = canvas.getContext('2d');

let backgroundImage = null;
let spriteSheet = null;

const spriteX = (canvas.width / 2) - (SPRITE_WIDTH * SPRITE_SCALE / 2);
const spriteY = canvas.height - (SPRITE_HEIGHT * SPRITE_SCALE) - 20;//AI

let currentFrame = 0;
let frameCounter = 0;
const frameDelay = 30;

function getSpritePosition(row, col) {
    return {
        x: BORDER_WIDTH + col * (SPACING_WIDTH + SPRITE_WIDTH),
        y: BORDER_WIDTH + row * (SPACING_WIDTH + SPRITE_HEIGHT)
    };
}

function loadImage(src, callback) {
    const img = new Image();
    img.onload = function() {
        imagesLoaded++;
        callback(img);
        if (imagesLoaded === totalImages) {
            startGame();
        }
    };
    img.onerror = function() {
        imagesLoaded++;
        if (imagesLoaded === totalImages) {
            startGame();
        }
    };
    img.src = src;
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height); 
    const framePos = getSpritePosition(0, Math.floor(currentFrame));
    ctx.drawImage(
        spriteSheet,
        framePos.x, framePos.y,
        SPRITE_WIDTH, SPRITE_HEIGHT,
        spriteX, spriteY,
        SPRITE_WIDTH * SPRITE_SCALE, SPRITE_HEIGHT * SPRITE_SCALE
        );
    } 


function animate() {
    frameCounter++;
    if (frameCounter >= frameDelay) {
        currentFrame = (currentFrame + 0.1) % 3;
        frameCounter = 0;
    }
    render();
    requestAnimationFrame(animate);
}

function startGame() {
    animate();
}

document.getElementById('leftButton').addEventListener('click', function() {
    alert('Left path chosen!');
});

document.getElementById('rightButton').addEventListener('click', function() {
    alert('Right path chosen!');
});

loadImage('./images/simple.jpg', function(img) {
    backgroundImage = img;
});

loadImage('./Knights.png', function(img) {
    spriteSheet = img;
});
