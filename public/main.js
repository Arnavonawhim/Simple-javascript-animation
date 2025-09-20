const SPRITE_WIDTH = 150;
const SPRITE_HEIGHT = 148;
const SPRITE_SCALE = 2;
const BORDER_WIDTH = 1;
const SPACING_WIDTH = 1;

const GOKU_WIDTH = 175;
const GOKU_HEIGHT = 138;
const GOKU_SCALE = 3;

let images_loaded = 0;
const total_images = 3;

const canvas = document.getElementById('Game');
const ctx = canvas.getContext('2d');

let bg_image = null;
let knight_sheet = null;
let goku_sheet = null;

let game_state = 'start';
let bg_x = 0;
let bg_x2 = canvas.width;
let moving_left = false;
let facing_left = false;
let knight_black = false;
let knight_row = 7;
let is_knight_hit = false;
let goku_anim_complete = false;
let distance_traveled = 0;
let goku_h = GOKU_HEIGHT;
let fight_hit_anim = false;
let fight_hit_frame = 0;
let fight_hit_counter = 0;

const knight_start_x = (canvas.width / 2) - (SPRITE_WIDTH * SPRITE_SCALE / 2);
const knight_moving_x = canvas.width * 0.50;
const knight_encounter_x = canvas.width * 0.50;
const knight_y = canvas.height - (SPRITE_HEIGHT * SPRITE_SCALE) - 20;

const goku_x = canvas.width * 0.15;
const goku_y = canvas.height - (GOKU_HEIGHT * GOKU_SCALE) - 20;

let current_frame = 5;
let frame_counter = 0;
const frame_delay = 5;

let goku_frame = 0;
let goku_frame_counter = 0;
let goku_anim = 'idle';
let goku_row = 0;
let goku_anim_frames = {
    idle: { row: 0, frames: [2] },
    fight: { row: 1, frames: [0, 1, 2, 3, 4, 5, 6, 7] },
    taunt: { row: 4, frames: [0, 1, 2, 3, 4, 5, 6, 7] }
};

function getSpritePosition(row, col) {
    return {
        x: BORDER_WIDTH + col * (SPACING_WIDTH + SPRITE_WIDTH),
        y: BORDER_WIDTH + row * (SPACING_WIDTH + SPRITE_HEIGHT)
    };
}

function getGokuSpritePosition(row, col) {
    return {
        x: col * GOKU_WIDTH,
        y: row * goku_h
    };
}

function getCurrentKnightPosition() {
    if (game_state === 'start') return knight_start_x;
    if (game_state === 'moving_left' || game_state === 'moving_right') return knight_moving_x;
    if (game_state === 'encounter' || game_state === 'gameover') return knight_encounter_x;
    return knight_start_x;
}

function loadImage(src, callback) {
    const img = new Image();
    img.onload = function() {
        images_loaded++;
        callback(img);
        if (images_loaded === total_images) {
            startGame();
        }
    };
    img.onerror = function() {
        images_loaded++;
        if (images_loaded === total_images) {
            startGame();
        }
    };
    img.src = src;
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (game_state === 'moving_left' || game_state === 'moving_right') {
        ctx.drawImage(bg_image, bg_x, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
        ctx.drawImage(bg_image, bg_x2, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.drawImage(bg_image, 0, 0, canvas.width, canvas.height);
    }

    if (game_state === 'encounter' || game_state === 'gameover') {
        const current_goku_anim = goku_anim_frames[goku_anim];
        const frame_index = Math.floor(goku_frame) % current_goku_anim.frames.length;
        const goku_frame_pos = getGokuSpritePosition(current_goku_anim.row, current_goku_anim.frames[frame_index]);
        ctx.drawImage(
            goku_sheet,
            goku_frame_pos.x, goku_frame_pos.y,
            GOKU_WIDTH, goku_h,
            goku_x, goku_y,
            GOKU_WIDTH * GOKU_SCALE, goku_h * GOKU_SCALE
        );
    }

    let display_knight_row = knight_row;
    let knight_frame = Math.floor(current_frame);
    
    if (fight_hit_anim) {
        display_knight_row = 1;
        knight_frame = Math.min(Math.floor(fight_hit_frame) + 1, 3);
    } else if (is_knight_hit) {
        display_knight_row = 11;
    } else if (game_state === 'start') {
        display_knight_row = 7;
        knight_frame = 5;
    }

    const knight_frame_pos = getSpritePosition(display_knight_row, knight_frame);
    const knight_x = getCurrentKnightPosition();
    ctx.save();
    
    const should_face_left = (game_state === 'moving_left') || (game_state === 'start' && facing_left);
    
    if (should_face_left) {
        ctx.scale(-1, 1);
        ctx.translate(-canvas.width, 0);
    }

    ctx.drawImage(
        knight_sheet,
        knight_frame_pos.x, knight_frame_pos.y,
        SPRITE_WIDTH, SPRITE_HEIGHT,
        should_face_left ? canvas.width - knight_x - (SPRITE_WIDTH * SPRITE_SCALE) : knight_x, knight_y,
        SPRITE_WIDTH * SPRITE_SCALE, SPRITE_HEIGHT * SPRITE_SCALE
    );
    ctx.restore();

    if (game_state === 'gameover') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);  
        ctx.fillStyle = '#ff4444';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 50);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.fillText('You were destroyed by Goku', canvas.width / 2, canvas.height / 2);
        
        ctx.font = 'bold 18px Arial';
        ctx.fillText('Click RUN to return to start', canvas.width / 2, canvas.height / 2 + 40);
    }
}

function animate() {
    frame_counter++;
    if (frame_counter >= frame_delay) {
        if (game_state === 'moving_left' || game_state === 'moving_right') {
            current_frame = (current_frame + 0.3) % 9;
        }
        frame_counter = 0;
    }

    if (fight_hit_anim) {
        fight_hit_counter++;
        if (fight_hit_counter >= 10) {
            fight_hit_frame += 0.3;
            if (fight_hit_frame >= 3) {
                fight_hit_anim = false;
                game_state = 'gameover';
            }
            fight_hit_counter = 0;
        }
    }

    if (game_state === 'encounter' || game_state === 'gameover') {
        goku_frame_counter++;
        if (goku_frame_counter >= 8) {
            const current_animation = goku_anim_frames[goku_anim];
            const max_frames = current_animation.frames.length;
            
            if (goku_frame < max_frames - 1) {
                goku_frame += 1;
            } else {
                if (goku_anim === 'fight') {
                    goku_anim_complete = true;
                    fight_hit_anim = true;
                    fight_hit_frame = 0;
                    goku_anim = 'idle';
                    goku_frame = 0;
                    goku_h = GOKU_HEIGHT;
                } else if (goku_anim === 'taunt') {
                    goku_anim_complete = true;
                    is_knight_hit = true;
                    goku_anim = 'idle';
                    goku_frame = 0;
                } else if (goku_anim === 'idle') {
                    goku_frame = 0;
                }
            }
            goku_frame_counter = 0;
        }
    }

    if (game_state === 'moving_left') {
        bg_x -= 4;
        bg_x2 -= 4;
        distance_traveled += 4;
        
        if (bg_x <= -canvas.width) {
            bg_x = bg_x2 + canvas.width;
        }
        if (bg_x2 <= -canvas.width) {
            bg_x2 = bg_x + canvas.width;
        }
        
        if (distance_traveled >= 300) {
            game_state = 'encounter';
            document.getElementById('leftButton').style.display = 'none';
            document.getElementById('rightButton').style.display = 'none';
            document.getElementById('battleButtons').style.display = 'flex';
            bg_x = 0;
            bg_x2 = canvas.width;
            goku_anim = 'idle';
            goku_frame = 0;
            goku_anim_complete = false;
            distance_traveled = 0;
            current_frame = 0;
        }
    }

    if (game_state === 'moving_right') {
        bg_x += 4;
        bg_x2 += 4;
        distance_traveled += 4;
        
        if (bg_x >= canvas.width) {
            bg_x = bg_x2 - canvas.width;
        }
        if (bg_x2 >= canvas.width) {
            bg_x2 = bg_x - canvas.width;
        }
        
        if (distance_traveled >= 300) {
            reset_to_start();
        }
    }

    render();
    requestAnimationFrame(animate);
}

function startGame() {
    animate();
}

function reset_to_start() {
    game_state = 'start';
    bg_x = 0;
    bg_x2 = canvas.width;
    moving_left = false;
    knight_row = 7;
    goku_anim = 'idle';
    goku_frame = 0;
    goku_anim_complete = false;
    current_frame = 5;
    distance_traveled = 0;
    goku_h = GOKU_HEIGHT;
    document.getElementById('leftButton').style.display = 'block';
    document.getElementById('rightButton').style.display = 'block';
    document.getElementById('battleButtons').style.display = 'none';
}

function full_reset() {
    is_knight_hit = false;
    fight_hit_anim = false;
    fight_hit_frame = 0;
    fight_hit_counter = 0;
    facing_left = false;
    reset_to_start();
}

document.getElementById('leftButton').addEventListener('click', function() {
    if (game_state === 'start') {
        game_state = 'moving_left';
        facing_left = true;
        moving_left = true;
        knight_row = 0;
        current_frame = 0;
    }
});

document.getElementById('rightButton').addEventListener('click', function() {
    alert('Right path chosen!');
});

document.getElementById('fightButton').addEventListener('click', function() {
    if (game_state === 'encounter' && goku_anim === 'idle') {
        goku_anim = 'fight';
        goku_frame = 0;
        goku_anim_complete = false;
        goku_h = 170;
    }
});

document.getElementById('runButton').addEventListener('click', function() {
    if (game_state === 'gameover') {
        full_reset();
    } else if (is_knight_hit) {
        game_state = 'moving_right';
        knight_row = 0;
        current_frame = 0;
        facing_left = false;
        document.getElementById('leftButton').style.display = 'none';
        document.getElementById('rightButton').style.display = 'none';
        document.getElementById('battleButtons').style.display = 'none';
        distance_traveled = 0;
    }
});

document.getElementById('tauntButton').addEventListener('click', function() {
    if (game_state === 'encounter' && !is_knight_hit && goku_anim === 'idle') {
        goku_anim = 'taunt';
        goku_frame = 0;
        goku_anim_complete = false;
    }
});

loadImage('./images/simple.jpg', function(img) {
    bg_image = img;
});

loadImage('./knights.png', function(img) {
    knight_sheet = img;
});

loadImage('./gokus.png', function(img) {
    goku_sheet = img;
});