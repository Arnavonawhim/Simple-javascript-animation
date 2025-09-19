const SPRITE_WIDTH = 13;
const SPRITE_HEIGHT = 14;
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

var spriteSheetURL = 'https://codehs.com/uploads/e4cfb06e001bd92cf41139928e88819a';
var image = new Image();
image.src = spriteSheetURL;
image.crossOrigin = true;

var position = spritePositionToImagePosition(1, 0);

image.onload = function() {
    context.drawImage(
        image,
        // LOOK!
        // we use the position from 
        // spritePositionToImagePosition
        // to start at an offset
        // into the spritesheet!
        position.x,
        position.y,
        SPRITE_WIDTH,
        SPRITE_HEIGHT,
        0,
        0,
        SPRITE_WIDTH,
        SPRITE_HEIGHT
    );
};

//reference code for animation not written by me