const HOLLOW_WIDTH = 150;
const HOLLOW_HEIGHT = 148;
const HOLLOW_SCALE = 2;
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
let bg1 = 0;
let bg2 = -canvas.width;
let moving_left = false;
let facing_left = false;
let knight_black = false;
let knight_row = 7;
let is_knight_hit = false;
let goku_anim_complete = false;
let dist_travelled = 0;
let goku_h = GOKU_HEIGHT;
let fight_hit_anim = false;
let fight_hit_frame = 0;
let fight_hit_counter = 0;

const knight_start_1 = (canvas.width / 2) - (HOLLOW_WIDTH * HOLLOW_SCALE / 2);
const knight_moving_2 = canvas.width * 0.50;
const knight_encounter_3 = canvas.width * 0.50;
const knight_y = canvas.height - (HOLLOW_HEIGHT * HOLLOW_SCALE) - 20;

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

function getHollowPosition(row, col) {
    return {
        x: BORDER_WIDTH + col * (SPACING_WIDTH + HOLLOW_WIDTH),
        y: BORDER_WIDTH + row * (SPACING_WIDTH + HOLLOW_HEIGHT)
    };
}
function getGokuSpritePosition(row, col) {
    return {
        x: col * GOKU_WIDTH,
        y: row * goku_h
    };
}
function getCurrentKnightPosition() {
    if (game_state === 'start') return knight_start_1;
    if (game_state === 'moving_left' || game_state === 'moving_right') return knight_moving_2;
    if (game_state === 'encounter' || game_state === 'gameover') return knight_encounter_3;
    if (game_state === 'void_room' || game_state === 'void_fail' || game_state === 'void_win') return knight_encounter_3;
    return knight_start_1;
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
        ctx.drawImage(bg_image, bg1, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
        ctx.drawImage(bg_image, bg2, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
    } else if (game_state === 'void_room' || game_state === 'void_fail' || game_state === 'void_win') {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
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

    if (game_state !== 'void_fail' && game_state !== 'void_win') {
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

        const knight_frame_pos = getHollowPosition(display_knight_row, knight_frame);
        const knight_x = getCurrentKnightPosition();
        ctx.save();
        
        const should_face_left = (game_state === 'moving_left') || (game_state === 'start' && facing_left) || (game_state === 'void_room' && facing_left);
        
        if (should_face_left) {
            ctx.scale(-1, 1);
            ctx.translate(-canvas.width, 0);
        }

        ctx.drawImage(
            knight_sheet,
            knight_frame_pos.x, knight_frame_pos.y,
            HOLLOW_WIDTH, HOLLOW_HEIGHT,
            should_face_left ? canvas.width - knight_x - (HOLLOW_WIDTH * HOLLOW_SCALE) : knight_x, knight_y,
            HOLLOW_WIDTH * HOLLOW_SCALE, HOLLOW_HEIGHT * HOLLOW_SCALE
        );
        ctx.restore();
    }

    if (game_state === 'gameover') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);  
        ctx.fillStyle = '#ff4444';
        ctx.font = 'bold 49px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 50);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.fillText('You were destroyed by Goku', canvas.width / 2, canvas.height / 2);
        
        ctx.font = 'bold 18px Arial';
        ctx.fillText('Click RESTART to return to start', canvas.width / 2, canvas.height / 2 + 40);
    }

    if (game_state === 'void_fail') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);  
        ctx.fillStyle = '#ff4444';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 50);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.fillText('To pass the void you must BE void', canvas.width / 2, canvas.height / 2);
        
        ctx.font = 'bold 18px Arial';
        ctx.fillText('Click RESTART to return to start', canvas.width / 2, canvas.height / 2 + 40);
        
        document.getElementById('battleButtons').style.display = 'flex';
        document.getElementById('runButton').innerText = 'RESTART';
    }

    if (game_state === 'void_win') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.87)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);  
        ctx.fillStyle = '#44ff44';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('YOU WIN!', canvas.width / 2, canvas.height / 2 - 50);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.fillText('You have escaped', canvas.width / 2, canvas.height / 2);
        
        ctx.font = 'bold 18px Arial';
        ctx.fillText('Click RESTART to return to start', canvas.width / 2, canvas.height / 2 + 40);
        
        document.getElementById('battleButtons').style.display = 'flex';
        document.getElementById('runButton').innerText = 'RESTART';
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
            if (fight_hit_frame >= 2) {
                fight_hit_frame = 2;
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
                    setTimeout(() => {
                        game_state = 'gameover';
                        document.getElementById('runButton').innerText = 'RESTART';
                    }, 800);
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
        bg1 -= 4;
        bg2 -= 4;
        dist_travelled += 4;
        
        if (bg1 <= -canvas.width) {
            bg1 = bg2 + canvas.width;
        }
        if (bg2 <= -canvas.width) {
            bg2 = bg1 + canvas.width;
        }
        
        if (dist_travelled >= 300) {
            game_state = 'encounter';
            document.getElementById('leftButton').style.display = 'none';
            document.getElementById('rightButton').style.display = 'none';
            document.getElementById('battleButtons').style.display = 'flex';
            bg1 = 0;
            bg2 = -canvas.width;
            goku_anim = 'idle';
            goku_frame = 0;
            goku_anim_complete = false;
            dist_travelled = 0;
            current_frame = 0;
        }
    }

    if (game_state === 'moving_right') {
        bg1 += 4;
        bg2 += 4;
        dist_travelled += 4;
        
        if (bg1 >= canvas.width) {
            bg1 = bg2 - canvas.width;
        }
        if (bg2 >= canvas.width) {
            bg2 = bg1 - canvas.width;
        }
        
        if (dist_travelled >= 300) {
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
    bg1 = 0;
    bg2 = -canvas.width;
    moving_left = false;
    knight_row = 7;
    goku_anim = 'idle';
    goku_frame = 0;
    goku_anim_complete = false;
    current_frame = 5;
    dist_travelled = 0;
    goku_h = GOKU_HEIGHT;
    document.getElementById('leftButton').style.display = 'block';
    document.getElementById('rightButton').style.display = 'block';
    document.getElementById('battleButtons').style.display = 'none';
    document.getElementById('runButton').innerText = 'RUN';
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
    if (game_state === 'start') {
        game_state = 'moving_right';
        facing_left = false;
        moving_left = false;
        knight_row = 0;
        current_frame = 0;
        
        setTimeout(() => {
            game_state = 'void_room';
            bg1 = 0;
            bg2 = -canvas.width;
            dist_travelled = 0;
            current_frame = 0;
            
            setTimeout(() => {
                if (is_knight_hit) {
                    game_state = 'void_win';
                    document.getElementById('runButton').innerText = 'RESTART';
                } else {
                    game_state = 'void_fail';
                    document.getElementById('runButton').innerText = 'RESTART';
                }
                document.getElementById('leftButton').style.display = 'none';
                document.getElementById('rightButton').style.display = 'none';
                document.getElementById('battleButtons').style.display = 'none';
            }, 1000);
        }, 1200);
    }
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
    if (game_state === 'gameover' || game_state === 'void_fail' || game_state === 'void_win') {
        fight_hit_anim = false;
        fight_hit_frame = 0;
        fight_hit_counter = 0;
        full_reset();
    } else if (is_knight_hit) {
        game_state = 'moving_right';
        knight_row = 0;
        current_frame = 0;
        facing_left = false;
        document.getElementById('leftButton').style.display = 'none';
        document.getElementById('rightButton').style.display = 'none';
        document.getElementById('battleButtons').style.display = 'none';
        dist_travelled = 0;
    }
});

document.getElementById('tauntButton').addEventListener('click', function() {
    if (game_state === 'encounter' && !is_knight_hit && goku_anim === 'idle') {
        goku_anim = 'taunt';
        goku_frame = 0;
        goku_anim_complete = false;
    }
});

loadImage('./images/walk.jpg', function(img) {
    bg_image = img;
});

loadImage('./knights.png', function(img) {
    knight_sheet = img;
});

loadImage('./gokus.png', function(img) {
    goku_sheet = img;
});