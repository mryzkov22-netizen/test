// Pokémon Adventure - Complete Game Implementation

// ============================================
// GAME CONSTANTS AND CONFIGURATION
// ============================================
const TILE_SIZE = 32;
const MAP_WIDTH = 40;
const MAP_HEIGHT = 30;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

// Sprite paths
const SPRITE_PATHS = {
    // Player
    playerDown: 'player-down.png',
    playerUp: 'player-up.png',
    playerLeft: 'player-left.png',
    playerRight: 'player-right.png',
    // NPCs
    npcDown: 'npc-down.png',
    trainerDown: 'trainer-down.png',
    // Items
    pokeball: 'pokeball.png',
    potion: 'potion.png',
    berry: 'berry.png',
    // Tiles
    grass: 'grass.png',
    dirtPath: 'dirt-path.png',
    water: 'water.png',
    tree: 'tree.png',
    houseFloor: 'house-floor.png',
    houseWall: 'house-wall.png',
    door: 'door.png',
    counter: 'counter.png',
    pc: 'pc.png',
    bookshelf: 'bookshelf.png',
    flower: 'flower.png',
    rock: 'rock.png',
    sand: 'sand.png',
    bridge: 'bridge.png'
};

// Pokemon sprite paths (front and back)
const POKEMON_SPRITES = {
    pikachu: { front: 'pikachu-front.png', back: 'pikachu-back.png' },
    charmander: { front: 'charmander-front.png', back: 'charmander-back.png' },
    squirtle: { front: 'squirtle-front.png', back: 'squirtle-back.png' },
    bulbasaur: { front: 'bulbasaur-front.png', back: 'bulbasaur-back.png' },
    rattata: { front: 'rattata-front.png', back: 'rattata-back.png' },
    pidgey: { front: 'pidgey-front.png', back: 'pidgey-back.png' },
    caterpie: { front: 'caterpie-front.png', back: 'caterpie-back.png' },
    zubat: { front: 'zubat-front.png', back: 'zubat-back.png' },
    geodude: { front: 'geodude-front.png', back: 'geodude-back.png' },
    machop: { front: 'machop-front.png', back: 'machop-back.png' }
};

// Tile types
const TILES = {
    GRASS: 0,
    DIRT_PATH: 1,
    WATER: 2,
    TREE: 3,
    HOUSE_FLOOR: 4,
    HOUSE_WALL: 5,
    DOOR: 6,
    COUNTER: 7,
    PC: 8,
    BOOKSHELF: 9,
    FLOWER: 10,
    ROCK: 11,
    SAND: 12,
    BRIDGE: 13
};

// Colors for each tile type (pixel art style)
const TILE_COLORS = {
    [TILES.GRASS]: ['#4ade80', '#22c55e', '#16a34a', '#15803d'],
    [TILES.DIRT_PATH]: ['#d4a574', '#c49564', '#b48554', '#a47544'],
    [TILES.WATER]: ['#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8'],
    [TILES.TREE]: ['#059669', '#047857', '#065f46', '#064e3b'],
    [TILES.HOUSE_FLOOR]: ['#d4c4b0', '#c4b4a0', '#b4a490', '#a49480'],
    [TILES.HOUSE_WALL]: ['#f5f5dc', '#e5e5cc', '#d5d5bc', '#c5c5ac'],
    [TILES.DOOR]: ['#8b4513', '#7b3503', '#6b2500', '#5b1500'],
    [TILES.COUNTER]: ['#cd853f', '#bd752f', '#ad651f', '#9d550f'],
    [TILES.PC]: ['#4a4a6a', '#3a3a5a', '#2a2a4a', '#1a1a3a'],
    [TILES.BOOKSHELF]: ['#8b7355', '#7b6345', '#6b5335', '#5b4325'],
    [TILES.FLOWER]: ['#ff69b4', '#ff1493', '#db7093', '#c71585'],
    [TILES.ROCK]: ['#808080', '#707070', '#606060', '#505050'],
    [TILES.SAND]: ['#f4e4bc', '#e4d4ac', '#d4c49c', '#c4b48c'],
    [TILES.BRIDGE]: ['#a0522d', '#90421d', '#80320d', '#702200']
};

// ============================================
// POKÉMON DATA
// ============================================
const POKEMON_DATA = {
    pikachu: {
        name: 'Pikachu',
        type: 'Electric',
        maxHp: 100,
        attack: 55,
        defense: 40,
        speed: 90,
        moves: [
            { name: 'Thunder Shock', power: 40, accuracy: 100, type: 'Electric' },
            { name: 'Quick Attack', power: 40, accuracy: 100, type: 'Normal' },
            { name: 'Iron Tail', power: 100, accuracy: 75, type: 'Steel' },
            { name: 'Electro Ball', power: 80, accuracy: 100, type: 'Electric' }
        ],
        color: '#ffd700',
        backSprite: null
    },
    charmander: {
        name: 'Charmander',
        type: 'Fire',
        maxHp: 110,
        attack: 52,
        defense: 43,
        speed: 65,
        moves: [
            { name: 'Scratch', power: 40, accuracy: 100, type: 'Normal' },
            { name: 'Ember', power: 40, accuracy: 100, type: 'Fire' },
            { name: 'Flame Burst', power: 70, accuracy: 100, type: 'Fire' },
            { name: 'Dragon Breath', power: 60, accuracy: 100, type: 'Dragon' }
        ],
        color: '#ff6347',
        backSprite: null
    },
    squirtle: {
        name: 'Squirtle',
        type: 'Water',
        maxHp: 115,
        attack: 48,
        defense: 65,
        speed: 43,
        moves: [
            { name: 'Tackle', power: 40, accuracy: 100, type: 'Normal' },
            { name: 'Water Gun', power: 40, accuracy: 100, type: 'Water' },
            { name: 'Bubble Beam', power: 65, accuracy: 100, type: 'Water' },
            { name: 'Bite', power: 60, accuracy: 100, type: 'Dark' }
        ],
        color: '#87ceeb',
        backSprite: null
    },
    bulbasaur: {
        name: 'Bulbasaur',
        type: 'Grass',
        maxHp: 120,
        attack: 49,
        defense: 49,
        speed: 45,
        moves: [
            { name: 'Tackle', power: 40, accuracy: 100, type: 'Normal' },
            { name: 'Vine Whip', power: 45, accuracy: 100, type: 'Grass' },
            { name: 'Razor Leaf', power: 55, accuracy: 95, type: 'Grass' },
            { name: 'Seed Bomb', power: 80, accuracy: 100, type: 'Grass' }
        ],
        color: '#90ee90',
        backSprite: null
    },
    rattata: {
        name: 'Rattata',
        type: 'Normal',
        maxHp: 80,
        attack: 56,
        defense: 35,
        speed: 72,
        moves: [
            { name: 'Tackle', power: 40, accuracy: 100, type: 'Normal' },
            { name: 'Quick Attack', power: 40, accuracy: 100, type: 'Normal' },
            { name: 'Bite', power: 60, accuracy: 100, type: 'Dark' },
            { name: 'Hyper Fang', power: 80, accuracy: 90, type: 'Normal' }
        ],
        color: '#dda0dd',
        backSprite: null
    },
    pidgey: {
        name: 'Pidgey',
        type: 'Flying',
        maxHp: 85,
        attack: 45,
        defense: 40,
        speed: 56,
        moves: [
            { name: 'Gust', power: 40, accuracy: 100, type: 'Flying' },
            { name: 'Quick Attack', power: 40, accuracy: 100, type: 'Normal' },
            { name: 'Wing Attack', power: 60, accuracy: 100, type: 'Flying' },
            { name: 'Air Cutter', power: 60, accuracy: 95, type: 'Flying' }
        ],
        color: '#deb887',
        backSprite: null
    },
    caterpie: {
        name: 'Caterpie',
        type: 'Bug',
        maxHp: 90,
        attack: 30,
        defense: 35,
        speed: 45,
        moves: [
            { name: 'Tackle', power: 40, accuracy: 100, type: 'Normal' },
            { name: 'String Shot', power: 20, accuracy: 100, type: 'Bug' },
            { name: 'Bug Bite', power: 60, accuracy: 100, type: 'Bug' },
            { name: 'Snore', power: 50, accuracy: 100, type: 'Normal' }
        ],
        color: '#90ee90',
        backSprite: null
    },
    zubat: {
        name: 'Zubat',
        type: 'Poison',
        maxHp: 80,
        attack: 45,
        defense: 35,
        speed: 55,
        moves: [
            { name: 'Leech Life', power: 80, accuracy: 100, type: 'Bug' },
            { name: 'Bite', power: 60, accuracy: 100, type: 'Dark' },
            { name: 'Wing Attack', power: 60, accuracy: 100, type: 'Flying' },
            { name: 'Poison Fang', power: 50, accuracy: 100, type: 'Poison' }
        ],
        color: '#9370db',
        backSprite: null
    },
    geodude: {
        name: 'Geodude',
        type: 'Rock',
        maxHp: 100,
        attack: 80,
        defense: 100,
        speed: 20,
        moves: [
            { name: 'Tackle', power: 40, accuracy: 100, type: 'Normal' },
            { name: 'Rock Throw', power: 50, accuracy: 90, type: 'Rock' },
            { name: 'Rock Slide', power: 75, accuracy: 90, type: 'Rock' },
            { name: 'Earthquake', power: 100, accuracy: 100, type: 'Ground' }
        ],
        color: '#a0522d',
        backSprite: null
    },
    machop: {
        name: 'Machop',
        type: 'Fighting',
        maxHp: 140,
        attack: 80,
        defense: 50,
        speed: 35,
        moves: [
            { name: 'Low Sweep', power: 65, accuracy: 100, type: 'Fighting' },
            { name: 'Karate Chop', power: 50, accuracy: 100, type: 'Fighting' },
            { name: 'Brick Break', power: 75, accuracy: 100, type: 'Fighting' },
            { name: 'Cross Chop', power: 100, accuracy: 80, type: 'Fighting' }
        ],
        color: '#daa520',
        backSprite: null
    }
};

// ============================================
// GAME STATE
// ============================================
let canvas, ctx;
let gameRunning = false;
let gameState = 'START'; // START, EXPLORING, BATTLE, DIALOG
let currentMap = 'town';
let currentInterior = null;

// Player state
let player = {
    x: 10,
    y: 10,
    direction: 'down',
    moving: false,
    moveProgress: 0,
    fromX: 10,
    fromY: 10,
    pokemon: [],
    items: [],
    badges: 0
};

// Camera
let camera = {
    x: 0,
    y: 0
};

// Maps data
let maps = {};
let interiors = {};

// NPCs and trainers
let npcs = [];
let trainers = [];
let items = [];

// Battle state
let battleState = {
    active: false,
    playerPokemon: null,
    enemyPokemon: null,
    turn: 'player',
    dialog: '',
    trainer: null
};

// Dialog state
let dialogState = {
    active: false,
    text: '',
    options: []
};

// Input handling
let keys = {};
let lastKeyTime = 0;
const KEY_COOLDOWN = 100;

// ============================================
// INITIALIZATION
// ============================================
function init() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    
    // Disable image smoothing for pixel art look
    ctx.imageSmoothingEnabled = false;
    
    // Generate sprite sheets
    generateSprites();
    
    // Create maps
    createTownMap();
    createInteriors();
    
    // Setup player
    player.pokemon = [createPokemon('pikachu', 5)];
    
    // Create NPCs and items
    createNPCs();
    createItems();
    
    // Event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Start game loop
    requestAnimationFrame(gameLoop);
}

function startGame() {
    document.getElementById('start-screen').style.display = 'none';
    gameRunning = true;
    gameState = 'EXPLORING';
    
    // Center camera on player
    updateCamera();
    
    showDialog("Welcome to Pixelmon Town!", [
        { text: "Start Adventure", action: () => closeDialog() }
    ]);
}

// ============================================
// SPRITE GENERATION (Procedural Pixel Art)
// ============================================
let sprites = {};
let loadedSprites = {}; // For loading external images

function generateSprites() {
    // Try to load external sprites, fall back to procedural generation if not found
    loadExternalSprites();
    
    // Generate procedural fallbacks
    sprites.player = generatePlayerSprite();
    sprites.npc = generateNPCSprite();
    sprites.trainer = generateTrainerSprite();
    sprites.items = generateItemSprites();
    sprites.pokemon = generatePokemonSprites();
    sprites.buildings = generateBuildingSprites();
}

function loadExternalSprites() {
    // Load player sprites
    loadedSprites.playerDown = loadImage(SPRITE_PATHS.playerDown);
    loadedSprites.playerUp = loadImage(SPRITE_PATHS.playerUp);
    loadedSprites.playerLeft = loadImage(SPRITE_PATHS.playerLeft);
    loadedSprites.playerRight = loadImage(SPRITE_PATHS.playerRight);
    
    // Load NPC sprites
    loadedSprites.npcDown = loadImage(SPRITE_PATHS.npcDown);
    loadedSprites.trainerDown = loadImage(SPRITE_PATHS.trainerDown);
    
    // Load item sprites
    loadedSprites.pokeball = loadImage(SPRITE_PATHS.pokeball);
    loadedSprites.potion = loadImage(SPRITE_PATHS.potion);
    loadedSprites.berry = loadImage(SPRITE_PATHS.berry);
    
    // Load tile sprites
    loadedSprites.grass = loadImage(SPRITE_PATHS.grass);
    loadedSprites.dirtPath = loadImage(SPRITE_PATHS.dirtPath);
    loadedSprites.water = loadImage(SPRITE_PATHS.water);
    loadedSprites.tree = loadImage(SPRITE_PATHS.tree);
    loadedSprites.houseFloor = loadImage(SPRITE_PATHS.houseFloor);
    loadedSprites.houseWall = loadImage(SPRITE_PATHS.houseWall);
    loadedSprites.door = loadImage(SPRITE_PATHS.door);
    loadedSprites.counter = loadImage(SPRITE_PATHS.counter);
    loadedSprites.pc = loadImage(SPRITE_PATHS.pc);
    loadedSprites.bookshelf = loadImage(SPRITE_PATHS.bookshelf);
    loadedSprites.flower = loadImage(SPRITE_PATHS.flower);
    loadedSprites.rock = loadImage(SPRITE_PATHS.rock);
    loadedSprites.sand = loadImage(SPRITE_PATHS.sand);
    loadedSprites.bridge = loadImage(SPRITE_PATHS.bridge);
    
    // Load Pokemon sprites
    for (const [pokemon, paths] of Object.entries(POKEMON_SPRITES)) {
        loadedSprites[`${pokemon}Front`] = loadImage(paths.front);
        loadedSprites[`${pokemon}Back`] = loadImage(paths.back);
    }
}

function loadImage(path) {
    const img = new Image();
    img.src = path;
    return img;
}

function isImageLoaded(img) {
    return img && img.complete && img.naturalWidth > 0;
}

function generatePlayerSprite() {
    const sprite = {
        down: [],
        up: [],
        left: [],
        right: []
    };
    
    // Simple 16x16 pixel art player (Ash-like character)
    const colors = {
        hat: '#ff0000',
        hatDark: '#cc0000',
        skin: '#ffdbac',
        skinShadow: '#e5c59a',
        hair: '#4a3728',
        shirt: '#0066cc',
        shirtDark: '#004499',
        pants: '#333333',
        shoes: '#ffffff'
    };
    
    // Down view
    sprite.down = [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,colors.hat,colors.hat,colors.hat,colors.hat,colors.hat,colors.hat,0,0,0,0,0,0],
        [0,0,0,colors.hat,colors.hat,colors.hat,colors.hat,colors.hat,colors.hat,colors.hat,colors.hatDark,0,0,0,0,0],
        [0,0,0,colors.hair,colors.skin,colors.skin,colors.skin,colors.hair,colors.hair,colors.skin,colors.skin,colors.hair,0,0,0,0],
        [0,0,0,0,colors.skin,colors.skin,colors.skin,colors.skin,colors.skin,colors.skin,colors.skin,0,0,0,0,0],
        [0,0,0,0,colors.shirt,colors.shirt,colors.shirt,colors.shirt,colors.shirt,colors.shirt,0,0,0,0,0,0],
        [0,0,0,0,colors.shirt,colors.shirt,colors.shirt,colors.shirt,colors.shirt,colors.shirt,0,0,0,0,0,0],
        [0,0,0,colors.pants,colors.pants,colors.shirtDark,colors.shirtDark,colors.pants,colors.pants,0,0,0,0,0,0,0],
        [0,0,0,colors.pants,colors.pants,colors.pants,colors.pants,colors.pants,colors.pants,0,0,0,0,0,0,0],
        [0,0,colors.shoes,colors.pants,colors.pants,colors.pants,colors.pants,colors.pants,colors.shoes,0,0,0,0,0,0,0],
        [0,colors.shoes,colors.shoes,colors.shoes,colors.pants,colors.pants,colors.shoes,colors.shoes,colors.shoes,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    ];
    
    // Up view (back of head)
    sprite.up = sprite.down.map(row => [...row]);
    sprite.up[2].fill(0);
    sprite.up[2][4] = colors.hair;
    sprite.up[2][5] = colors.hair;
    sprite.up[2][6] = colors.hair;
    sprite.up[2][7] = colors.hair;
    sprite.up[2][8] = colors.hair;
    sprite.up[2][9] = colors.hair;
    
    // Left view
    sprite.left = sprite.down.map(row => [...row]);
    
    // Right view
    sprite.right = sprite.down.map(row => [...row]);
    
    return sprite;
}

function generateNPCSprite() {
    const sprite = {
        down: []
    };
    
    const colors = {
        hat: '#8b4513',
        skin: '#ffdbac',
        shirt: '#228b22',
        pants: '#654321',
        shoes: '#000000'
    };
    
    sprite.down = [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,colors.hat,colors.hat,colors.hat,colors.hat,colors.hat,0,0,0,0,0,0,0],
        [0,0,0,colors.hat,colors.hat,colors.hat,colors.hat,colors.hat,colors.hat,colors.hat,0,0,0,0,0,0],
        [0,0,0,0,colors.skin,colors.skin,colors.skin,colors.skin,colors.skin,0,0,0,0,0,0,0],
        [0,0,0,0,colors.skin,colors.skin,colors.skin,colors.skin,colors.skin,0,0,0,0,0,0,0],
        [0,0,0,0,colors.shirt,colors.shirt,colors.shirt,colors.shirt,colors.shirt,0,0,0,0,0,0,0],
        [0,0,0,0,colors.shirt,colors.shirt,colors.shirt,colors.shirt,colors.shirt,0,0,0,0,0,0,0],
        [0,0,0,colors.pants,colors.pants,colors.shirt,colors.shirt,colors.pants,colors.pants,0,0,0,0,0,0,0],
        [0,0,0,colors.pants,colors.pants,colors.pants,colors.pants,colors.pants,colors.pants,0,0,0,0,0,0,0],
        [0,0,colors.shoes,colors.pants,colors.pants,colors.pants,colors.pants,colors.pants,colors.shoes,0,0,0,0,0,0,0],
        [0,colors.shoes,colors.shoes,colors.shoes,colors.pants,colors.pants,colors.shoes,colors.shoes,colors.shoes,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    ];
    
    return sprite;
}

function generateTrainerSprite() {
    const sprite = {
        down: []
    };
    
    const colors = {
        hair: '#ffd700',
        skin: '#ffdbac',
        shirt: '#ff1493',
        skirt: '#4169e1',
        shoes: '#ffffff'
    };
    
    sprite.down = [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,colors.hair,colors.hair,colors.hair,colors.hair,colors.hair,0,0,0,0,0,0,0],
        [0,0,0,colors.hair,colors.hair,colors.hair,colors.hair,colors.hair,colors.hair,colors.hair,0,0,0,0,0,0],
        [0,0,0,colors.hair,colors.skin,colors.skin,colors.skin,colors.hair,colors.hair,colors.skin,colors.skin,colors.hair,0,0,0,0],
        [0,0,0,0,colors.skin,colors.skin,colors.skin,colors.skin,colors.skin,colors.skin,colors.skin,0,0,0,0,0],
        [0,0,0,0,colors.shirt,colors.shirt,colors.shirt,colors.shirt,colors.shirt,colors.shirt,0,0,0,0,0,0],
        [0,0,0,0,colors.shirt,colors.shirt,colors.shirt,colors.shirt,colors.shirt,colors.shirt,0,0,0,0,0,0],
        [0,0,0,colors.skirt,colors.skirt,colors.shirt,colors.shirt,colors.skirt,colors.skirt,0,0,0,0,0,0,0],
        [0,0,0,colors.skirt,colors.skirt,colors.skirt,colors.skirt,colors.skirt,colors.skirt,0,0,0,0,0,0,0],
        [0,0,colors.shoes,colors.skirt,colors.skirt,colors.skirt,colors.skirt,colors.skirt,colors.shoes,0,0,0,0,0,0,0],
        [0,colors.shoes,colors.shoes,colors.shoes,colors.skirt,colors.skirt,colors.shoes,colors.shoes,colors.shoes,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    ];
    
    return sprite;
}

function generateItemSprites() {
    return {
        pokeball: generatePokeballSprite(),
        potion: generatePotionSprite(),
        berry: generateBerrySprite()
    };
}

function generatePokeballSprite() {
    const size = 16;
    const sprite = [];
    const colors = {
        red: '#ff0000',
        white: '#ffffff',
        black: '#000000',
        gray: '#808080'
    };
    
    for (let y = 0; y < size; y++) {
        sprite[y] = [];
        for (let x = 0; x < size; x++) {
            const dx = x - size/2;
            const dy = y - size/2;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist > size/2 - 1) {
                sprite[y][x] = 0;
            } else if (Math.abs(dy) < 2 && Math.abs(dx) < size/2 - 1) {
                sprite[y][x] = colors.black;
            } else if (Math.abs(dx) < 3 && Math.abs(dy) < 3) {
                sprite[y][x] = colors.white;
            } else if (y < size/2) {
                sprite[y][x] = colors.red;
            } else {
                sprite[y][x] = colors.white;
            }
        }
    }
    
    return sprite;
}

function generatePotionSprite() {
    const size = 16;
    const sprite = [];
    const colors = {
        glass: '#87ceeb',
        liquid: '#ff69b4',
        cap: '#ffffff'
    };
    
    for (let y = 0; y < size; y++) {
        sprite[y] = [];
        for (let x = 0; x < size; x++) {
            const cx = size/2;
            if (y < 4) {
                if (Math.abs(x - cx) < 3) {
                    sprite[y][x] = colors.cap;
                } else {
                    sprite[y][x] = 0;
                }
            } else if (y < 12) {
                const width = 4 + (12 - y) * 0.3;
                if (Math.abs(x - cx) < width) {
                    sprite[y][x] = y > 8 ? colors.liquid : colors.glass;
                } else {
                    sprite[y][x] = 0;
                }
            } else {
                const width = 4;
                if (Math.abs(x - cx) < width) {
                    sprite[y][x] = colors.glass;
                } else {
                    sprite[y][x] = 0;
                }
            }
        }
    }
    
    return sprite;
}

function generateBerrySprite() {
    const size = 16;
    const sprite = [];
    const colors = {
        red: '#ff0000',
        green: '#00aa00',
        stem: '#8b4513'
    };
    
    for (let y = 0; y < size; y++) {
        sprite[y] = [];
        for (let x = 0; x < size; x++) {
            const dx = x - size/2;
            const dy = y - size/2 + 2;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if (y === 2 && Math.abs(x - size/2) < 2) {
                sprite[y][x] = colors.stem;
            } else if (y === 3 && Math.abs(x - size/2) < 3) {
                sprite[y][x] = colors.green;
            } else if (dist < 5) {
                sprite[y][x] = colors.red;
            } else {
                sprite[y][x] = 0;
            }
        }
    }
    
    return sprite;
}

function generatePokemonSprites() {
    const pokemonSprites = {};
    
    // Generate simple sprites for each pokemon
    for (const [key, data] of Object.entries(POKEMON_DATA)) {
        pokemonSprites[key] = generateSimplePokemonSprite(data.color);
    }
    
    return pokemonSprites;
}

function generateSimplePokemonSprite(baseColor) {
    const size = 32;
    const sprite = [];
    const shadowColor = adjustColor(baseColor, -30);
    
    for (let y = 0; y < size; y++) {
        sprite[y] = [];
        for (let x = 0; x < size; x++) {
            const dx = x - size/2;
            const dy = y - size/2;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            // Create a cute blob shape
            if (dist < 10) {
                sprite[y][x] = baseColor;
            } else if (dist < 12) {
                sprite[y][x] = shadowColor;
            } else {
                sprite[y][x] = 0;
            }
        }
    }
    
    // Add eyes
    const eyeY = size/2 - 3;
    const eyeOffset = 4;
    if (sprite[eyeY]) {
        sprite[eyeY][size/2 - eyeOffset] = '#000000';
        sprite[eyeY][size/2 + eyeOffset] = '#000000';
    }
    
    return sprite;
}

function generateBuildingSprites() {
    return {
        house: generateHouseSprite(),
        mart: generateMartSprite(),
        center: generateCenterSprite()
    };
}

function generateHouseSprite() {
    const sprite = [];
    const colors = {
        roof: '#8b0000',
        roofLight: '#a52a2a',
        wall: '#f5deb3',
        door: '#8b4513',
        window: '#87ceeb'
    };
    
    // 3x3 tile building (96x96 pixels)
    for (let ty = 0; ty < 3; ty++) {
        sprite[ty] = [];
        for (let tx = 0; tx < 3; tx++) {
            sprite[ty][tx] = [];
            for (let py = 0; py < TILE_SIZE; py++) {
                sprite[ty][tx][py] = [];
                for (let px = 0; px < TILE_SIZE; px++) {
                    const globalY = ty * TILE_SIZE + py;
                    const globalX = tx * TILE_SIZE + px;
                    
                    // Roof (top row)
                    if (ty === 0) {
                        if (py < 10) {
                            sprite[ty][tx][py][px] = (py + px) % 2 === 0 ? colors.roof : colors.roofLight;
                        } else if (py < 16 && (tx === 1 || (tx === 0 && px > 16) || (tx === 2 && px < 16))) {
                            sprite[ty][tx][py][px] = colors.wall;
                        } else {
                            sprite[ty][tx][py][px] = 0;
                        }
                    }
                    // Middle row
                    else if (ty === 1) {
                        if (tx === 1 && py > 16 && px > 8 && px < 24) {
                            sprite[ty][tx][py][px] = colors.door;
                        } else if ((tx === 0 || tx === 2) && py > 8 && py < 20 && px > 4 && px < 16) {
                            sprite[ty][tx][py][px] = colors.window;
                        } else {
                            sprite[ty][tx][py][px] = colors.wall;
                        }
                    }
                    // Bottom row
                    else {
                        sprite[ty][tx][py][px] = colors.wall;
                    }
                }
            }
        }
    }
    
    return sprite;
}

function generateMartSprite() {
    // Similar to house but with different colors
    return generateHouseSprite();
}

function generateCenterSprite() {
    // Similar to house but with Pokeball symbol
    return generateHouseSprite();
}

function adjustColor(hex, amount) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
}

// ============================================
// MAP CREATION
// ============================================
function createTownMap() {
    const map = {
        tiles: [],
        width: MAP_WIDTH,
        height: MAP_HEIGHT,
        name: 'Pixelmon Town',
        warps: []
    };
    
    // Initialize with grass
    for (let y = 0; y < MAP_HEIGHT; y++) {
        map.tiles[y] = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            map.tiles[y][x] = TILES.GRASS;
        }
    }
    
    // Add paths
    addPath(map, 5, 15, 35, 15); // Horizontal main path
    addPath(map, 20, 5, 20, 25); // Vertical path
    
    // Add buildings
    addBuilding(map, 8, 8, 'house');
    addBuilding(map, 25, 8, 'mart');
    addBuilding(map, 12, 3, 'center');
    addBuilding(map, 28, 20, 'house');
    
    // Add trees around edges
    for (let x = 0; x < MAP_WIDTH; x++) {
        if (x < 3 || x > MAP_WIDTH - 4) {
            for (let y = 0; y < 5; y++) {
                if (map.tiles[y][x] === TILES.GRASS) {
                    map.tiles[y][x] = TILES.TREE;
                }
            }
            for (let y = MAP_HEIGHT - 5; y < MAP_HEIGHT; y++) {
                if (map.tiles[y][x] === TILES.GRASS) {
                    map.tiles[y][x] = TILES.TREE;
                }
            }
        }
    }
    
    for (let y = 0; y < MAP_HEIGHT; y++) {
        if (y < 3 || y > MAP_HEIGHT - 4) {
            for (let x = 0; x < MAP_WIDTH; x++) {
                if (map.tiles[y][x] === TILES.GRASS) {
                    map.tiles[y][x] = TILES.TREE;
                }
            }
        }
    }
    
    // Add pond
    addPond(map, 30, 5);
    
    // Add flowers
    addFlowers(map);
    
    // Add warps
    map.warps = [
        { x: 9, y: 11, target: 'house1', targetX: 5, targetY: 8 },
        { x: 26, y: 11, target: 'mart', targetX: 5, targetY: 8 },
        { x: 13, y: 6, target: 'center', targetX: 5, targetY: 8 },
        { x: 29, y: 23, target: 'house2', targetX: 5, targetY: 8 }
    ];
    
    maps.town = map;
}

function addPath(map, x1, y1, x2, y2) {
    const dx = Math.sign(x2 - x1);
    const dy = Math.sign(y2 - y1);
    
    let x = x1;
    let y = y1;
    
    while (x !== x2 || y !== y2) {
        if (x >= 0 && x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT) {
            map.tiles[y][x] = TILES.DIRT_PATH;
        }
        if (x !== x2) x += dx;
        else if (y !== y2) y += dy;
    }
}

function addBuilding(map, bx, by, type) {
    for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
            const mapX = bx + x;
            const mapY = by + y;
            if (mapX >= 0 && mapX < MAP_WIDTH && mapY >= 0 && mapY < MAP_HEIGHT) {
                if (y === 0) {
                    map.tiles[mapY][mapX] = TILES.HOUSE_WALL;
                } else {
                    map.tiles[mapY][mapX] = TILES.HOUSE_WALL;
                }
            }
        }
    }
    // Door
    if (by + 2 < MAP_HEIGHT) {
        map.tiles[by + 2][bx + 1] = TILES.DOOR;
    }
}

function addPond(map, cx, cy) {
    for (let y = -2; y <= 2; y++) {
        for (let x = -3; x <= 3; x++) {
            const mapX = cx + x;
            const mapY = cy + y;
            if (mapX >= 0 && mapX < MAP_WIDTH && mapY >= 0 && mapY < MAP_HEIGHT) {
                const dist = Math.sqrt(x*x/9 + y*y/4);
                if (dist < 1) {
                    map.tiles[mapY][mapX] = TILES.WATER;
                }
            }
        }
    }
}

function addFlowers(map) {
    for (let i = 0; i < 50; i++) {
        const x = Math.floor(Math.random() * MAP_WIDTH);
        const y = Math.floor(Math.random() * MAP_HEIGHT);
        if (map.tiles[y][x] === TILES.GRASS) {
            map.tiles[y][x] = TILES.FLOWER;
        }
    }
}

function createInteriors() {
    // House 1
    interiors.house1 = createInterior('house1', [
        [5,5,5,5,5,5,5],
        [5,4,4,4,4,4,5],
        [5,4,4,4,4,4,5],
        [5,4,4,4,4,4,5],
        [5,4,4,8,4,4,5],
        [5,4,4,4,4,4,5],
        [5,4,4,4,4,4,5],
        [5,4,4,6,4,4,5],
        [5,5,5,5,5,5,5]
    ]);
    
    // Mart
    interiors.mart = createInterior('mart', [
        [5,5,5,5,5,5,5],
        [5,4,4,4,4,4,5],
        [5,7,7,4,4,4,5],
        [5,7,7,4,4,4,5],
        [5,7,7,4,4,4,5],
        [5,4,4,4,4,4,5],
        [5,4,4,4,4,4,5],
        [5,4,4,6,4,4,5],
        [5,5,5,5,5,5,5]
    ]);
    
    // Pokemon Center
    interiors.center = createInterior('center', [
        [5,5,5,5,5,5,5],
        [5,4,4,4,4,4,5],
        [5,4,8,8,8,4,5],
        [5,4,8,8,8,4,5],
        [5,4,4,4,4,4,5],
        [5,4,4,4,4,4,5],
        [5,4,4,4,4,4,5],
        [5,4,4,6,4,4,5],
        [5,5,5,5,5,5,5]
    ]);
    
    // House 2
    interiors.house2 = createInterior('house2', [
        [5,5,5,5,5,5,5],
        [5,4,4,4,4,4,5],
        [5,4,9,9,4,4,5],
        [5,4,4,4,4,4,5],
        [5,4,4,4,4,4,5],
        [5,4,4,4,4,4,5],
        [5,4,4,4,4,4,5],
        [5,4,4,6,4,4,5],
        [5,5,5,5,5,5,5]
    ]);
}

function createInterior(name, tilePattern) {
    return {
        name: name,
        tiles: tilePattern,
        width: tilePattern[0].length,
        height: tilePattern.length,
        warps: [{ x: 3, y: 7, target: 'town', targetX: 0, targetY: 0 }] // Will be set properly
    };
}

// ============================================
// NPCS AND TRAINERS
// ============================================
function createNPCs() {
    npcs = [
        { x: 10, y: 10, map: 'town', name: 'Professor Oak', dialog: [
            "Hello there! Welcome to the world of Pokémon!",
            "My name is Oak, but people call me the Pokémon Professor!",
            "Take care of your Pikachu!"
        ]},
        { x: 21, y: 15, map: 'town', name: 'Lass', dialog: [
            "Have you seen my pretty ribbon?",
            "Oh well, I'll keep looking!",
            "Good luck on your journey!"
        ]},
        { x: 15, y: 8, map: 'town', name: 'Youngster', dialog: [
            "I want to be a Pokémon Master!",
            "But first I need to catch more Pokémon!",
            "You should try fishing by the pond!"
        ]},
        { x: 5, y: 5, map: 'house1', name: 'Mom', dialog: [
            "Sweetie, don't forget to heal your Pokémon!",
            "The Pokémon Center is north of town.",
            "Be safe out there!"
        ]},
        { x: 5, y: 3, map: 'mart', name: 'Clerk', dialog: [
            "Welcome to Poké Mart!",
            "We're out of stock right now.",
            "Please come back later!"
        ]},
        { x: 5, y: 5, map: 'house2', name: 'Fisherman', dialog: [
            "I've been fishing for 30 years!",
            "The key is patience, young one.",
            "Try using a Super Rod!"
        ]}
    ];
    
    // Trainers
    trainers = [
        { 
            x: 25, y: 12, map: 'town', name: 'Bug Catcher', 
            pokemon: [createPokemon('caterpie', 3)],
            defeated: false,
            dialog: {
                before: "I found this Caterpie in the forest!",
                after: "Wow, you're strong! Keep training!"
            }
        },
        { 
            x: 18, y: 20, map: 'town', name: 'Bird Keeper', 
            pokemon: [createPokemon('pidgey', 4)],
            defeated: false,
            dialog: {
                before: "My Pidgey loves to fly!",
                after: "Your Pokémon are amazing flyers too!"
            }
        },
        { 
            x: 32, y: 8, map: 'town', name: 'Hiker', 
            pokemon: [createPokemon('geodude', 5)],
            defeated: false,
            dialog: {
                before: "I train rock-type Pokémon!",
                after: "Your Pokémon have real grit!"
            }
        },
        { 
            x: 14, y: 18, map: 'town', name: 'Twins', 
            pokemon: [createPokemon('rattata', 4), createPokemon('rattata', 4)],
            defeated: false,
            dialog: {
                before: "We fight as a team!",
                after: "We'll get stronger together!"
            }
        }
    ];
}

function createItems() {
    items = [
        { x: 16, y: 10, map: 'town', type: 'potion', collected: false },
        { x: 28, y: 15, map: 'town', type: 'pokeball', collected: false },
        { x: 10, y: 5, map: 'town', type: 'berry', collected: false },
        { x: 35, y: 20, map: 'town', type: 'potion', collected: false }
    ];
}

// ============================================
// POKÉMON UTILITIES
// ============================================
function createPokemon(species, level) {
    const data = POKEMON_DATA[species];
    return {
        species: species,
        name: data.name,
        level: level,
        maxHp: Math.floor(data.maxHp + level * 2),
        hp: Math.floor(data.maxHp + level * 2),
        attack: Math.floor(data.attack + level * 0.5),
        defense: Math.floor(data.defense + level * 0.5),
        speed: Math.floor(data.speed + level * 0.3),
        moves: data.moves.slice(0, Math.min(4, Math.ceil(level / 5))),
        type: data.type,
        color: data.color,
        exp: 0,
        expToLevel: level * 100
    };
}

function getTypeEffectiveness(moveType, defenderType) {
    const chart = {
        'Fire': { 'Grass': 2, 'Water': 0.5, 'Fire': 0.5 },
        'Water': { 'Fire': 2, 'Grass': 0.5, 'Water': 0.5 },
        'Grass': { 'Water': 2, 'Fire': 0.5, 'Grass': 0.5 },
        'Electric': { 'Water': 2, 'Grass': 0.5, 'Electric': 0.5 },
        'Normal': {},
        'Flying': { 'Grass': 2, 'Electric': 0.5 },
        'Bug': { 'Grass': 2, 'Fire': 0.5, 'Flying': 0.5 },
        'Poison': { 'Grass': 2, 'Poison': 0.5 },
        'Rock': { 'Flying': 2, 'Fire': 2 },
        'Ground': { 'Electric': 2, 'Poison': 2, 'Flying': 0 },
        'Fighting': { 'Normal': 2, 'Rock': 2 },
        'Steel': { 'Rock': 2 },
        'Dark': {},
        'Dragon': {}
    };
    
    return chart[moveType]?.[defenderType] || 1;
}

function calculateDamage(attacker, defender, move) {
    const effectiveness = getTypeEffectiveness(move.type, defender.type);
    const random = (Math.random() * 0.15) + 0.85;
    const stab = move.type === attacker.type ? 1.5 : 1;
    
    const damage = Math.floor(
        (((2 * attacker.level / 5 + 2) * move.power * attacker.attack / defender.defense) / 50 + 2) 
        * stab * effectiveness * random
    );
    
    return { damage, effectiveness };
}

// ============================================
// INPUT HANDLING
// ============================================
function handleKeyDown(e) {
    if (!gameRunning) return;
    
    keys[e.key] = true;
    
    if (gameState === 'EXPLORING') {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
            e.preventDefault();
            tryMove(e.key);
        } else if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            interact();
        } else if (e.key === 'Escape') {
            closeDialog();
        }
    } else if (gameState === 'BATTLE') {
        if (e.key === 'Escape') {
            // Could implement running from battle
        }
    }
}

function handleKeyUp(e) {
    keys[e.key] = false;
}

function tryMove(key) {
    if (player.moving) return;
    
    let dx = 0, dy = 0;
    let newDirection = player.direction;
    
    switch(key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            dy = -1;
            newDirection = 'up';
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            dy = 1;
            newDirection = 'down';
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            dx = -1;
            newDirection = 'left';
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            dx = 1;
            newDirection = 'right';
            break;
    }
    
    player.direction = newDirection;
    
    const newX = player.x + dx;
    const newY = player.y + dy;
    
    if (canMoveTo(newX, newY)) {
        player.fromX = player.x;
        player.fromY = player.y;
        player.x = newX;
        player.y = newY;
        player.moving = true;
        player.moveProgress = 0;
        
        // Check for warp
        checkWarps();
        
        // Check for item pickup
        checkItems();
        
        // Check for trainer battle
        checkTrainerBattle();
    }
}

function canMoveTo(x, y) {
    const map = getCurrentMap();
    if (!map) return false;
    
    if (x < 0 || x >= map.width || y < 0 || y >= map.height) return false;
    
    const tile = map.tiles[y][x];
    
    // Walkable tiles
    const walkable = [TILES.GRASS, TILES.DIRT_PATH, TILES.HOUSE_FLOOR, TILES.DOOR, TILES.FLOWER, TILES.SAND, TILES.BRIDGE];
    
    if (!walkable.includes(tile)) return false;
    
    // Check for NPCs blocking
    for (const npc of npcs) {
        if (npc.map === currentMap && npc.x === x && npc.y === y) return false;
    }
    
    // Check for trainers blocking
    for (const trainer of trainers) {
        if (trainer.map === currentMap && trainer.x === x && trainer.y === y && !trainer.defeated) return false;
    }
    
    return true;
}

function getCurrentMap() {
    if (currentInterior) {
        return interiors[currentInterior];
    }
    return maps[currentMap];
}

function checkWarps() {
    const map = getCurrentMap();
    
    // Check map warps
    if (map.warps) {
        for (const warp of map.warps) {
            if (player.x === warp.x && player.y === warp.y) {
                teleport(warp.target, warp.targetX, warp.targetY);
                return;
            }
        }
    }
    
    // Check interior exit
    if (currentInterior && player.y === 7 && player.x === 3) {
        // Find the corresponding outdoor warp
        const townMap = maps.town;
        for (const warp of townMap.warps) {
            if (warp.target === currentInterior) {
                teleport('town', warp.x, warp.y + 1);
                return;
            }
        }
    }
}

function teleport(mapName, x, y) {
    currentInterior = null;
    currentMap = mapName;
    player.x = x;
    player.y = y;
    player.fromX = x;
    player.fromY = y;
    player.moving = false;
    updateCamera();
}

function checkItems() {
    for (const item of items) {
        if (item.map === currentMap && !item.collected && item.x === player.x && item.y === player.y) {
            item.collected = true;
            player.items.push(item.type);
            showDialog(`Found ${item.type.toUpperCase()}!`, [
                { text: "Nice!", action: () => closeDialog() }
            ]);
        }
    }
}

function checkTrainerBattle() {
    for (const trainer of trainers) {
        if (trainer.map === currentMap && !trainer.defeated) {
            const dx = Math.abs(trainer.x - player.x);
            const dy = Math.abs(trainer.y - player.y);
            
            // Trainer notices player when adjacent
            if (dx + dy === 1) {
                startBattle(trainer);
                return;
            }
        }
    }
}

function interact() {
    const dx = player.direction === 'left' ? -1 : player.direction === 'right' ? 1 : 0;
    const dy = player.direction === 'up' ? -1 : player.direction === 'down' ? 1 : 0;
    
    const targetX = player.x + dx;
    const targetY = player.y + dy;
    
    // Check NPCs
    for (const npc of npcs) {
        if (npc.map === (currentInterior || currentMap) && npc.x === targetX && npc.y === targetY) {
            showDialog(npc.name + ": " + npc.dialog[Math.floor(Math.random() * npc.dialog.length)], [
                { text: "Bye!", action: () => closeDialog() }
            ]);
            return;
        }
    }
    
    // Check items description
    for (const item of items) {
        if (item.map === currentMap && item.x === targetX && item.y === targetY) {
            if (item.collected) {
                showDialog("There's nothing here...", [
                    { text: "OK", action: () => closeDialog() }
                ]);
            } else {
                showDialog(`It's a ${item.type}!`, [
                    { text: "Get it!", action: () => {
                        item.collected = true;
                        player.items.push(item.type);
                        closeDialog();
                    }}
                ]);
            }
            return;
        }
    }
}

// ============================================
// BATTLE SYSTEM
// ============================================
function startBattle(trainer) {
    gameState = 'BATTLE';
    battleState.active = true;
    battleState.trainer = trainer;
    battleState.playerPokemon = player.pokemon[0];
    battleState.enemyPokemon = trainer.pokemon[0];
    battleState.turn = battleState.playerPokemon.speed >= battleState.enemyPokemon.speed ? 'player' : 'enemy';
    
    document.getElementById('battle-ui').style.display = 'block';
    updateBattleUI();
    
    showDialog(`${trainer.name} wants to battle!`, [
        { text: "Fight!", action: () => {
            closeDialog();
            showBattleActions();
        }}
    ]);
}

function showBattleActions() {
    const actionsDiv = document.getElementById('battle-actions');
    actionsDiv.innerHTML = '';
    
    const pokemon = battleState.playerPokemon;
    
    for (const move of pokemon.moves) {
        const button = document.createElement('button');
        button.className = 'battle-action';
        button.innerHTML = `
            <div>${move.name}</div>
            <div class="move-info">PWR: ${move.power} | ACC: ${move.accuracy}%</div>
        `;
        button.onclick = () => useMove(move);
        actionsDiv.appendChild(button);
    }
}

function useMove(move) {
    if (battleState.turn !== 'player') return;
    
    const attacker = battleState.playerPokemon;
    const defender = battleState.enemyPokemon;
    
    // Player's turn
    document.getElementById('battle-actions').innerHTML = '';
    
    // Check accuracy
    if (Math.random() * 100 > move.accuracy) {
        showDialog(`${attacker.name}'s attack missed!`, []);
        setTimeout(enemyTurn, 1500);
        return;
    }
    
    const result = calculateDamage(attacker, defender, move);
    defender.hp = Math.max(0, defender.hp - result.damage);
    
    let message = `${attacker.name} used ${move.name}!`;
    if (result.effectiveness > 1) {
        message += " It's super effective!";
    } else if (result.effectiveness < 1 && result.effectiveness > 0) {
        message += " It's not very effective...";
    } else if (result.effectiveness === 0) {
        message += " It had no effect...";
    }
    
    updateBattleUI();
    
    if (defender.hp <= 0) {
        setTimeout(() => winBattle(), 1000);
        return;
    }
    
    showDialog(message, []);
    setTimeout(enemyTurn, 1500);
}

function enemyTurn() {
    const attacker = battleState.enemyPokemon;
    const defender = battleState.playerPokemon;
    
    const move = attacker.moves[Math.floor(Math.random() * attacker.moves.length)];
    
    if (Math.random() * 100 > move.accuracy) {
        showDialog(`${attacker.name}'s attack missed!`, []);
        setTimeout(() => {
            closeDialog();
            showBattleActions();
            battleState.turn = 'player';
        }, 1000);
        return;
    }
    
    const result = calculateDamage(attacker, defender, move);
    defender.hp = Math.max(0, defender.hp - result.damage);
    
    let message = `${attacker.name} used ${move.name}!`;
    if (result.effectiveness > 1) {
        message += " It's super effective!";
    } else if (result.effectiveness < 1 && result.effectiveness > 0) {
        message += " It's not very effective...";
    }
    
    updateBattleUI();
    
    if (defender.hp <= 0) {
        setTimeout(() => loseBattle(), 1000);
        return;
    }
    
    showDialog(message, []);
    setTimeout(() => {
        closeDialog();
        showBattleActions();
        battleState.turn = 'player';
    }, 1000);
}

function winBattle() {
    const trainer = battleState.trainer;
    trainer.defeated = true;
    
    const expGain = Math.floor(battleState.enemyPokemon.level * 10);
    battleState.playerPokemon.exp += expGain;
    
    if (battleState.playerPokemon.exp >= battleState.playerPokemon.expToLevel) {
        battleState.playerPokemon.level++;
        battleState.playerPokemon.exp = 0;
        battleState.playerPokemon.expToLevel = battleState.playerPokemon.level * 100;
        battleState.playerPokemon.maxHp += 2;
        battleState.playerPokemon.hp = battleState.playerPokemon.maxHp;
        battleState.playerPokemon.attack += 1;
        battleState.playerPokemon.defense += 1;
        battleState.playerPokemon.speed += 1;
        
        showDialog(`Victory! ${battleState.playerPokemon.name} grew to level ${battleState.playerPokemon.level}!`, [
            { text: "Awesome!", action: () => endBattle() }
        ]);
    } else {
        showDialog(`Victory! Gained ${expGain} EXP!`, [
            { text: "Great!", action: () => endBattle() }
        ]);
    }
}

function loseBattle() {
    showDialog(`${battleState.playerPokemon.name} fainted! You blacked out...`, [
        { text: "Continue", action: () => {
            // Heal pokemon and return to center
            player.pokemon.forEach(p => p.hp = p.maxHp);
            teleport('town', 13, 8);
            endBattle();
        }}
    ]);
}

function endBattle() {
    battleState.active = false;
    battleState.trainer = null;
    document.getElementById('battle-ui').style.display = 'none';
    gameState = 'EXPLORING';
    updateBattleUI();
}

function updateBattleUI() {
    const playerPkmn = battleState.playerPokemon;
    const enemyPkmn = battleState.enemyPokemon;
    
    if (!playerPkmn || !enemyPkmn) return;
    
    document.getElementById('player-pokemon-name').textContent = `${playerPkmn.name} Lv.${playerPkmn.level}`;
    document.getElementById('player-hp').textContent = `${playerPkmn.hp}/${playerPkmn.maxHp}`;
    const playerHpPercent = (playerPkmn.hp / playerPkmn.maxHp) * 100;
    const playerHpBar = document.getElementById('player-hp-bar');
    playerHpBar.style.width = `${playerHpPercent}%`;
    playerHpBar.className = 'hp-fill' + (playerHpPercent < 25 ? ' low' : playerHpPercent < 50 ? ' medium' : '');
    
    document.getElementById('enemy-pokemon-name').textContent = `${enemyPkmn.name} Lv.${enemyPkmn.level}`;
    document.getElementById('enemy-hp').textContent = `${enemyPkmn.hp}/${enemyPkmn.maxHp}`;
    const enemyHpPercent = (enemyPkmn.hp / enemyPkmn.maxHp) * 100;
    const enemyHpBar = document.getElementById('enemy-hp-bar');
    enemyHpBar.style.width = `${enemyHpPercent}%`;
    enemyHpBar.className = 'hp-fill' + (enemyHpPercent < 25 ? ' low' : enemyHpPercent < 50 ? ' medium' : '');
}

// ============================================
// DIALOG SYSTEM
// ============================================
function showDialog(text, options = []) {
    gameState = 'DIALOG';
    dialogState.active = true;
    dialogState.text = text;
    dialogState.options = options;
    
    const dialogBox = document.getElementById('dialog-box');
    const dialogText = document.getElementById('dialog-text');
    const dialogOptions = document.getElementById('dialog-options');
    
    dialogText.textContent = text;
    dialogOptions.innerHTML = '';
    
    for (const option of options) {
        const button = document.createElement('button');
        button.className = 'dialog-option';
        button.textContent = option.text;
        button.onclick = () => {
            if (option.action) option.action();
        };
        dialogOptions.appendChild(button);
    }
    
    dialogBox.style.display = 'block';
}

function closeDialog() {
    dialogState.active = false;
    document.getElementById('dialog-box').style.display = 'none';
    if (!battleState.active) {
        gameState = 'EXPLORING';
    }
}

// ============================================
// RENDERING
// ============================================
function updateCamera() {
    camera.x = Math.max(0, Math.min(player.x * TILE_SIZE - CANVAS_WIDTH / 2, MAP_WIDTH * TILE_SIZE - CANVAS_WIDTH));
    camera.y = Math.max(0, Math.min(player.y * TILE_SIZE - CANVAS_HEIGHT / 2, MAP_HEIGHT * TILE_SIZE - CANVAS_HEIGHT));
}

function gameLoop(timestamp) {
    if (gameRunning) {
        update(timestamp);
        render();
    }
    requestAnimationFrame(gameLoop);
}

function update(timestamp) {
    // Update player movement animation
    if (player.moving) {
        player.moveProgress += 0.15;
        if (player.moveProgress >= 1) {
            player.moving = false;
            player.moveProgress = 0;
        }
        updateCamera();
    }
    
    // Continuous movement
    if (!player.moving && gameState === 'EXPLORING') {
        const now = Date.now();
        if (now - lastKeyTime > KEY_COOLDOWN) {
            for (const key of ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd']) {
                if (keys[key]) {
                    tryMove(key);
                    lastKeyTime = now;
                    break;
                }
            }
        }
    }
}

function render() {
    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    if (gameState === 'EXPLORING' || gameState === 'DIALOG') {
        renderWorld();
        renderEntities();
    } else if (gameState === 'BATTLE') {
        renderBattle();
    }
}

function renderWorld() {
    const map = getCurrentMap();
    if (!map) return;
    
    // Calculate visible tiles
    const startTileX = Math.floor(camera.x / TILE_SIZE);
    const startTileY = Math.floor(camera.y / TILE_SIZE);
    const endTileX = Math.min(MAP_WIDTH, startTileX + Math.ceil(CANVAS_WIDTH / TILE_SIZE) + 1);
    const endTileY = Math.min(MAP_HEIGHT, startTileY + Math.ceil(CANVAS_HEIGHT / TILE_SIZE) + 1);
    
    // Render tiles
    for (let y = startTileY; y < endTileY; y++) {
        for (let x = startTileX; x < endTileX; x++) {
            if (y >= 0 && y < map.height && x >= 0 && x < map.width) {
                const tile = map.tiles[y][x];
                renderTile(tile, x, y);
            }
        }
    }
}

function renderTile(tile, x, y) {
    const screenX = Math.floor(x * TILE_SIZE - camera.x);
    const screenY = Math.floor(y * TILE_SIZE - camera.y);
    
    // Try to use external sprite first
    let spriteImg = null;
    switch(tile) {
        case TILES.GRASS: spriteImg = loadedSprites.grass; break;
        case TILES.DIRT_PATH: spriteImg = loadedSprites.dirtPath; break;
        case TILES.WATER: spriteImg = loadedSprites.water; break;
        case TILES.TREE: spriteImg = loadedSprites.tree; break;
        case TILES.HOUSE_FLOOR: spriteImg = loadedSprites.houseFloor; break;
        case TILES.HOUSE_WALL: spriteImg = loadedSprites.houseWall; break;
        case TILES.DOOR: spriteImg = loadedSprites.door; break;
        case TILES.COUNTER: spriteImg = loadedSprites.counter; break;
        case TILES.PC: spriteImg = loadedSprites.pc; break;
        case TILES.BOOKSHELF: spriteImg = loadedSprites.bookshelf; break;
        case TILES.FLOWER: spriteImg = loadedSprites.flower; break;
        case TILES.ROCK: spriteImg = loadedSprites.rock; break;
        case TILES.SAND: spriteImg = loadedSprites.sand; break;
        case TILES.BRIDGE: spriteImg = loadedSprites.bridge; break;
    }
    
    // Use external sprite if loaded, otherwise fall back to procedural
    if (isImageLoaded(spriteImg)) {
        ctx.drawImage(spriteImg, screenX, screenY, TILE_SIZE, TILE_SIZE);
    } else {
        const colors = TILE_COLORS[tile] || ['#808080', '#707070', '#606060', '#505050'];
        
        // Draw pixel art tile (4x4 pattern scaled up)
        const pixelSize = TILE_SIZE / 4;
        for (let py = 0; py < 4; py++) {
            for (let px = 0; px < 4; px++) {
                const colorIndex = (py * 4 + px) % colors.length;
                ctx.fillStyle = colors[colorIndex];
                ctx.fillRect(
                    Math.floor(screenX + px * pixelSize),
                    Math.floor(screenY + py * pixelSize),
                    Math.ceil(pixelSize),
                    Math.ceil(pixelSize)
                );
            }
        }
    }
}

function renderEntities() {
    // Render items
    for (const item of items) {
        if (item.map === currentMap && !item.collected) {
            const screenX = item.x * TILE_SIZE - camera.x + TILE_SIZE / 2;
            const screenY = item.y * TILE_SIZE - camera.y + TILE_SIZE / 2;
            renderItem(item.type, screenX, screenY);
        }
    }
    
    // Render NPCs
    for (const npc of npcs) {
        if (npc.map === (currentInterior || currentMap)) {
            const screenX = npc.x * TILE_SIZE - camera.x;
            const screenY = npc.y * TILE_SIZE - camera.y;
            
            // Try external sprite first
            if (isImageLoaded(loadedSprites.npcDown)) {
                ctx.drawImage(loadedSprites.npcDown, screenX, screenY, TILE_SIZE, TILE_SIZE);
            } else {
                renderSprite(sprites.npc.down, screenX, screenY);
            }
        }
    }
    
    // Render trainers
    for (const trainer of trainers) {
        if (trainer.map === currentMap && !trainer.defeated) {
            const screenX = trainer.x * TILE_SIZE - camera.x;
            const screenY = trainer.y * TILE_SIZE - camera.y;
            
            // Try external sprite first
            if (isImageLoaded(loadedSprites.trainerDown)) {
                ctx.drawImage(loadedSprites.trainerDown, screenX, screenY, TILE_SIZE, TILE_SIZE);
            } else {
                renderSprite(sprites.trainer.down, screenX, screenY);
            }
        }
    }
    
    // Render player
    const playerScreenX = player.fromX * TILE_SIZE - camera.x + (player.x - player.fromX) * player.moveProgress * TILE_SIZE;
    const playerScreenY = player.fromY * TILE_SIZE - camera.y + (player.y - player.fromY) * player.moveProgress * TILE_SIZE;
    
    let playerSpriteImg = null;
    switch(player.direction) {
        case 'up': playerSpriteImg = loadedSprites.playerUp; break;
        case 'left': playerSpriteImg = loadedSprites.playerLeft; break;
        case 'right': playerSpriteImg = loadedSprites.playerRight; break;
        default: playerSpriteImg = loadedSprites.playerDown;
    }
    
    // Try external sprite first
    if (isImageLoaded(playerSpriteImg)) {
        ctx.drawImage(playerSpriteImg, playerScreenX, playerScreenY, TILE_SIZE, TILE_SIZE);
    } else {
        let playerSprite;
        switch(player.direction) {
            case 'up': playerSprite = sprites.player.up; break;
            case 'left': playerSprite = sprites.player.left; break;
            case 'right': playerSprite = sprites.player.right; break;
            default: playerSprite = sprites.player.down;
        }
        renderSprite(playerSprite, playerScreenX, playerScreenY);
    }
}

function renderSprite(sprite, x, y) {
    if (!sprite) return;
    
    const pixelSize = 2; // Each sprite pixel is 2x2 screen pixels
    
    for (let sy = 0; sy < sprite.length; sy++) {
        for (let sx = 0; sx < sprite[sy].length; sx++) {
            const color = sprite[sy][sx];
            if (color !== 0) {
                ctx.fillStyle = color;
                ctx.fillRect(
                    Math.floor(x + sx * pixelSize),
                    Math.floor(y + sy * pixelSize),
                    pixelSize,
                    pixelSize
                );
            }
        }
    }
}

function renderItem(type, x, y) {
    // Try external sprite first
    let spriteImg = null;
    switch(type) {
        case 'pokeball': spriteImg = loadedSprites.pokeball; break;
        case 'potion': spriteImg = loadedSprites.potion; break;
        case 'berry': spriteImg = loadedSprites.berry; break;
    }
    
    if (isImageLoaded(spriteImg)) {
        const bob = Math.sin(Date.now() / 200) * 3;
        ctx.drawImage(spriteImg, x - TILE_SIZE/2, y - TILE_SIZE/2 + bob, TILE_SIZE, TILE_SIZE);
        return;
    }
    
    // Fall back to procedural sprite
    const sprite = sprites.items[type] || sprites.items.pokeball;
    if (!sprite) return;
    
    const pixelSize = 2;
    const offsetX = -sprite[0].length * pixelSize / 2;
    const offsetY = -sprite.length * pixelSize / 2;
    
    // Bobbing animation
    const bob = Math.sin(Date.now() / 200) * 3;
    
    for (let sy = 0; sy < sprite.length; sy++) {
        for (let sx = 0; sx < sprite[sy].length; sx++) {
            const color = sprite[sy][sx];
            if (color !== 0) {
                ctx.fillStyle = color;
                ctx.fillRect(
                    Math.floor(x + offsetX + sx * pixelSize),
                    Math.floor(y + offsetY + sy * pixelSize + bob),
                    pixelSize,
                    pixelSize
                );
            }
        }
    }
}

function renderBattle() {
    // Battle background
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#87ceeb');
    gradient.addColorStop(1, '#90ee90');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Battle platform
    ctx.fillStyle = '#8b4513';
    ctx.beginPath();
    ctx.ellipse(600, 400, 150, 50, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#a0522d';
    ctx.beginPath();
    ctx.ellipse(200, 250, 120, 40, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Enemy Pokemon (top right) - front view
    if (battleState.enemyPokemon) {
        const species = battleState.enemyPokemon.species;
        const spriteImg = loadedSprites[`${species}Front`];
        
        if (isImageLoaded(spriteImg)) {
            ctx.drawImage(spriteImg, 550, 150, 96, 96);
        } else {
            const sprite = sprites.pokemon[species];
            if (sprite) {
                renderSprite(sprite, 550, 150);
            }
        }
    }
    
    // Player Pokemon (bottom left) - back view
    if (battleState.playerPokemon) {
        const species = battleState.playerPokemon.species;
        const spriteImg = loadedSprites[`${species}Back`];
        
        if (isImageLoaded(spriteImg)) {
            ctx.drawImage(spriteImg, 150, 350, 96, 96);
        } else {
            const sprite = sprites.pokemon[species];
            if (sprite) {
                // Flip horizontally for back view
                ctx.save();
                ctx.scale(-1, 1);
                renderSprite(sprite, -250, 350);
                ctx.restore();
            }
        }
    }
}

// ============================================
// START GAME
// ============================================
window.onload = init;
