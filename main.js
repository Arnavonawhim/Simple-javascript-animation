//hit and trial sizes
const SPRITE_WIDTH = 60;
const SPRITE_HEIGHT = 82;
const BORDER_WIDTH = 1;
const SPACING_WIDTH = 1;

function spritePositionToImagePosition(row, col) {
    return {
        x: (
            BORDER_WIDTH +
            col * (SPACING_WIDTH + SPRITE_WIDTH)
        ),
        y: (
            BORDER_WIDTH +
            row * (SPACING_WIDTH + SPRITE_HEIGHT)
        )
    }
}

var canvas = document
            .querySelector('canvas');
var context = canvas
              .getContext('2d');

var spriteSheetURL = 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/b4a1068b-cacc-4dfa-837a-7fde3c799cd8/dc5rs8a-48ff51ee-90bd-4334-b88d-e6d53c6fd48f.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwic3ViIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsImF1ZCI6WyJ1cm46c2VydmljZTpmaWxlLmRvd25sb2FkIl0sIm9iaiI6W1t7InBhdGgiOiIvZi9iNGExMDY4Yi1jYWNjLTRkZmEtODM3YS03ZmRlM2M3OTljZDgvZGM1cnM4YS00OGZmNTFlZS05MGJkLTQzMzQtYjg4ZC1lNmQ1M2M2ZmQ0OGYucG5nIn1dXX0.XKpDR-XiqnULZZhDOa3jWi2zdRr0Gx7XTRXoFMm-gas';
var image = new Image();
image.src = spriteSheetURL;
image.crossOrigin = true;

//top row animation
var goku00 = spritePositionToImagePosition(0, 0);
var goku01 = spritePositionToImagePosition(0, 1);
var goku02 = spritePositionToImagePosition(0, 2);
var goku03 = spritePositionToImagePosition(0, 3);
var goku04 = spritePositionToImagePosition(0, 4);
var goku05 = spritePositionToImagePosition(0, 5);
var goku06 = spritePositionToImagePosition(0, 6);
var goku07 = spritePositionToImagePosition(0, 7);
var goku08 = spritePositionToImagePosition(0, 8);

var walkCycle = [
    goku00,
    goku01,
    goku02,
    goku03,
    goku04,
    goku05,
    goku06,
    goku07,
    goku08
];

var frameIndex = 0;
var frame;
function animate() {
    if (frameIndex === walkCycle.length) {
        frameIndex = 0;
    }
    frame = walkCycle[frameIndex];
    context.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );
    context.drawImage(
        image,
        frame.x,
        frame.y,
        SPRITE_WIDTH,
        SPRITE_HEIGHT,
        0,
        0,
        SPRITE_WIDTH,
        SPRITE_HEIGHT
    );
    frameIndex += 1;
}

image.onload = function() {
    setInterval(animate, 250);
};

