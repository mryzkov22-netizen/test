// Game Constants
const TILE_SIZE = 48;
const MAP_WIDTH = 20;
const MAP_HEIGHT = 15;
const CANVAS_WIDTH = TILE_SIZE * MAP_WIDTH;
const CANVAS_HEIGHT = TILE_SIZE * MAP_HEIGHT;

// Game State
const STATE = {
    ROAMING: 'roaming',
    BATTLE: 'battle',
    DIALOG: 'dialog',
    INSIDE: 'inside'
};

let currentState = STATE.ROAMING;
let currentMap = 'town'; // 'town', 'house_player', 'house_npc', 'mart', 'center'
let dialogQueue = [];
let currentDialog = null;

// Input Handling
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if ((e.code === 'Space' || e.code === 'Enter') && currentState === STATE.ROAMING) {
        tryInteract();
    } else if ((e.code === 'Space' || e.code === 'Enter') && currentState === STATE.BATTLE) {
        handleBattleInput();
    } else if ((e.code === 'Space' || e.code === 'Enter') && currentState === STATE.DIALOG) {
        advanceDialog();
    }
});
window.addEventListener('keyup', (e) => keys[e.code] = false);

// Player Object
const player = {
    x: 10,
    y: 7,
    direction: 'down',
    isMoving: false,
    moveProgress: 0,
    startX: 10,
    startY: 7,
    targetX: 10,
    targetY: 7,
    speed: 0.15, // Movement speed (0-1 per frame)
    team: [
        { name: 'Pikachu', level: 5, maxHp: 20, hp: 20, type: 'electric', moves: ['Tackle', 'Thunder Shock'] },
        { name: 'Charmander', level: 5, maxHp: 18, hp: 18, type: 'fire', moves: ['Scratch', 'Ember'] }
    ],
    items: ['Potion', 'Pokeball'],
    money: 100
};

// Camera
const camera = { x: 0, y: 0 };

// Maps Definition
const maps = {
    town: {
        width: 20,
        height: 15,
        data: [],
        objects: [],
        npcs: [],
        warps: [
            { x: 2, y: 2, w: 2, h: 1, target: 'house_player', tx: 2, ty: 3, label: "Player's House" },
            { x: 16, y: 2, w: 2, h: 1, target: 'mart', tx: 2, ty: 3, label: "Poké Mart" },
            { x: 16, y: 12, w: 2, h: 1, target: 'center', tx: 2, ty: 3, label: "Poké Center" },
            { x: 2, y: 12, w: 2, h: 1, target: 'house_npc', tx: 2, ty: 3, label: "Fisherman's House" }
        ]
    },
    house_player: {
        width: 6,
        height: 6,
        data: [],
        objects: [],
        npcs: [{ x: 4, y: 2, dir: 'left', text: "Mom: Don't forget to heal your Pokémon!" }],
        warps: [{ x: 2, y: 5, w: 2, h: 1, target: 'town', tx: 2, ty: 3 }]
    },
    mart: {
        width: 6,
        height: 6,
        data: [],
        objects: [],
        npcs: [{ x: 3, y: 1, dir: 'down', text: "Clerk: Welcome! Potions are $20." }],
        warps: [{ x: 2, y: 5, w: 2, h: 1, target: 'town', tx: 16, ty: 3 }]
    },
    center: {
        width: 6,
        height: 6,
        data: [],
        objects: [],
        npcs: [{ x: 3, y: 1, dir: 'down', text: "Nurse Joy: We can heal your Pokémon for free!" }],
        warps: [{ x: 2, y: 5, w: 2, h: 1, target: 'town', tx: 16, ty: 13 }]
    },
    house_npc: {
        width: 6,
        height: 6,
        data: [],
        objects: [],
        npcs: [{ x: 4, y: 2, dir: 'left', text: "Fisherman: I caught a Magikarp!" }],
        warps: [{ x: 2, y: 5, w: 2, h: 1, target: 'town', tx: 2, ty: 13 }]
    }
};

// Initialize Map Data (Procedural Generation for simplicity)
function initMaps() {
    // Town Map
    for (let y = 0; y < maps.town.height; y++) {
        let row = [];
        for (let x = 0; x < maps.town.width; x++) {
            if (y === 0 || y === maps.town.height - 1 || x === 0 || x === maps.town.width - 1) row.push('wall');
            else if ((x === 2 || x === 3) && (y === 2 || y === 12)) row.push('door');
            else if ((x === 16 || x === 17) && (y === 2 || y === 12)) row.push('door');
            else if (y === 7 && x > 5 && x < 15) row.push('water');
            else if (y === 6 && x > 5 && x < 15) row.push('bridge');
            else if (y === 8 && x > 5 && x < 15) row.push('bridge');
            else if ((x + y) % 2 === 0 && Math.random() > 0.8) row.push('tree');
            else if (Math.random() > 0.95) row.push('flower');
            else row.push('grass');
        }
        maps.town.data.push(row);
    }

    // Add Trainers to Town
    maps.town.npcs = [
        { x: 8, y: 4, dir: 'down', type: 'trainer', id: 1, text: "Trainer: Ready to battle?", battle: true },
        { x: 12, y: 10, dir: 'up', type: 'trainer', id: 2, text: "Trainer: My turn!", battle: true },
        { x: 5, y: 8, dir: 'right', type: 'trainer', id: 3, text: "Trainer: Don't walk away!", battle: true },
        { x: 15, y: 6, dir: 'left', type: 'trainer', id: 4, text: "Trainer: Challenge accepted!", battle: true },
        { x: 10, y: 2, dir: 'down', type: 'npc', text: "Hiker: Nice weather today." },
        { x: 10, y: 13, dir: 'up', type: 'npc', text: "Lass: Have you seen my doll?" }
    ];

    // Interior Maps (Simple floors)
    const interiors = ['house_player', 'mart', 'center', 'house_npc'];
    interiors.forEach(key => {
        for (let y = 0; y < 6; y++) {
            let row = [];
            for (let x = 0; x < 6; x++) {
                if (y === 0 || x === 0 || x === 5) row.push('wall');
                else if (y === 5 && (x === 2 || x === 3)) row.push('door');
                else if (y === 5) row.push('wall');
                else row.push('floor');
            }
            maps[key].data.push(row);
        }
    });
}

// Battle System
let battleState = {
    active: false,
    enemy: null,
    turn: 'player', // player, enemy
    menu: 'main', // main, fight, item, pokemon
    selectedMove: 0,
    log: ""
};

function startBattle(trainer) {
    currentState = STATE.BATTLE;
    battleState.active = true;
    battleState.turn = 'player';
    battleState.menu = 'main';
    battleState.log = `Wild ${trainer.name} appeared!`;

    // Simple enemy generation based on trainer ID or random
    const enemies = [
        { name: 'Rattata', level: 4, maxHp: 15, hp: 15, type: 'normal', moves: ['Tackle', 'Tail Whip'] },
        { name: 'Pidgey', level: 4, maxHp: 14, hp: 14, type: 'flying', moves: ['Gust', 'Sand Attack'] },
        { name: 'Zubat', level: 5, maxHp: 16, hp: 16, type: 'poison', moves: ['Leech Life', 'Supersonic'] }
    ];
    battleState.enemy = enemies[Math.floor(Math.random() * enemies.length)];

    // Reset player HP for demo purposes if low (optional)
    // player.team[0].hp = player.team[0].maxHp;
}

function handleBattleInput() {
    if (battleState.turn !== 'player') return;

    if (battleState.menu === 'main') {
        // Simulate selecting "Fight" for simplicity in this version
        battleState.menu = 'fight';
        battleState.selectedMove = 0;
        battleState.log = `Choose a move for ${player.team[0].name}!`;
    } else if (battleState.menu === 'fight') {
        executePlayerMove();
    } else if (battleState.menu === 'run') {
        endBattle(true);
    }
}

function executePlayerMove() {
    const pokemon = player.team[0];
    const move = pokemon.moves[battleState.selectedMove];

    battleState.log = `${pokemon.name} used ${move}!`;

    // Simple damage calculation
    setTimeout(() => {
        let damage = Math.floor(Math.random() * 5) + 2;
        battleState.enemy.hp -= damage;
        if (battleState.enemy.hp <= 0) {
            battleState.enemy.hp = 0;
            battleState.log = `${battleState.enemy.name} fainted! You won!`;
            setTimeout(() => endBattle(false), 1500);
        } else {
            battleState.turn = 'enemy';
            setTimeout(enemyTurn, 1000);
        }
        updateUI();
    }, 1000);
}

function enemyTurn() {
    const enemy = battleState.enemy;
    const move = enemy.moves[0];

    battleState.log = `Enemy ${enemy.name} used ${move}!`;

    setTimeout(() => {
        let damage = Math.floor(Math.random() * 4) + 1;
        player.team[0].hp -= damage;
        if (player.team[0].hp <= 0) {
            player.team[0].hp = 0;
            battleState.log = `${player.team[0].name} fainted! You blacked out...`;
            setTimeout(() => {
                // Heal and respawn
                player.team.forEach(p => p.hp = p.maxHp);
                player.x = 10; player.y = 7;
                endBattle(true);
            }, 1500);
        } else {
            battleState.turn = 'player';
            battleState.menu = 'main';
            battleState.log = `What will ${player.team[0].name} do?`;
        }
        updateUI();
    }, 1000);
}

function endBattle(ranAway) {
    battleState.active = false;
    currentState = STATE.ROAMING;
    // Remove trainer from map if defeated (simplified: just reset position for demo)
    // In a full game, you'd flag the trainer as defeated
    if (!ranAway) {
        // Find the trainer object and move them or flag them
        const currentMapData = maps[currentMap];
        currentMapData.npcs = currentMapData.npcs.filter(n => !n.battle || n.x !== battleState.enemy.x);
    }
}

// Interaction Logic
function tryInteract() {
    if (currentState !== STATE.ROAMING) return;

    const map = maps[currentMap];
    const nextX = Math.round(player.x);
    const nextY = Math.round(player.y);

    // Check Warps
    for (let warp of map.warps) {
        if (nextX >= warp.x && nextX < warp.x + warp.w &&
            nextY >= warp.y && nextY < warp.y + warp.h) {
            switchMap(warp.target, warp.tx, warp.ty);
            return;
        }
    }

    // Check NPCs / Trainers
    for (let npc of map.npcs) {
        const dx = Math.abs(npc.x - nextX);
        const dy = Math.abs(npc.y - nextY);
        if (dx + dy === 1) { // Adjacent
            if (npc.battle) {
                // Start battle only if facing the trainer
                let facingCorrectly = false;
                if (player.direction === 'up' && npc.y < nextY) facingCorrectly = true;
                if (player.direction === 'down' && npc.y > nextY) facingCorrectly = true;
                if (player.direction === 'left' && npc.x < nextX) facingCorrectly = true;
                if (player.direction === 'right' && npc.x > nextX) facingCorrectly = true;

                if (facingCorrectly) {
                    startBattle(npc);
                } else {
                    showDialog(npc.text);
                }
            } else {
                showDialog(npc.text);
            }
            return;
        }
    }

    // Check Items (Simplified: just print message)
    if (map.data[nextY][nextX] === 'item') {
        showDialog("Found an item!");
        map.data[nextY][nextX] = 'grass';
    }
}

function showDialog(text) {
    currentState = STATE.DIALOG;
    dialogQueue = [text];
    currentDialog = text;
}

function advanceDialog() {
    if (dialogQueue.length > 0) {
        dialogQueue.shift();
        if (dialogQueue.length === 0) {
            currentState = STATE.ROAMING;
            currentDialog = null;
        } else {
            currentDialog = dialogQueue[0];
        }
    }
}

function switchMap(targetKey, tx, ty) {
    currentMap = targetKey;
    player.x = tx;
    player.y = ty;
    player.targetX = tx;
    player.targetY = ty;
    player.isMoving = false;
    player.moveProgress = 0;
}

// Collision Detection
function isSolid(x, y, mapKey) {
    const map = maps[mapKey];
    if (x < 0 || x >= map.width || y < 0 || y >= map.height) return true;
    const tile = map.data[y][x];
    return tile === 'wall' || tile === 'water' || tile === 'tree' || tile === 'counter';
}

// Update Loop
let lastTime = 0;
function gameLoop(timestamp) {
    const dt = timestamp - lastTime;
    lastTime = timestamp;

    update(dt);
    draw();
    requestAnimationFrame(gameLoop);
}

function update(dt) {
    if (currentState === STATE.ROAMING || currentState === STATE.INSIDE) {
        handleMovement();
        updateCamera();
    }
}

function handleMovement() {
    if (player.isMoving) {
        player.moveProgress += player.speed;
        if (player.moveProgress >= 1) {
            player.x = player.targetX;
            player.y = player.targetY;
            player.isMoving = false;
            player.moveProgress = 0;
        } else {
            // Interpolate position
            player.x = player.startX + (player.targetX - player.startX) * player.moveProgress;
            player.y = player.startY + (player.targetY - player.startY) * player.moveProgress;
        }
        return;
    }

    let dx = 0;
    let dy = 0;

    if (keys['ArrowUp'] || keys['KeyW']) { dy = -1; player.direction = 'up'; }
    else if (keys['ArrowDown'] || keys['KeyS']) { dy = 1; player.direction = 'down'; }
    else if (keys['ArrowLeft'] || keys['KeyA']) { dx = -1; player.direction = 'left'; }
    else if (keys['ArrowRight'] || keys['KeyD']) { dx = 1; player.direction = 'right'; }

    if (dx !== 0 || dy !== 0) {
        const nextX = Math.round(player.x) + dx;
        const nextY = Math.round(player.y) + dy;

        // Boundary Checks
        const map = maps[currentMap];
        if (nextX < 0 || nextX >= map.width || nextY < 0 || nextY >= map.height) return;

        // Collision Check
        if (!isSolid(nextX, nextY, currentMap)) {
            player.startX = Math.round(player.x);
            player.startY = Math.round(player.y);
            player.targetX = nextX;
            player.targetY = nextY;
            player.isMoving = true;
            player.moveProgress = 0;
        }
    }
}

function updateCamera() {
    // Center camera on player
    camera.x = player.x * TILE_SIZE - CANVAS_WIDTH / 2 + TILE_SIZE / 2;
    camera.y = player.y * TILE_SIZE - CANVAS_HEIGHT / 2 + TILE_SIZE / 2;

    // Clamp camera to map bounds
    const map = maps[currentMap];
    const maxX = map.width * TILE_SIZE - CANVAS_WIDTH;
    const maxY = map.height * TILE_SIZE - CANVAS_HEIGHT;

    camera.x = Math.max(0, Math.min(camera.x, maxX));
    camera.y = Math.max(0, Math.min(camera.y, maxY));
}

// Drawing Functions
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

function draw() {
    // Clear Screen
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(-Math.floor(camera.x), -Math.floor(camera.y));

    const map = maps[currentMap];

    // Draw Map Tiles
    for (let y = 0; y < map.height; y++) {
        for (let x = 0; x < map.width; x++) {
            drawTile(map.data[y][x], x * TILE_SIZE, y * TILE_SIZE);
        }
    }

    // Draw Objects/NPCs
    if (map.npcs) {
        map.npcs.forEach(npc => {
            if (npc.type === 'trainer') drawSprite('trainer', npc.x * TILE_SIZE, npc.y * TILE_SIZE, npc.dir);
            else drawSprite('npc', npc.x * TILE_SIZE, npc.y * TILE_SIZE, npc.dir);
        });
    }

    // Draw Player
    drawSprite('player', player.x * TILE_SIZE, player.y * TILE_SIZE, player.direction);

    ctx.restore();

    // Draw UI Overlay
    drawUI();
}

function drawTile(type, x, y) {
    switch (type) {
        case 'grass': ctx.fillStyle = '#76c442'; break;
        case 'wall': ctx.fillStyle = '#5d4037'; break;
        case 'floor': ctx.fillStyle = '#d7ccc8'; break;
        case 'water': ctx.fillStyle = '#4fc3f7'; break;
        case 'door': ctx.fillStyle = '#8d6e63'; break;
        case 'tree': ctx.fillStyle = '#2e7d32'; break;
        case 'flower': ctx.fillStyle = '#ffeb3b'; break;
        case 'bridge': ctx.fillStyle = '#a1887f'; break;
        default: ctx.fillStyle = '#000';
    }
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

    // Simple details
    if (type === 'grass') {
        ctx.fillStyle = '#6ab03b';
        ctx.fillRect(x + 10, y + 10, 5, 5);
        ctx.fillRect(x + 30, y + 30, 5, 5);
    } else if (type === 'tree') {
        ctx.beginPath();
        ctx.arc(x + TILE_SIZE/2, y + TILE_SIZE/2, TILE_SIZE/2 - 2, 0, Math.PI * 2);
        ctx.fill();
    } else if (type === 'water') {
        ctx.fillStyle = '#29b6f6';
        ctx.fillRect(x + 5, y + 10, 20, 5);
    }
}

function drawSprite(type, x, y, dir) {
    ctx.fillStyle = '#fff';
    if (type === 'player') ctx.fillStyle = '#ffcc80'; // Skin tone
    if (type === 'npc') ctx.fillStyle = '#90caf9'; // Blue shirt
    if (type === 'trainer') ctx.fillStyle = '#ef9a9a'; // Red shirt

    const w = TILE_SIZE - 10;
    const h = TILE_SIZE - 10;
    const offsetX = (TILE_SIZE - w) / 2;
    const offsetY = (TILE_SIZE - h) / 2;

    // Body
    ctx.fillRect(x + offsetX, y + offsetY, w, h);

    // Eyes (to show direction)
    ctx.fillStyle = '#000';
    let eyeOffsetX = 0;
    let eyeOffsetY = 0;

    if (dir === 'left') eyeOffsetX = -4;
    if (dir === 'right') eyeOffsetX = 4;
    if (dir === 'up') eyeOffsetY = -4;
    if (dir === 'down') eyeOffsetY = 2;

    // Fix for left/right switching: Ensure logic matches visual
    // Left: Look left. Right: Look right.

    ctx.fillRect(x + offsetX + w/2 - 6 + eyeOffsetX, y + offsetY + h/3 + eyeOffsetY, 4, 4);
    ctx.fillRect(x + offsetX + w/2 + 2 + eyeOffsetX, y + offsetY + h/3 + eyeOffsetY, 4, 4);

    // Hat/Cap
    ctx.fillStyle = '#d32f2f';
    ctx.fillRect(x + offsetX, y + offsetY, w, 10);
}

function drawUI() {
    // Dialog Box
    if (currentDialog) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(20, CANVAS_HEIGHT - 100, CANVAS_WIDTH - 40, 80);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(20, CANVAS_HEIGHT - 100, CANVAS_WIDTH - 40, 80);

        ctx.fillStyle = '#fff';
        ctx.font = '16px monospace';
        ctx.fillText(currentDialog, 30, CANVAS_HEIGHT - 60);
        ctx.fillText("> Press SPACE", CANVAS_WIDTH - 150, CANVAS_HEIGHT - 30);
    }

    // Battle UI
    if (currentState === STATE.BATTLE) {
        // Background
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Enemy Area
        ctx.fillStyle = '#4caf50';
        ctx.fillRect(CANVAS_WIDTH/2, 50, 300, 200);
        ctx.fillStyle = '#fff';
        ctx.font = '20px monospace';
        ctx.fillText(`${battleState.enemy.name} Lv${battleState.enemy.level}`, CANVAS_WIDTH/2 + 20, 80);

        // Enemy HP Bar
        drawHPBar(CANVAS_WIDTH/2 + 20, 90, battleState.enemy.hp, battleState.enemy.maxHp);

        // Player Area (Back sprite placeholder)
        ctx.fillStyle = '#8d6e63';
        ctx.fillRect(50, CANVAS_HEIGHT - 250, 250, 200);

        // Player HUD
        ctx.fillStyle = '#333';
        ctx.fillRect(350, CANVAS_HEIGHT - 150, 400, 130);
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(350, CANVAS_HEIGHT - 150, 400, 130);

        const pkmn = player.team[0];
        ctx.fillStyle = '#fff';
        ctx.font = '20px monospace';
        ctx.fillText(`${pkmn.name} Lv${pkmn.level}`, 370, CANVAS_HEIGHT - 120);
        drawHPBar(370, CANVAS_HEIGHT - 110, pkmn.hp, pkmn.maxHp);

        // Battle Log / Menu
        ctx.fillStyle = '#000';
        ctx.fillRect(20, CANVAS_HEIGHT - 150, 300, 130);
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(20, CANVAS_HEIGHT - 150, 300, 130);

        ctx.fillStyle = '#fff';
        ctx.font = '16px monospace';
        ctx.fillText(battleState.log, 30, CANVAS_HEIGHT - 120);

        if (battleState.turn === 'player') {
            if (battleState.menu === 'main') {
                ctx.fillText("> FIGHT", 30, CANVAS_HEIGHT - 80);
                ctx.fillText("  BAG", 30, CANVAS_HEIGHT - 60);
                ctx.fillText("  POKEMON", 30, CANVAS_HEIGHT - 40);
                ctx.fillText("  RUN", 30, CANVAS_HEIGHT - 20);
            } else if (battleState.menu === 'fight') {
                ctx.fillText(`> ${pkmn.moves[0]}`, 30, CANVAS_HEIGHT - 80);
                ctx.fillText(`  ${pkmn.moves[1]}`, 30, CANVAS_HEIGHT - 60);
            }
        }
    }
}

function drawHPBar(x, y, current, max) {
    const width = 200;
    const height = 20;
    ctx.fillStyle = '#555';
    ctx.fillRect(x, y, width, height);

    const pct = Math.max(0, current / max);
    ctx.fillStyle = pct > 0.5 ? '#4caf50' : pct > 0.2 ? '#ffeb3b' : '#f44336';
    ctx.fillRect(x, y, width * pct, height);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(x, y, width, height);
}

function updateUI() {
    // Triggered by battle logic to refresh state, mainly handled in draw loop for simplicity
}

// Initialization
initMaps();
requestAnimationFrame(gameLoop);