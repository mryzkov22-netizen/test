// Pokemon Game Engine
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game Constants
const TILE_SIZE = 48;
const MAP_WIDTH = 20;
const MAP_HEIGHT = 15;
const PLAYER_SPEED = 0.2; // Smooth movement speed
const CAMERA_SMOOTHING = 0.1; // Camera lerp factor

// Game State
let gameState = 'OVERWORLD'; // OVERWORLD, BATTLE, DIALOG, HOUSE_TRANSITION
let currentMap = 'pallet_town';
let lastTime = 0;
let camera = { x: 0, y: 0, targetX: 0, targetY: 0 };
let dialogQueue = [];
let currentDialog = null;
let dialogTimer = 0;
let notification = null;
let notificationTimer = 0;
let areaTransitionText = null;
let areaTransitionTimer = 0;

// Input State
const keys = {};
let moveDelay = 0;
const MOVE_DELAY_TIME = 120; // ms

// Assets
const sprites = {};
const audio = {};

// Player Object
const player = {
    x: 10,
    y: 7,
    direction: 'down', // up, down, left, right
    moving: false,
    moveProgress: 0,
    startX: 10,
    startY: 7,
    targetX: 10,
    targetY: 7,
    spriteFrame: 0,
    walkCycle: 0
};

// Battle System
let battleState = null;

// Maps Data
const maps = {
    'pallet_town': {
        name: 'Pallet Town',
        width: 20,
        height: 15,
        tiles: [],
        warps: [
            { x: 18, y: 2, targetMap: 'route_1', targetX: 2, targetY: 13, label: 'Route 1' },
            { x: 4, y: 4, targetMap: 'house_1', targetX: 4, targetY: 8, type: 'door' },
            { x: 6, y: 4, targetMap: 'house_2', targetX: 4, targetY: 8, type: 'door' },
            { x: 14, y: 2, targetMap: 'lab_exterior', targetX: 9, targetY: 12, type: 'door' }
        ],
        npcs: [
            { x: 8, y: 5, direction: 'down', sprite: 'npc-down.png', name: 'Mom', dialog: ["Be careful on your journey!", "Don't forget to visit the Lab."] },
            { x: 15, y: 8, direction: 'left', sprite: 'npc-down.png', name: 'Fisherman', dialog: ["Fishing is relaxing.", "Have you tried the sea?"] }
        ],
        trainers: [
            { x: 18, y: 10, direction: 'up', sprite: 'trainer-down.png', name: 'Rival', defeated: false, team: ['squirtle', 'pidgey'], dialog: ["Let's battle!", "I knew it! I lost..."] }
        ],
        items: [
            { x: 2, y: 12, type: 'potion', collected: false },
            { x: 17, y: 3, type: 'pokeball', collected: false }
        ]
    },
    'route_1': {
        name: 'Route 1',
        width: 20,
        height: 15,
        tiles: [],
        warps: [
            { x: 2, y: 1, targetMap: 'viridian_city', targetX: 10, targetY: 13, label: 'Viridian City' },
            { x: 18, y: 13, targetMap: 'pallet_town', targetX: 18, targetY: 3, label: 'Pallet Town' }
        ],
        npcs: [],
        trainers: [
            { x: 10, y: 7, direction: 'down', sprite: 'trainer-down.png', name: 'Youngster', defeated: false, team: ['pidgey', 'rattata'], dialog: ["Hey! Battle time!", "Oops, I lost."] }
        ],
        items: [
            { x: 5, y: 5, type: 'berry', collected: false },
            { x: 15, y: 10, type: 'potion', collected: false }
        ]
    },
    'viridian_city': {
        name: 'Viridian City',
        width: 20,
        height: 15,
        tiles: [],
        warps: [
            { x: 10, y: 13, targetMap: 'route_1', targetX: 2, targetY: 2, label: 'Route 1' },
            { x: 5, y: 2, targetMap: 'mart_interior', targetX: 4, targetY: 8, type: 'door' },
            { x: 15, y: 2, targetMap: 'center_interior', targetX: 4, targetY: 8, type: 'door' },
            { x: 8, y: 2, targetMap: 'gym_exterior', targetX: 4, targetY: 8, type: 'door' }
        ],
        npcs: [
            { x: 12, y: 8, direction: 'down', sprite: 'npc-down.png', name: 'Citizen', dialog: ["The Gym Leader is strong.", "Good luck!"] }
        ],
        trainers: [],
        items: [
            { x: 2, y: 10, type: 'pokeball', collected: false }
        ]
    },
    'lab_exterior': {
        name: 'Professor\'s Lab',
        width: 20,
        height: 15,
        tiles: [],
        warps: [
            { x: 9, y: 12, targetMap: 'pallet_town', targetX: 14, targetY: 4, label: 'Pallet Town' },
            { x: 9, y: 4, targetMap: 'lab_interior', targetX: 4, targetY: 8, type: 'door' }
        ],
        npcs: [],
        trainers: [],
        items: []
    },
    'gym_exterior': {
        name: 'Viridian Gym',
        width: 20,
        height: 15,
        tiles: [],
        warps: [
            { x: 4, y: 8, targetMap: 'viridian_city', targetX: 8, targetY: 4, label: 'Viridian City' },
            { x: 4, y: 2, targetMap: 'gym_interior', targetX: 4, targetY: 8, type: 'door' }
        ],
        npcs: [],
        trainers: [],
        items: []
    },
    // Interiors
    'house_1': {
        name: 'Cozy Home',
        width: 10,
        height: 10,
        tiles: [],
        warps: [
            { x: 4, y: 8, targetMap: 'pallet_town', targetX: 4, targetY: 5, type: 'exit' }
        ],
        npcs: [
            { x: 2, y: 3, direction: 'right', sprite: 'npc-down.png', name: 'Sister', dialog: ["Welcome to our home!", "Mom is in the kitchen."] }
        ],
        trainers: [],
        items: [
            { x: 7, y: 2, type: 'potion', collected: false }
        ]
    },
    'house_2': {
        name: 'Neighbor\'s House',
        width: 10,
        height: 10,
        tiles: [],
        warps: [
            { x: 4, y: 8, targetMap: 'pallet_town', targetX: 6, targetY: 5, type: 'exit' }
        ],
        npcs: [
            { x: 6, y: 3, direction: 'left', sprite: 'npc-down.png', name: 'Brother', dialog: ["I love Pokemon!", "Do you have any?"] }
        ],
        trainers: [],
        items: [
            { x: 1, y: 2, type: 'berry', collected: false }
        ]
    },
    'lab_interior': {
        name: 'Professor\'s Lab',
        width: 10,
        height: 10,
        tiles: [],
        warps: [
            { x: 4, y: 8, targetMap: 'lab_exterior', targetX: 9, targetY: 5, type: 'exit' }
        ],
        npcs: [
            { x: 4, y: 3, direction: 'down', sprite: 'npc-down.png', name: 'Professor', dialog: ["Ah, welcome!", "Choose your starter Pokemon."] }
        ],
        trainers: [],
        items: [
            { x: 7, y: 3, type: 'pokeball', collected: false }
        ]
    },
    'mart_interior': {
        name: 'Poké Mart',
        width: 10,
        height: 10,
        tiles: [],
        warps: [
            { x: 4, y: 8, targetMap: 'viridian_city', targetX: 5, targetY: 4, type: 'exit' }
        ],
        npcs: [
            { x: 4, y: 3, direction: 'down', sprite: 'npc-down.png', name: 'Clerk', dialog: ["Welcome to Poké Mart!", "How can I help you?"] }
        ],
        trainers: [],
        items: []
    },
    'center_interior': {
        name: 'Pokémon Center',
        width: 10,
        height: 10,
        tiles: [],
        warps: [
            { x: 4, y: 8, targetMap: 'viridian_city', targetX: 15, targetY: 4, type: 'exit' }
        ],
        npcs: [
            { x: 4, y: 3, direction: 'down', sprite: 'npc-down.png', name: 'Nurse', dialog: ["Welcome to Pokémon Center!", "We heal your Pokémon."] }
        ],
        trainers: [],
        items: []
    },
    'gym_interior': {
        name: 'Viridian Gym',
        width: 10,
        height: 10,
        tiles: [],
        warps: [
            { x: 4, y: 8, targetMap: 'gym_exterior', targetX: 4, targetY: 4, type: 'exit' }
        ],
        npcs: [],
        trainers: [
            { x: 4, y: 3, direction: 'down', sprite: 'trainer-down.png', name: 'Gym Leader', defeated: false, team: ['onix', 'pikachu'], dialog: ["I am the Gym Leader!", "Show me your strength!"] }
        ],
        items: []
    }
};

// Initialize Map Tiles
function initMapTiles(mapKey) {
    const map = maps[mapKey];
    map.tiles = [];
    
    for (let y = 0; y < map.height; y++) {
        map.tiles[y] = [];
        for (let x = 0; x < map.width; x++) {
            // Default tiles based on map type
            let tile = 'grass';
            
            if (mapKey.includes('house') || mapKey.includes('interior')) {
                // Interior maps
                if (y === 0 || y === map.height - 1 || x === 0 || x === map.width - 1) {
                    tile = 'house-wall';
                } else if (y === 1 && x === 4) {
                    tile = 'door';
                } else {
                    tile = 'house-floor';
                }
                
                // Add furniture
                if (mapKey === 'house_1' && x === 7 && y === 3) tile = 'bookshelf';
                if (mapKey === 'house_2' && x === 1 && y === 3) tile = 'pc';
                if (mapKey === 'lab_interior' && x === 2 && y === 3) tile = 'pc';
                if (mapKey === 'lab_interior' && x === 6 && y === 3) tile = 'bookshelf';
                if (mapKey === 'mart_interior' && x >= 2 && x <= 6 && y === 3) tile = 'counter';
                if (mapKey === 'center_interior' && x >= 2 && x <= 6 && y === 3) tile = 'counter';
                if (mapKey === 'gym_interior' && x === 2 && y === 2) tile = 'rock';
                
            } else if (mapKey === 'pallet_town') {
                // Pallet Town layout
                if (y === 0 || y === 14 || x === 0 || x === 19) tile = 'tree';
                else if ((y === 4 && x >= 3 && x <= 7) || (y === 4 && x >= 13 && x <= 15)) tile = 'house-wall';
                else if (y === 4 && (x === 4 || x === 6 || x === 14)) tile = 'door';
                else if (y >= 5 && y <= 7 && (x === 3 || x === 7 || x === 13 || x === 15)) tile = 'house-wall';
                else if (y === 2 && x >= 12 && x <= 16) tile = 'house-wall';
                else if (y === 2 && x === 14) tile = 'door';
                else if (y === 3 && x >= 12 && x <= 16) tile = 'house-wall';
                else if (x === 10 && y >= 8 && y <= 12) tile = 'water';
                else if (x === 9 && y >= 8 && y <= 12) tile = 'bridge';
                else if (x === 11 && y >= 8 && y <= 12) tile = 'bridge';
                else if (y === 10 && x >= 8 && x <= 12) tile = 'bridge';
                else if ((x === 8 || x === 12) && (y === 8 || y === 12)) tile = 'flower';
                else if (y === 13 && x >= 16 && x <= 18) tile = 'dirt-path';
                else if (x === 18 && y >= 2 && y <= 13) tile = 'dirt-path';
                else if (y === 2 && x >= 16 && x <= 18) tile = 'dirt-path';
                
            } else if (mapKey === 'route_1') {
                // Route 1 - Path
                if (y === 0 || y === 14 || x === 0 || x === 19) tile = 'tree';
                else if (x === 10 && y >= 2 && y <= 12) tile = 'dirt-path';
                else if (y === 7 && x >= 6 && x <= 14) tile = 'dirt-path';
                else if ((x === 6 || x === 14) && (y === 6 || y === 8)) tile = 'flower';
                else if (x === 5 && y === 5) tile = 'rock';
                else if (x === 15 && y === 10) tile = 'rock';
                
            } else if (mapKey === 'viridian_city') {
                // Viridian City
                if (y === 0 || y === 14 || x === 0 || x === 19) tile = 'house-wall';
                else if (y === 2 && x >= 4 && x <= 6) tile = 'house-wall';
                else if (y === 2 && x === 5) tile = 'door';
                else if (y === 2 && x >= 8 && x <= 10) tile = 'house-wall';
                else if (y === 2 && x === 9) tile = 'door'; // Gym
                else if (y === 2 && x >= 14 && x <= 16) tile = 'house-wall';
                else if (y === 2 && x === 15) tile = 'door';
                else if ((y === 3 || y === 4) && (x === 4 || x === 6 || x === 8 || x === 10 || x === 14 || x === 16)) tile = 'house-wall';
                else if (x === 10 && y >= 6 && y <= 10) tile = 'water';
                else if (x === 9 && y >= 6 && y <= 10) tile = 'bridge';
                else if (x === 11 && y >= 6 && y <= 10) tile = 'bridge';
                else if (y === 8 && x >= 8 && x <= 12) tile = 'bridge';
                else if (x === 10 && y >= 11 && y <= 13) tile = 'dirt-path';
                
            } else if (mapKey === 'lab_exterior' || mapKey === 'gym_exterior') {
                // Building exteriors
                if (y === 0 || y === 14 || x === 0 || x === 19) tile = 'tree';
                else if (y === 4 && x >= 3 && x <= 15) tile = 'house-wall';
                else if (y === 4 && x === 9) tile = 'door';
                else if ((y === 5 || y === 6 || y === 7 || y === 8 || y === 9 || y === 10 || y === 11) && (x === 3 || x === 15)) tile = 'house-wall';
                else if (y === 12 && x >= 3 && x <= 15) tile = 'house-wall';
                else if (y === 12 && x === 9) tile = 'door';
                else if (x === 9 && y >= 5 && y <= 11) tile = 'house-floor';
                else if (y === 13 && x >= 7 && x <= 11) tile = 'dirt-path';
            }
            
            map.tiles[y][x] = tile;
        }
    }
}

// Initialize all maps
Object.keys(maps).forEach(key => initMapTiles(key));

// Load Sprites
function loadSprites() {
    const spriteList = [
        'player-down.png', 'player-up.png', 'player-left.png', 'player-right.png',
        'npc-down.png', 'trainer-down.png',
        'pokeball.png', 'potion.png', 'berry.png',
        'grass.png', 'dirt-path.png', 'water.png', 'tree.png',
        'house-floor.png', 'house-wall.png', 'door.png',
        'counter.png', 'pc.png', 'bookshelf.png',
        'flower.png', 'rock.png', 'sand.png', 'bridge.png',
        'bulbasaur-front.png', 'bulbasaur-back.png',
        'charmander-front.png', 'charmander-back.png',
        'squirtle-front.png', 'squirtle-back.png',
        'pikachu-front.png', 'pikachu-back.png',
        'jigglypuff-front.png', 'jigglypuff-back.png',
        'geodude-front.png', 'geodude-back.png',
        'magikarp-front.png', 'magikarp-back.png',
        'psyduck-front.png', 'psyduck-back.png',
        'machop-front.png', 'machop-back.png',
        'gastly-front.png', 'gastly-back.png'
    ];

    let loaded = 0;
    spriteList.forEach(src => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            loaded++;
            if (loaded === spriteList.length) {
                console.log('All sprites loaded');
                gameLoop(0);
            }
        };
        sprites[src] = img;
    });
}

// Draw Tile
function drawTile(tileKey, x, y) {
    const img = sprites[tileKey + '.png'] || sprites['grass.png'];
    if (img) {
        ctx.drawImage(img, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
}

// Draw Sprite
function drawSprite(spriteKey, x, y, flipH = false, flipV = false) {
    const img = sprites[spriteKey];
    if (!img) return;
    
    ctx.save();
    ctx.translate(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2);
    
    if (flipH) ctx.scale(-1, 1);
    if (flipV) ctx.scale(1, -1);
    
    ctx.drawImage(img, -TILE_SIZE / 2, -TILE_SIZE / 2, TILE_SIZE, TILE_SIZE);
    ctx.restore();
}

// Check Collision
function checkCollision(x, y) {
    const map = maps[currentMap];
    if (x < 0 || x >= map.width || y < 0 || y >= map.height) return true;
    
    const tile = map.tiles[Math.floor(y)][Math.floor(x)];
    const solidTiles = ['tree', 'water', 'house-wall', 'counter', 'pc', 'bookshelf', 'rock'];
    
    if (solidTiles.includes(tile)) return true;
    
    // Check NPCs
    for (const npc of map.npcs) {
        if (Math.abs(npc.x - x) < 0.8 && Math.abs(npc.y - y) < 0.8) return true;
    }
    
    // Check Trainers
    for (const trainer of map.trainers) {
        if (!trainer.defeated && Math.abs(trainer.x - x) < 0.8 && Math.abs(trainer.y - y) < 0.8) return true;
    }
    
    return false;
}

// Handle Movement Input
function handleDirection(dir) {
    player.direction = dir;
    
    if (gameState !== 'OVERWORLD') return;
    
    let dx = 0, dy = 0;
    if (dir === 'up') dy = -1;
    else if (dir === 'down') dy = 1;
    else if (dir === 'left') dx = -1;
    else if (dir === 'right') dx = 1;
    
    const newX = player.x + dx;
    const newY = player.y + dy;
    
    // Allow turning in place even if blocked
    if (checkCollision(newX, newY)) {
        return; // Just turned, didn't move
    }
    
    if (!player.moving) {
        player.moving = true;
        player.startX = player.x;
        player.startY = player.y;
        player.targetX = newX;
        player.targetY = newY;
        player.moveProgress = 0;
    }
}

// Update Player
function updatePlayer(dt) {
    if (player.moving) {
        player.moveProgress += PLAYER_SPEED;
        if (player.moveProgress >= 1) {
            player.x = player.targetX;
            player.y = player.targetY;
            player.moving = false;
            player.moveProgress = 0;
            
            // Check warps
            checkWarps();
        } else {
            player.x = player.startX + (player.targetX - player.startX) * player.moveProgress;
            player.y = player.startY + (player.targetY - player.startY) * player.moveProgress;
        }
        
        // Walk cycle animation
        player.walkCycle += dt * 0.015;
    }
}

// Check Warps
function checkWarps() {
    const map = maps[currentMap];
    const px = Math.round(player.x);
    const py = Math.round(player.y);
    
    for (const warp of map.warps) {
        if (px === warp.x && py === warp.y) {
            if (warp.type === 'door') {
                showNotification(`Enter ${warp.targetMap.replace('_', ' ')}? Press SPACE`);
                // Wait for space press handled in input
                return;
            } else if (warp.type === 'exit') {
                transitionToMap(warp.targetMap, warp.targetX, warp.targetY);
            } else {
                // Regular warp
                showAreaTransition(warp.label);
                setTimeout(() => {
                    transitionToMap(warp.targetMap, warp.targetX, warp.targetY);
                }, 300);
            }
            break;
        }
    }
}

// Handle Door Interaction
function handleDoorInteraction() {
    const map = maps[currentMap];
    const px = Math.round(player.x);
    const py = Math.round(player.y);
    
    for (const warp of map.warps) {
        if (warp.type === 'door' && px === warp.x && py === warp.y) {
            transitionToMap(warp.targetMap, warp.targetX, warp.targetY);
            return true;
        }
    }
    return false;
}

// Transition to Map
function transitionToMap(mapKey, x, y) {
    currentMap = mapKey;
    player.x = x;
    player.y = y;
    player.targetX = x;
    player.targetY = y;
    player.startX = x;
    player.startY = y;
    player.moving = false;
    
    // Reset camera immediately to avoid jarring effect
    const map = maps[currentMap];
    camera.targetX = player.x * TILE_SIZE - canvas.width / 2 + TILE_SIZE / 2;
    camera.targetY = player.y * TILE_SIZE - canvas.height / 2 + TILE_SIZE / 2;
    camera.x = camera.targetX;
    camera.y = camera.targetY;
    
    showAreaTransition(map.name);
}

// Update Camera
function updateCamera() {
    const map = maps[currentMap];
    const targetCamX = player.x * TILE_SIZE - canvas.width / 2 + TILE_SIZE / 2;
    const targetCamY = player.y * TILE_SIZE - canvas.height / 2 + TILE_SIZE / 2;
    
    // Clamp camera to map bounds
    const maxCamX = (map.width * TILE_SIZE) - canvas.width;
    const maxCamY = (map.height * TILE_SIZE) - canvas.height;
    
    camera.targetX = Math.max(0, Math.min(targetCamX, maxCamX));
    camera.targetY = Math.max(0, Math.min(targetCamY, maxCamY));
    
    // Smooth camera movement (lerp)
    camera.x += (camera.targetX - camera.x) * CAMERA_SMOOTHING;
    camera.y += (camera.targetY - camera.y) * CAMERA_SMOOTHING;
}

// Show Notification
function showNotification(text) {
    notification = text;
    notificationTimer = 2000;
}

// Show Area Transition
function showAreaTransition(text) {
    areaTransitionText = text;
    areaTransitionTimer = 2000;
}

// Draw World
function drawWorld() {
    const map = maps[currentMap];
    
    ctx.save();
    ctx.translate(-Math.floor(camera.x), -Math.floor(camera.y));
    
    // Calculate visible range
    const startCol = Math.floor(camera.x / TILE_SIZE);
    const endCol = startCol + (canvas.width / TILE_SIZE) + 1;
    const startRow = Math.floor(camera.y / TILE_SIZE);
    const endRow = startRow + (canvas.height / TILE_SIZE) + 1;
    
    // Draw tiles
    for (let y = Math.max(0, startRow); y < Math.min(map.height, endRow); y++) {
        for (let x = Math.max(0, startCol); x < Math.min(map.width, endCol); x++) {
            drawTile(map.tiles[y][x], x, y);
        }
    }
    
    // Draw items
    for (const item of map.items) {
        if (!item.collected) {
            drawSprite(item.type, item.x, item.y);
        }
    }
    
    // Draw NPCs
    for (const npc of map.npcs) {
        drawSprite(npc.sprite, npc.x, npc.y);
    }
    
    // Draw Trainers
    for (const trainer of map.trainers) {
        if (!trainer.defeated) {
            drawSprite(trainer.sprite, trainer.x, trainer.y);
        }
    }
    
    // Draw Player
    let playerSprite = 'player-down.png';
    let flipH = false;
    
    if (player.direction === 'up') playerSprite = 'player-up.png';
    else if (player.direction === 'down') playerSprite = 'player-down.png';
    else if (player.direction === 'left') {
        playerSprite = 'player-left.png';
        flipH = false;
    } else if (player.direction === 'right') {
        playerSprite = 'player-right.png';
        flipH = false;
    }
    
    // Flip sprite when moving left
    if (player.direction === 'left') {
        flipH = true;
    }
    
    drawSprite(playerSprite, player.x, player.y, flipH);
    
    ctx.restore();
}

// Draw UI
function drawUI() {
    // Dialog Box
    if (currentDialog) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(20, canvas.height - 120, canvas.width - 40, 100);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.strokeRect(20, canvas.height - 120, canvas.width - 40, 100);
        
        ctx.fillStyle = '#fff';
        ctx.font = '18px "Press Start 2P", monospace';
        ctx.textAlign = 'left';
        
        const lines = currentDialog.text.split('\n');
        lines.forEach((line, i) => {
            ctx.fillText(line, 40, canvas.height - 85 + (i * 25));
        });
        
        // Blinking continue indicator
        if (Math.floor(Date.now() / 500) % 2 === 0) {
            ctx.fillText('▼', canvas.width - 50, canvas.height - 40);
        }
    }
    
    // Notification
    if (notification && notificationTimer > 0) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(canvas.width / 2 - 150, 50, 300, 40);
        ctx.fillStyle = '#fff';
        ctx.font = '14px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(notification, canvas.width / 2, 75);
    }
    
    // Area Transition
    if (areaTransitionText && areaTransitionTimer > 0) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(canvas.width / 2 - 120, canvas.height / 2 - 30, 240, 60);
        ctx.fillStyle = '#FFD700';
        ctx.font = '20px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(areaTransitionText, canvas.width / 2, canvas.height / 2 + 5);
        
        // Blinking warp indicator
        if (Math.floor(Date.now() / 300) % 2 === 0) {
            ctx.fillStyle = '#fff';
            ctx.font = '14px "Press Start 2P", monospace';
            ctx.fillText('AREA TRANSITION', canvas.width / 2, canvas.height / 2 + 35);
        }
    }
    
    // Location Name (top left)
    const map = maps[currentMap];
    if (map) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(10, 10, 200, 35);
        ctx.fillStyle = '#fff';
        ctx.font = '14px "Press Start 2P", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(map.name, 20, 32);
    }
}

// Start Battle
function startBattle(trainer) {
    gameState = 'BATTLE';
    
    const playerTeam = [
        { name: 'pikachu', level: 5, hp: 20, maxHp: 20, exp: 0, moves: ['thundershock', 'quickattack'] }
    ];
    
    const enemyTeam = trainer.team.map(pokeName => ({
        name: pokeName,
        level: 4,
        hp: 15,
        maxHp: 15,
        moves: ['tackle', 'growl']
    }));
    
    battleState = {
        playerTeam: playerTeam,
        enemyTeam: enemyTeam,
        currentPlayerMon: 0,
        currentEnemyMon: 0,
        turn: 'PLAYER',
        log: [`Wild ${trainer.name} challenged you!`, `Go! ${playerTeam[0].name}!`],
        logIndex: 0,
        trainer: trainer,
        menuState: 'MAIN', // MAIN, FIGHT, ITEM, POKEBALL
        selectedMove: 0,
        animating: false
    };
    
    renderBattle();
}

// Render Battle Scene
function renderBattle() {
    if (gameState !== 'BATTLE' || !battleState) return;
    
    // Clear canvas
    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Battle background
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2);
    
    const bs = battleState;
    const playerMon = bs.playerTeam[bs.currentPlayerMon];
    const enemyMon = bs.enemyTeam[bs.currentEnemyMon];
    
    // Draw Enemy Pokemon (back sprite)
    const enemySpriteKey = `${enemyMon.name}-back.png`;
    if (sprites[enemySpriteKey]) {
        ctx.drawImage(sprites[enemySpriteKey], canvas.width - 180, 80, 120, 120);
    }
    
    // Draw Enemy HUD
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(canvas.width - 280, 40, 260, 70);
    ctx.fillStyle = '#fff';
    ctx.font = '14px "Press Start 2P", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(enemyMon.name.toUpperCase(), canvas.width - 270, 65);
    ctx.fillText(`Lv${enemyMon.level}`, canvas.width - 270, 85);
    
    // Enemy HP Bar
    const hpPercent = enemyMon.hp / enemyMon.maxHp;
    ctx.fillStyle = '#333';
    ctx.fillRect(canvas.width - 270, 95, 200, 10);
    ctx.fillStyle = hpPercent > 0.5 ? '#4CAF50' : hpPercent > 0.2 ? '#FFC107' : '#F44336';
    ctx.fillRect(canvas.width - 270, 95, 200 * hpPercent, 10);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(canvas.width - 270, 95, 200, 10);
    
    // Draw Player Pokemon (front sprite)
    const playerSpriteKey = `${playerMon.name}-front.png`;
    if (sprites[playerSpriteKey]) {
        ctx.drawImage(sprites[playerSpriteKey], 100, canvas.height - 180, 140, 140);
    }
    
    // Draw Player HUD
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(20, canvas.height - 120, 280, 100);
    ctx.fillStyle = '#fff';
    ctx.font = '14px "Press Start 2P", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(playerMon.name.toUpperCase(), 40, canvas.height - 95);
    ctx.fillText(`Lv${playerMon.level}`, 40, canvas.height - 75);
    
    // Player HP Bar
    const playerHpPercent = playerMon.hp / playerMon.maxHp;
    ctx.fillStyle = '#333';
    ctx.fillRect(40, canvas.height - 65, 200, 10);
    ctx.fillStyle = playerHpPercent > 0.5 ? '#4CAF50' : playerHpPercent > 0.2 ? '#FFC107' : '#F44336';
    ctx.fillRect(40, canvas.height - 65, 200 * playerHpPercent, 10);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(40, canvas.height - 65, 200, 10);
    
    ctx.fillText(`${playerMon.hp}/${playerMon.maxHp}`, 40, canvas.height - 45);
    
    // Draw Text Box (Battle Log)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(20, canvas.height / 2 - 60, canvas.width - 40, 100);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.strokeRect(20, canvas.height / 2 - 60, canvas.width - 40, 100);
    
    ctx.fillStyle = '#fff';
    ctx.font = '16px "Press Start 2P", monospace';
    ctx.textAlign = 'left';
    
    const currentLog = bs.log[bs.logIndex] || bs.log[bs.log.length - 1];
    ctx.fillText(currentLog, 40, canvas.height / 2 - 20);
    
    if (bs.logIndex < bs.log.length - 1) {
        if (Math.floor(Date.now() / 500) % 2 === 0) {
            ctx.fillText('▼', canvas.width - 60, canvas.height / 2 + 20);
        }
    }
    
    // Draw Menu
    if (!bs.animating && bs.logIndex >= bs.log.length - 1) {
        if (bs.menuState === 'MAIN') {
            drawBattleMenu(['FIGHT', 'BAG', 'POKEMON', 'RUN']);
        } else if (bs.menuState === 'FIGHT') {
            const moves = playerMon.moves || ['tackle', 'growl'];
            drawBattleMenu(moves.map(m => m.toUpperCase()));
        } else if (bs.menuState === 'BAG') {
            drawBattleMenu(['POTION', 'POKEBALL', 'BACK']);
        } else if (bs.menuState === 'POKEMON') {
            drawBattleMenu(['PIKACHU', 'BACK']);
        }
    }
}

// Draw Battle Menu
function drawBattleMenu(options) {
    const menuWidth = 280;
    const menuHeight = 120;
    const menuX = canvas.width - menuWidth - 20;
    const menuY = canvas.height - menuHeight - 20;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(menuX, menuY, menuWidth, menuHeight);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.strokeRect(menuX, menuY, menuWidth, menuHeight);
    
    ctx.fillStyle = '#fff';
    ctx.font = '14px "Press Start 2P", monospace';
    ctx.textAlign = 'left';
    
    const cols = 2;
    const rows = 2;
    const cellWidth = menuWidth / cols;
    const cellHeight = menuHeight / rows;
    
    options.forEach((opt, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = menuX + col * cellWidth + 20;
        const y = menuY + row * cellHeight + 35;
        
        if (i === battleState.selectedMove) {
            ctx.fillStyle = '#FFD700';
            ctx.fillText('▶ ' + opt, x - 10, y);
            ctx.fillStyle = '#fff';
        } else {
            ctx.fillText(opt, x, y);
        }
    });
}

// Handle Battle Input
function handleBattleInput(key) {
    const bs = battleState;
    if (!bs || bs.animating) return;
    
    if (key === 'ArrowUp' || key === 'w') {
        if (bs.menuState === 'MAIN') bs.selectedMove = bs.selectedMove === 0 ? 2 : bs.selectedMove - 1;
        else if (bs.menuState === 'FIGHT') bs.selectedMove = bs.selectedMove === 0 ? 2 : bs.selectedMove - 1;
        else if (bs.menuState === 'BAG') bs.selectedMove = bs.selectedMove === 0 ? 2 : bs.selectedMove - 1;
    } else if (key === 'ArrowDown' || key === 's') {
        if (bs.menuState === 'MAIN') bs.selectedMove = bs.selectedMove === 3 ? 0 : bs.selectedMove + 1;
        else if (bs.menuState === 'FIGHT') bs.selectedMove = bs.selectedMove === 3 ? 0 : bs.selectedMove + 1;
        else if (bs.menuState === 'BAG') bs.selectedMove = bs.selectedMove === 2 ? 0 : bs.selectedMove + 1;
    } else if (key === 'ArrowLeft' || key === 'a') {
        if (bs.menuState === 'MAIN') bs.selectedMove = bs.selectedMove % 2 === 0 ? bs.selectedMove + 1 : bs.selectedMove - 1;
        else if (bs.menuState === 'FIGHT') bs.selectedMove = bs.selectedMove % 2 === 0 ? bs.selectedMove + 1 : bs.selectedMove - 1;
    } else if (key === 'ArrowRight' || key === 'd') {
        if (bs.menuState === 'MAIN') bs.selectedMove = bs.selectedMove % 2 === 1 ? bs.selectedMove - 1 : bs.selectedMove + 1;
        else if (bs.menuState === 'FIGHT') bs.selectedMove = bs.selectedMove % 2 === 1 ? bs.selectedMove - 1 : bs.selectedMove + 1;
    } else if (key === 'Enter' || key === ' ') {
        executeBattleAction();
    } else if (key === 'Escape') {
        if (bs.menuState !== 'MAIN') {
            bs.menuState = 'MAIN';
            bs.selectedMove = 0;
        }
    }
}

// Execute Battle Action
function executeBattleAction() {
    const bs = battleState;
    const playerMon = bs.playerTeam[bs.currentPlayerMon];
    const enemyMon = bs.enemyTeam[bs.currentEnemyMon];
    
    if (bs.menuState === 'MAIN') {
        if (bs.selectedMove === 0) bs.menuState = 'FIGHT';
        else if (bs.selectedMove === 1) bs.menuState = 'BAG';
        else if (bs.selectedMove === 2) bs.menuState = 'POKEMON';
        else if (bs.selectedMove === 3) {
            addBattleLog('Got away safely!');
            endBattle(false);
        }
    } else if (bs.menuState === 'FIGHT') {
        const moves = playerMon.moves || ['tackle', 'growl'];
        const selectedMove = moves[bs.selectedMove];
        
        bs.animating = true;
        addBattleLog(`${playerMon.name} used ${selectedMove}!`);
        
        setTimeout(() => {
            // Simple damage calculation
            const damage = Math.floor(Math.random() * 5) + 3;
            enemyMon.hp = Math.max(0, enemyMon.hp - damage);
            
            if (enemyMon.hp <= 0) {
                addBattleLog(`${enemyMon.name} fainted!`);
                setTimeout(() => {
                    bs.enemyTeam.splice(bs.currentEnemyMon, 1);
                    if (bs.enemyTeam.length === 0) {
                        addBattleLog('You won!');
                        setTimeout(() => endBattle(true), 1500);
                    } else {
                        bs.currentEnemyMon = 0;
                        addBattleLog(`Enemy sent out ${bs.enemyTeam[0].name}!`);
                        bs.animating = false;
                    }
                }, 1000);
            } else {
                // Enemy turn
                setTimeout(() => {
                    const enemyMoves = enemyMon.moves || ['tackle'];
                    const enemyMove = enemyMoves[Math.floor(Math.random() * enemyMoves.length)];
                    addBattleLog(`${enemyMon.name} used ${enemyMove}!`);
                    
                    setTimeout(() => {
                        const enemyDamage = Math.floor(Math.random() * 4) + 2;
                        playerMon.hp = Math.max(0, playerMon.hp - enemyDamage);
                        
                        if (playerMon.hp <= 0) {
                            addBattleLog(`${playerMon.name} fainted!`);
                            setTimeout(() => endBattle(false), 1500);
                        } else {
                            bs.animating = false;
                        }
                    }, 800);
                }, 800);
            }
        }, 800);
        
        bs.menuState = 'MAIN';
        bs.selectedMove = 0;
    } else if (bs.menuState === 'BAG') {
        if (bs.selectedMove === 0) {
            // Use Potion
            playerMon.hp = Math.min(playerMon.maxHp, playerMon.hp + 20);
            addBattleLog(`Used POTION! ${playerMon.name} recovered HP.`);
            bs.animating = true;
            setTimeout(() => {
                // Enemy turn
                const enemyMoves = enemyMon.moves || ['tackle'];
                const enemyMove = enemyMoves[Math.floor(Math.random() * enemyMoves.length)];
                addBattleLog(`${enemyMon.name} used ${enemyMove}!`);
                setTimeout(() => {
                    const enemyDamage = Math.floor(Math.random() * 4) + 2;
                    playerMon.hp = Math.max(0, playerMon.hp - enemyDamage);
                    if (playerMon.hp <= 0) {
                        addBattleLog(`${playerMon.name} fainted!`);
                        setTimeout(() => endBattle(false), 1500);
                    } else {
                        bs.animating = false;
                    }
                }, 800);
            }, 800);
            bs.menuState = 'MAIN';
        } else if (bs.selectedMove === 1) {
            // Use Pokeball
            const catchRate = enemyMon.hp < enemyMon.maxHp * 0.3 ? 0.8 : 0.3;
            if (Math.random() < catchRate) {
                addBattleLog(`Gotcha! ${enemyMon.name} was caught!`);
                setTimeout(() => endBattle(true, true), 1500);
            } else {
                addBattleLog(`Darn! The Pokemon broke free!`);
                bs.animating = true;
                setTimeout(() => {
                    const enemyMoves = enemyMon.moves || ['tackle'];
                    const enemyMove = enemyMoves[Math.floor(Math.random() * enemyMoves.length)];
                    addBattleLog(`${enemyMon.name} used ${enemyMove}!`);
                    setTimeout(() => {
                        const enemyDamage = Math.floor(Math.random() * 4) + 2;
                        playerMon.hp = Math.max(0, playerMon.hp - enemyDamage);
                        if (playerMon.hp <= 0) {
                            addBattleLog(`${playerMon.name} fainted!`);
                            setTimeout(() => endBattle(false), 1500);
                        } else {
                            bs.animating = false;
                        }
                    }, 800);
                }, 800);
                bs.menuState = 'MAIN';
            }
        } else {
            bs.menuState = 'MAIN';
        }
        bs.selectedMove = 0;
    } else if (bs.menuState === 'POKEMON') {
        bs.menuState = 'MAIN';
    }
}

// Add Battle Log
function addBattleLog(text) {
    battleState.log.push(text);
    battleState.logIndex = battleState.log.length - 1;
}

// End Battle
function endBattle(won, caught = false) {
    if (won && battleState.trainer) {
        battleState.trainer.defeated = true;
        showNotification('Trainer defeated!');
    }
    
    gameState = 'OVERWORLD';
    battleState = null;
}

// Interact with World
function interact() {
    if (gameState !== 'OVERWORLD') return;
    
    const map = maps[currentMap];
    
    // Check for door interaction first
    if (handleDoorInteraction()) {
        return;
    }
    
    // Get position in front of player
    let checkX = player.x;
    let checkY = player.y;
    
    if (player.direction === 'up') checkY -= 1;
    else if (player.direction === 'down') checkY += 1;
    else if (player.direction === 'left') checkX -= 1;
    else if (player.direction === 'right') checkX += 1;
    
    const cx = Math.round(checkX);
    const cy = Math.round(checkY);
    
    // Check for items
    for (const item of map.items) {
        if (!item.collected && Math.abs(item.x - cx) < 0.5 && Math.abs(item.y - cy) < 0.5) {
            item.collected = true;
            showNotification(`Picked up ${item.type}!`);
            return;
        }
    }
    
    // Check for NPCs
    for (const npc of map.npcs) {
        if (Math.abs(npc.x - cx) < 0.8 && Math.abs(npc.y - cy) < 0.8) {
            showDialog(npc.name, npc.dialog);
            return;
        }
    }
    
    // Check for Trainers
    for (const trainer of map.trainers) {
        if (!trainer.defeated && Math.abs(trainer.x - cx) < 0.8 && Math.abs(trainer.y - cy) < 0.8) {
            showDialog(trainer.name, [trainer.dialog[0]]);
            setTimeout(() => {
                startBattle(trainer);
            }, 1000);
            return;
        }
    }
}

// Show Dialog
function showDialog(speaker, lines) {
    currentDialog = { speaker, text: lines[0], lines: lines, index: 0 };
    gameState = 'DIALOG';
}

// Update Dialog
function updateDialog() {
    if (!currentDialog) return;
    
    dialogTimer += 16;
    if (dialogTimer > 500) {
        dialogTimer = 0;
        currentDialog.index++;
        if (currentDialog.index >= currentDialog.lines.length) {
            currentDialog = null;
            gameState = 'OVERWORLD';
        } else {
            currentDialog.text = currentDialog.lines[currentDialog.index];
        }
    }
}

// Advance Dialog
function advanceDialog() {
    if (!currentDialog) return;
    
    currentDialog.index++;
    if (currentDialog.index >= currentDialog.lines.length) {
        currentDialog = null;
        gameState = 'OVERWORLD';
    } else {
        currentDialog.text = currentDialog.lines[currentDialog.index];
    }
}

// Main Game Loop
function gameLoop(timestamp) {
    const dt = timestamp - lastTime;
    lastTime = timestamp;
    
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (gameState === 'OVERWORLD') {
        // Handle input delay
        if (moveDelay > 0) {
            moveDelay -= dt;
        } else {
            if (keys['ArrowUp'] || keys['w']) handleDirection('up');
            else if (keys['ArrowDown'] || keys['s']) handleDirection('down');
            else if (keys['ArrowLeft'] || keys['a']) handleDirection('left');
            else if (keys['ArrowRight'] || keys['d']) handleDirection('right');
            
            if (player.moving) {
                moveDelay = MOVE_DELAY_TIME;
            }
        }
        
        updatePlayer(dt);
        updateCamera();
        drawWorld();
        
        // Update timers
        if (notificationTimer > 0) notificationTimer -= dt;
        else notification = null;
        
        if (areaTransitionTimer > 0) areaTransitionTimer -= dt;
        else areaTransitionText = null;
        
    } else if (gameState === 'DIALOG') {
        drawWorld();
        updateDialog();
    } else if (gameState === 'BATTLE') {
        renderBattle();
    }
    
    drawUI();
    
    requestAnimationFrame(gameLoop);
}

// Event Listeners
window.addEventListener('keydown', e => {
    keys[e.key] = true;
    
    if (gameState === 'OVERWORLD') {
        if (e.key === 'Enter' || e.key === ' ') {
            interact();
        }
    } else if (gameState === 'DIALOG') {
        if (e.key === 'Enter' || e.key === ' ') {
            advanceDialog();
        }
    } else if (gameState === 'BATTLE') {
        handleBattleInput(e.key);
    }
    
    if (e.key === 'Escape') {
        if (gameState === 'BATTLE' && battleState) {
            if (battleState.menuState !== 'MAIN') {
                battleState.menuState = 'MAIN';
                battleState.selectedMove = 0;
            }
        }
    }
});

window.addEventListener('keyup', e => {
    keys[e.key] = false;
});

// Initialize Game
loadSprites();
