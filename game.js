// ============================================
// POKEMON ADVENTURE - KANTO QUEST
// Complete Game Implementation - FINAL FIXED VERSION
// ============================================

// Canvas and Context
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Game Constants
const TILE_SIZE = 48;
const MAP_WIDTH = 20;
const MAP_HEIGHT = 15;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

// Audio system
let currentMusic = null;
const musicTracks = {
    'town': new Audio('town_ost.mp3'),
    'route': new Audio('route.mp3')
};

// Set music to loop
Object.values(musicTracks).forEach(audio => {
    audio.loop = true;
    audio.volume = 0.3;
});

function playMusic(trackName) {
    // Stop current music
    if (currentMusic) {
        currentMusic.pause();
        currentMusic.currentTime = 0;
    }
    
    // Play new music if available
    if (musicTracks[trackName]) {
        musicTracks[trackName].play().catch(() => {
            // Autoplay might be blocked, ignore error
        });
        currentMusic = musicTracks[trackName];
    }
}

function getMusicForMap(mapKey) {
    if (mapKey.includes('town') || mapKey.includes('lab') || mapKey.includes('mart') || mapKey.includes('gym')) {
        return 'town';
    } else if (mapKey.includes('route') || mapKey.includes('cave')) {
        return 'route';
    } else {
        return 'town'; // Default to town music for unknown maps
    }
}

// Game flags
let starterGiven = false;
let dialogueState = {
    active: false,
    name: '',
    lines: [],
    currentIndex: 0,
    callback: null
};

// Sprite cache
const sprites = {};

// Load all sprites
async function loadSprites() {
    const spriteNames = [
        'player-down', 'player-up', 'player-left', 'player-right',
        'npc-down', 'trainer-down',
        'grass', 'water', 'sand', 'dirt-path', 'tree', 'rock', 'flower',
        'house-floor', 'house-wall', 'door', 'bookshelf', 'counter', 'pc',
        'bridge', 'berry', 'potion', 'pokeball',
        // Pokemon fronts
        'bulbasaur-front', 'charmander-front', 'squirtle-front', 'pikachu-front',
        'jigglypuff-front', 'gastly-front', 'geodude-front', 'machop-front',
        'magikarp-front', 'psyduck-front',
        // Pokemon backs
        'bulbasaur-back', 'charmander-back', 'squirtle-back', 'pikachu-back',
        'jigglypuff-back', 'gastly-back', 'geodude-back', 'machop-back',
        'magikarp-back', 'psyduck-back'
    ];

    const promises = spriteNames.map(name => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                sprites[name] = img;
                resolve();
            };
            img.onerror = () => {
                console.warn(`Failed to load sprite: ${name}`);
                resolve();
            };
            img.src = `${name}.png`;
        });
    });

    await Promise.all(promises);
    console.log('All sprites loaded!');
}


// Pokemon object creation helper
function createPokemon(pokemonKey, level) {
    const pokemonData = POKEMON_DATA[pokemonKey];
    if (!pokemonData) return null;
    
    // Calculate stats based on level
    const hpMultiplier = level / 5;
    const statMultiplier = level / 50;
    
    return {
        name: pokemonData.name,
        type: pokemonData.type,
        level: level,
        maxHp: Math.floor(pokemonData.maxHp * hpMultiplier),
        hp: Math.floor(pokemonData.maxHp * hpMultiplier),
        attack: Math.floor(pokemonData.attack * (1 + statMultiplier)),
        defense: Math.floor(pokemonData.defense * (1 + statMultiplier)),
        speed: Math.floor(pokemonData.speed * (1 + statMultiplier)),
        moves: pokemonData.moves.slice(0, Math.min(4, Math.ceil(level / 10) + 1)),
        frontSprite: pokemonData.frontSprite,
        backSprite: pokemonData.backSprite,
        experience: 0,
        expToNextLevel: Math.floor(100 * Math.pow(level, 1.5))
    };
}

// Pokemon Data
const POKEMON_DATA = {
    bulbasaur: {
        name: 'Bulbasaur',
        type: 'Grass/Poison',
        maxHp: 45,
        attack: 49,
        defense: 49,
        speed: 45,
        moves: ['Tackle', 'Vine Whip', 'Razor Leaf', 'Solar Beam'],
        frontSprite: 'bulbasaur-front',
        backSprite: 'bulbasaur-back'
    },
    charmander: {
        name: 'Charmander',
        type: 'Fire',
        maxHp: 39,
        attack: 52,
        defense: 43,
        speed: 65,
        moves: ['Scratch', 'Ember', 'Flamethrower', 'Fire Blast'],
        frontSprite: 'charmander-front',
        backSprite: 'charmander-back'
    },
    squirtle: {
        name: 'Squirtle',
        type: 'Water',
        maxHp: 44,
        attack: 48,
        defense: 65,
        speed: 43,
        moves: ['Tackle', 'Water Gun', 'Bubble Beam', 'Hydro Pump'],
        frontSprite: 'squirtle-front',
        backSprite: 'squirtle-back'
    },
    pikachu: {
        name: 'Pikachu',
        type: 'Electric',
        maxHp: 35,
        attack: 55,
        defense: 40,
        speed: 90,
        moves: ['Quick Attack', 'Thunder Shock', 'Thunderbolt', 'Thunder'],
        frontSprite: 'pikachu-front',
        backSprite: 'pikachu-back'
    },
    jigglypuff: {
        name: 'Jigglypuff',
        type: 'Normal/Fairy',
        maxHp: 115,
        attack: 45,
        defense: 20,
        speed: 20,
        moves: ['Pound', 'Sing', 'Double Slap', 'Hyper Voice'],
        frontSprite: 'jigglypuff-front',
        backSprite: 'jigglypuff-back'
    },
    gastly: {
        name: 'Gastly',
        type: 'Ghost/Poison',
        maxHp: 30,
        attack: 35,
        defense: 30,
        speed: 80,
        moves: ['Lick', 'Confuse Ray', 'Night Shade', 'Shadow Ball'],
        frontSprite: 'gastly-front',
        backSprite: 'gastly-back'
    },
    geodude: {
        name: 'Geodude',
        type: 'Rock/Ground',
        maxHp: 40,
        attack: 80,
        defense: 100,
        speed: 20,
        moves: ['Tackle', 'Rock Throw', 'Magnitude', 'Earthquake'],
        frontSprite: 'geodude-front',
        backSprite: 'geodude-back'
    },
    machop: {
        name: 'Machop',
        type: 'Fighting',
        maxHp: 70,
        attack: 80,
        defense: 50,
        speed: 35,
        moves: ['Low Kick', 'Karate Chop', 'Seismic Toss', 'Cross Chop'],
        frontSprite: 'machop-front',
        backSprite: 'machop-back'
    },
    magikarp: {
        name: 'Magikarp',
        type: 'Water',
        maxHp: 20,
        attack: 10,
        defense: 55,
        speed: 80,
        moves: ['Splash', 'Tackle', 'Flail', 'Hydro Pump'],
        frontSprite: 'magikarp-front',
        backSprite: 'magikarp-back'
    },
    psyduck: {
        name: 'Psyduck',
        type: 'Water',
        maxHp: 50,
        attack: 52,
        defense: 48,
        speed: 55,
        moves: ['Scratch', 'Water Gun', 'Confusion', 'Psychic'],
        frontSprite: 'psyduck-front',
        backSprite: 'psyduck-back'
    }
};

// Move Data
const MOVE_DATA = {
    'Tackle': { power: 40, accuracy: 100, type: 'Normal', pp: 35 },
    'Vine Whip': { power: 45, accuracy: 100, type: 'Grass', pp: 25 },
    'Razor Leaf': { power: 55, accuracy: 95, type: 'Grass', pp: 25 },
    'Solar Beam': { power: 120, accuracy: 100, type: 'Grass', pp: 10 },
    'Scratch': { power: 40, accuracy: 100, type: 'Normal', pp: 35 },
    'Ember': { power: 40, accuracy: 100, type: 'Fire', pp: 25 },
    'Flamethrower': { power: 90, accuracy: 100, type: 'Fire', pp: 15 },
    'Fire Blast': { power: 110, accuracy: 85, type: 'Fire', pp: 5 },
    'Water Gun': { power: 40, accuracy: 100, type: 'Water', pp: 25 },
    'Bubble Beam': { power: 65, accuracy: 100, type: 'Water', pp: 20 },
    'Hydro Pump': { power: 110, accuracy: 80, type: 'Water', pp: 5 },
    'Quick Attack': { power: 40, accuracy: 100, type: 'Normal', pp: 30 },
    'Thunder Shock': { power: 40, accuracy: 100, type: 'Electric', pp: 30 },
    'Thunderbolt': { power: 90, accuracy: 100, type: 'Electric', pp: 15 },
    'Thunder': { power: 110, accuracy: 70, type: 'Electric', pp: 10 },
    'Pound': { power: 40, accuracy: 100, type: 'Normal', pp: 35 },
    'Sing': { power: 0, accuracy: 55, type: 'Normal', pp: 15, effect: 'sleep' },
    'Double Slap': { power: 15, accuracy: 85, type: 'Normal', pp: 10, hits: [2, 5] },
    'Hyper Voice': { power: 90, accuracy: 100, type: 'Normal', pp: 10 },
    'Lick': { power: 30, accuracy: 100, type: 'Ghost', pp: 30 },
    'Confuse Ray': { power: 0, accuracy: 100, type: 'Ghost', pp: 10, effect: 'confuse' },
    'Night Shade': { power: 60, accuracy: 100, type: 'Ghost', pp: 15 },
    'Shadow Ball': { power: 80, accuracy: 100, type: 'Ghost', pp: 15 },
    'Rock Throw': { power: 50, accuracy: 90, type: 'Rock', pp: 15 },
    'Magnitude': { power: 70, accuracy: 100, type: 'Ground', pp: 30 },
    'Earthquake': { power: 100, accuracy: 100, type: 'Ground', pp: 10 },
    'Low Kick': { power: 50, accuracy: 90, type: 'Fighting', pp: 20 },
    'Karate Chop': { power: 50, accuracy: 100, type: 'Fighting', pp: 25 },
    'Seismic Toss': { power: 0, accuracy: 100, type: 'Fighting', pp: 20, fixedDamage: true },
    'Cross Chop': { power: 100, accuracy: 80, type: 'Fighting', pp: 5 },
    'Splash': { power: 0, accuracy: 100, type: 'Normal', pp: 40 },
    'Flail': { power: 0, accuracy: 100, type: 'Normal', pp: 15, variable: true },
    'Confusion': { power: 50, accuracy: 100, type: 'Psychic', pp: 25 },
    'Psychic': { power: 90, accuracy: 100, type: 'Psychic', pp: 10 }
};

// Type effectiveness chart
const TYPE_CHART = {
    'Normal': { 'Rock': 0.5, 'Ghost': 0, 'Steel': 0.5 },
    'Fire': { 'Fire': 0.5, 'Water': 0.5, 'Grass': 2, 'Ice': 2, 'Bug': 2, 'Rock': 0.5, 'Dragon': 0.5, 'Steel': 2 },
    'Water': { 'Fire': 2, 'Water': 0.5, 'Grass': 0.5, 'Ground': 2, 'Rock': 2, 'Dragon': 0.5 },
    'Electric': { 'Water': 2, 'Electric': 0.5, 'Grass': 0.5, 'Ground': 0, 'Flying': 2, 'Dragon': 0.5 },
    'Grass': { 'Fire': 0.5, 'Water': 2, 'Grass': 0.5, 'Poison': 0.5, 'Ground': 2, 'Flying': 0.5, 'Bug': 0.5, 'Rock': 2, 'Dragon': 0.5, 'Steel': 0.5 },
    'Ice': { 'Fire': 0.5, 'Water': 0.5, 'Grass': 2, 'Ice': 0.5, 'Ground': 2, 'Flying': 2, 'Dragon': 2, 'Steel': 0.5 },
    'Fighting': { 'Normal': 2, 'Ice': 2, 'Poison': 0.5, 'Flying': 0.5, 'Psychic': 0.5, 'Bug': 2, 'Rock': 2, 'Ghost': 0, 'Dark': 2, 'Steel': 2, 'Fairy': 0.5 },
    'Poison': { 'Grass': 2, 'Poison': 0.5, 'Ground': 0.5, 'Rock': 0.5, 'Ghost': 0.5, 'Steel': 0, 'Fairy': 2 },
    'Ground': { 'Fire': 2, 'Electric': 2, 'Grass': 0.5, 'Poison': 2, 'Flying': 0, 'Bug': 0.5, 'Rock': 2, 'Steel': 2 },
    'Flying': { 'Electric': 0.5, 'Grass': 2, 'Fighting': 2, 'Bug': 2, 'Rock': 0.5, 'Steel': 0.5 },
    'Psychic': { 'Fighting': 2, 'Poison': 2, 'Psychic': 0.5, 'Dark': 0, 'Steel': 0.5 },
    'Bug': { 'Fire': 0.5, 'Grass': 2, 'Fighting': 0.5, 'Poison': 0.5, 'Flying': 0.5, 'Psychic': 2, 'Ghost': 0.5, 'Dark': 2, 'Steel': 0.5, 'Fairy': 0.5 },
    'Rock': { 'Fire': 2, 'Ice': 2, 'Fighting': 0.5, 'Ground': 0.5, 'Flying': 2, 'Bug': 2, 'Steel': 0.5 },
    'Ghost': { 'Normal': 0, 'Psychic': 2, 'Ghost': 2, 'Dark': 0.5 },
    'Dragon': { 'Dragon': 2, 'Steel': 0.5, 'Fairy': 0 },
    'Dark': { 'Fighting': 0.5, 'Psychic': 2, 'Ghost': 2, 'Dark': 0.5, 'Fairy': 0.5 },
    'Steel': { 'Fire': 0.5, 'Water': 0.5, 'Electric': 0.5, 'Ice': 2, 'Rock': 2, 'Steel': 0.5, 'Fairy': 2 },
    'Fairy': { 'Fire': 0.5, 'Fighting': 2, 'Poison': 0.5, 'Dragon': 2, 'Dark': 2, 'Steel': 0.5 }
};

// Game State
const GameState = {
    ROAMING: 'roaming',
    BATTLE: 'battle',
    DIALOGUE: 'dialogue',
    MENU: 'menu',
    TRANSITION: 'transition',
    MAIN_MENU: 'main_menu'
};

// Player object
const player = {
    x: 10 * TILE_SIZE,
    y: 7 * TILE_SIZE,
    direction: 'down',
    moving: false,
    moveProgress: 0,
    targetX: 0,
    targetY: 0,
    startX: 0,
    startY: 0,
    speed: 0.15,
    currentMap: 'pallet-town',
    party: [],
    money: 3000,
    inventory: {
        potions: 5,
        pokeballs: 10,
        berries: 3
    }
};

// Camera for smooth scrolling
const camera = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    smoothness: 0.1
};

// Current game state
let currentState = GameState.ROAMING;
let dialogueCallback = null;

// Battle state
let battleState = {
    playerPokemon: null,
    enemyPokemon: null,
    turn: 'player',
    phase: 'menu',
    animating: false,
    wildBattle: true,
    trainerBattle: false,
    trainerName: '',
    messageQueue: [],
    showingMessage: false
};

// Key states for smooth movement
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    w: false,
    s: false,
    a: false,
    d: false,
    Enter: false,
    Space: false,
    Escape: false
};

// Maps data
const maps = {
    'pallet-town': {
        name: 'Pallet Town',
        width: 20,
        height: 15,
        tiles: [],
        npcs: [
            { x: 8, y: 5, sprite: 'npc-down', name: 'Prof. Oak', dialogue: ['Welcome to Pallet Town!', 'I am Professor Oak, but everyone calls me the Pokemon Professor!', 'My lab is to the north.', 'Visit me when you are ready for your first Pokemon!'], givesStarter: true },
            { x: 14, y: 9, sprite: 'npc-down', name: 'Lass', dialogue: ['Hi there!', 'Have you seen my pokemon?', 'They love hiding in the grass!'] },
            { x: 4, y: 11, sprite: 'trainer-down', name: 'Youngster', dialogue: ['Want to battle?', 'My Magikarp is super strong!'], battle: { pokemon: ['magikarp'], level: 3 } }
        ],
        objects: [
            { x: 9, y: 3, sprite: 'house-wall', type: 'wall' },
            { x: 10, y: 3, sprite: 'door', type: 'door', destination: 'oaks-lab', destX: 5, destY: 12 },
            { x: 11, y: 3, sprite: 'house-wall', type: 'wall' },
            { x: 15, y: 10, sprite: 'tree', type: 'decoration' },
            { x: 16, y: 10, sprite: 'tree', type: 'decoration' },
            { x: 2, y: 8, sprite: 'tree', type: 'decoration' },
            { x: 2, y: 9, sprite: 'tree', type: 'decoration' },
            { x: 18, y: 5, sprite: 'flower', type: 'item', item: 'potion' },
            { x: 6, y: 12, sprite: 'berry', type: 'item', item: 'berry' },
            // Pokecenter
            { x: 3, y: 3, sprite: 'house-wall', type: 'wall' },
            { x: 4, y: 3, sprite: 'door', type: 'door', destination: 'pallet-pokecenter', destX: 5, destY: 10 },
            { x: 5, y: 3, sprite: 'house-wall', type: 'wall' }
        ],
        exits: [
            { x: 9, y: 0, width: 2, direction: 'north', destination: 'route-1', destX: 10, destY: 14 }
        ],
        encounterRate: 0,
        wildPokemon: []
    },
    'pallet-pokecenter': {
        name: 'Pallet Pokemon Center',
        width: 12,
        height: 12,
        tiles: [],
        npcs: [
            { x: 6, y: 4, sprite: 'npc-down', name: 'Nurse Joy', dialogue: ['Welcome to the Pokemon Center!', 'We can heal your Pokemon to full health.', 'Your Pokemon will be fighting fit in no time!'], heal: true }
        ],
        objects: [
            { x: 0, y: 0, width: 12, height: 1, sprite: 'house-wall', type: 'wall' },
            { x: 0, y: 0, width: 1, height: 12, sprite: 'house-wall', type: 'wall' },
            { x: 11, y: 0, width: 1, height: 12, sprite: 'house-wall', type: 'wall' },
            { x: 0, y: 11, width: 12, height: 1, sprite: 'house-floor', type: 'floor' },
            { x: 6, y: 11, sprite: 'door', type: 'door', destination: 'pallet-town', destX: 4, destY: 5 },
            { x: 4, y: 5, sprite: 'pc', type: 'interactable', action: 'heal', name: 'Healing Machine', dialogue: ['The healing machine is on...', 'Your pokemon have been healed to full health!'] },
            { x: 7, y: 5, sprite: 'counter', type: 'decoration' },
            { x: 8, y: 5, sprite: 'counter', type: 'decoration' },
            // Add flowers for decoration (no grass inside pokecenter)
            { x: 2, y: 4, sprite: 'flower', type: 'decoration' },
            { x: 9, y: 4, sprite: 'flower', type: 'decoration' },
            { x: 2, y: 7, sprite: 'flower', type: 'decoration' },
            { x: 9, y: 7, sprite: 'flower', type: 'decoration' }
        ],
        exits: [],
        encounterRate: 0,
        wildPokemon: []
    },
    'oaks-lab': {
        name: "Oak's Lab",
        width: 15,
        height: 15,
        tiles: [],
        npcs: [
            { x: 7, y: 4, sprite: 'npc-down', name: 'Prof. Oak', dialogue: ['Ah, welcome to my lab!', 'I am Professor Oak, the Pokemon researcher.', 'Are you ready to begin your journey?', 'You need a Pokemon partner for your adventure.', 'Choose wisely - this Pokemon will be with you throughout your journey!'], givesStarter: true }
        ],
        objects: [
            { x: 0, y: 0, width: 15, height: 1, sprite: 'house-wall', type: 'wall' },
            { x: 0, y: 0, width: 1, height: 15, sprite: 'house-wall', type: 'wall' },
            { x: 14, y: 0, width: 1, height: 15, sprite: 'house-wall', type: 'wall' },
            { x: 0, y: 14, width: 15, height: 1, sprite: 'house-floor', type: 'floor' },
            { x: 7, y: 14, sprite: 'door', type: 'door', destination: 'pallet-town', destX: 10, destY: 5 },
            { x: 4, y: 5, sprite: 'pc', type: 'interactable', action: 'heal', name: 'PC', dialogue: ['The PC is on...', 'Your pokemon have been healed!'] },
            { x: 10, y: 5, sprite: 'bookshelf', type: 'decoration' },
            { x: 11, y: 5, sprite: 'bookshelf', type: 'decoration' },
            { x: 4, y: 6, sprite: 'counter', type: 'decoration', width: 3 },
            { x: 5, y: 6, sprite: 'counter', type: 'decoration' },
            { x: 6, y: 6, sprite: 'counter', type: 'decoration' },
            { x: 10, y: 6, sprite: 'counter', type: 'decoration' },
            { x: 11, y: 6, sprite: 'counter', type: 'decoration' },
            { x: 12, y: 6, sprite: 'counter', type: 'decoration' }
        ],
        exits: [],
        encounterRate: 0,
        wildPokemon: []
    },
    'route-1': {
        name: 'Route 1',
        width: 20,
        height: 15,
        tiles: [],
        npcs: [
            { x: 5, y: 8, sprite: 'trainer-down', name: 'Bug Catcher', dialogue: ['Watch out!', 'My bug pokemon are fierce!'], battle: { pokemon: ['psyduck'], level: 4 } },
            { x: 15, y: 5, sprite: 'trainer-down', name: 'Lass', dialogue: ['Ready for a battle?'], battle: { pokemon: ['jigglypuff'], level: 5 } }
        ],
        objects: [
            { x: 3, y: 3, sprite: 'tree', type: 'decoration' },
            { x: 4, y: 3, sprite: 'tree', type: 'decoration' },
            { x: 5, y: 3, sprite: 'tree', type: 'decoration' },
            { x: 14, y: 10, sprite: 'tree', type: 'decoration' },
            { x: 15, y: 10, sprite: 'tree', type: 'decoration' },
            { x: 16, y: 10, sprite: 'tree', type: 'decoration' },
            { x: 8, y: 6, sprite: 'rock', type: 'decoration' },
            { x: 9, y: 6, sprite: 'rock', type: 'decoration' },
            { x: 12, y: 3, sprite: 'flower', type: 'decoration' },
            { x: 13, y: 3, sprite: 'flower', type: 'decoration' },
            { x: 2, y: 12, sprite: 'potion', type: 'item', item: 'potion' },
            { x: 17, y: 2, sprite: 'pokeball', type: 'item', item: 'pokeball' },
            { x: 10, y: 7, sprite: 'bridge', type: 'bridge' },
            { x: 10, y: 8, sprite: 'water', type: 'water' },
            { x: 10, y: 9, sprite: 'water', type: 'water' },
            // Grass patches for wild encounters
            { x: 6, y: 4, sprite: 'grass', type: 'grass' },
            { x: 7, y: 4, sprite: 'grass', type: 'grass' },
            { x: 8, y: 4, sprite: 'grass', type: 'grass' },
            { x: 6, y: 5, sprite: 'grass', type: 'grass' },
            { x: 7, y: 5, sprite: 'grass', type: 'grass' },
            { x: 8, y: 5, sprite: 'grass', type: 'grass' },
            { x: 12, y: 10, sprite: 'grass', type: 'grass' },
            { x: 13, y: 10, sprite: 'grass', type: 'grass' },
            { x: 12, y: 11, sprite: 'grass', type: 'grass' },
            { x: 13, y: 11, sprite: 'grass', type: 'grass' }
        ],
        exits: [
            { x: 10, y: 14, width: 2, direction: 'south', destination: 'pallet-town', destX: 10, destY: 1 },
            { x: 10, y: 0, width: 2, direction: 'north', destination: 'viridian-city', destX: 10, destY: 14 }
        ],
        encounterRate: 0.15,
        wildPokemon: ['pikachu', 'magikarp', 'psyduck']
    },
    'viridian-city': {
        name: 'Viridian City',
        width: 20,
        height: 15,
        tiles: [],
        npcs: [
            { x: 6, y: 8, sprite: 'npc-down', name: 'Fisherman', dialogue: ['Fishing is life!', 'Have you tried fishing near water?'] },
            { x: 14, y: 6, sprite: 'trainer-down', name: 'Gym Trainer', dialogue: ['The Gym Leader is waiting!', 'Are you strong enough?'], battle: { pokemon: ['geodude', 'machop'], level: 6 } },
            { x: 3, y: 4, sprite: 'npc-down', name: 'Shop Clerk', dialogue: ['Welcome to the Mart!', 'Best prices in Kanto!'] }
        ],
        objects: [
            { x: 5, y: 3, sprite: 'house-wall', type: 'wall' },
            { x: 6, y: 3, sprite: 'door', type: 'door', destination: 'viridian-mart', destX: 5, destY: 12 },
            { x: 7, y: 3, sprite: 'house-wall', type: 'wall' },
            { x: 13, y: 9, sprite: 'house-wall', type: 'wall' },
            { x: 14, y: 9, sprite: 'door', type: 'door', destination: 'viridian-gym', destX: 5, destY: 12 },
            { x: 15, y: 9, sprite: 'house-wall', type: 'wall' },
            { x: 2, y: 11, sprite: 'tree', type: 'decoration' },
            { x: 3, y: 11, sprite: 'tree', type: 'decoration' },
            { x: 17, y: 5, sprite: 'tree', type: 'decoration' },
            { x: 18, y: 5, sprite: 'tree', type: 'decoration' },
            { x: 10, y: 7, sprite: 'flower', type: 'decoration' },
            { x: 11, y: 7, sprite: 'flower', type: 'decoration' },
            { x: 8, y: 12, sprite: 'berry', type: 'item', item: 'berry' }
        ],
        exits: [
            { x: 10, y: 14, width: 2, direction: 'south', destination: 'route-1', destX: 10, destY: 1 },
            { x: 0, y: 7, width: 1, direction: 'west', destination: 'route-22', destX: 19, destY: 7 }
        ],
        encounterRate: 0,
        wildPokemon: []
    },
    'viridian-mart': {
        name: 'Viridian Mart',
        width: 12,
        height: 12,
        tiles: [],
        npcs: [
            { x: 6, y: 3, sprite: 'npc-down', name: 'Clerk', dialogue: ['Welcome!', 'Potions restore HP.', 'Pokeballs catch wild pokemon.'], shop: true }
        ],
        objects: [
            { x: 0, y: 0, width: 12, height: 1, sprite: 'house-wall', type: 'wall' },
            { x: 0, y: 0, width: 1, height: 12, sprite: 'house-wall', type: 'wall' },
            { x: 11, y: 0, width: 1, height: 12, sprite: 'house-wall', type: 'wall' },
            { x: 0, y: 11, width: 12, height: 1, sprite: 'house-floor', type: 'floor' },
            { x: 6, y: 11, sprite: 'door', type: 'door', destination: 'viridian-city', destX: 6, destY: 5 },
            { x: 2, y: 4, sprite: 'counter', type: 'decoration' },
            { x: 3, y: 4, sprite: 'counter', type: 'decoration' },
            { x: 8, y: 4, sprite: 'counter', type: 'decoration' },
            { x: 9, y: 4, sprite: 'counter', type: 'decoration' },
            { x: 2, y: 7, sprite: 'bookshelf', type: 'decoration' },
            { x: 3, y: 7, sprite: 'bookshelf', type: 'decoration' }
        ],
        exits: [],
        encounterRate: 0,
        wildPokemon: []
    },
    'viridian-gym': {
        name: 'Viridian Gym',
        width: 12,
        height: 12,
        tiles: [],
        npcs: [
            { x: 6, y: 4, sprite: 'trainer-down', name: 'Giovanni', dialogue: ['I am Giovanni, Gym Leader!', 'My Ground types are unstoppable!', 'Prepare for battle!'], battle: { pokemon: ['geodude', 'machop', 'psyduck'], level: 8 }, boss: true }
        ],
        objects: [
            { x: 0, y: 0, width: 12, height: 1, sprite: 'house-wall', type: 'wall' },
            { x: 0, y: 0, width: 1, height: 12, sprite: 'house-wall', type: 'wall' },
            { x: 11, y: 0, width: 1, height: 12, sprite: 'house-wall', type: 'wall' },
            { x: 0, y: 11, width: 12, height: 1, sprite: 'house-floor', type: 'floor' },
            { x: 6, y: 11, sprite: 'door', type: 'door', destination: 'viridian-city', destX: 14, destY: 9 },
            { x: 3, y: 6, sprite: 'rock', type: 'obstacle' },
            { x: 8, y: 6, sprite: 'rock', type: 'obstacle' },
            { x: 3, y: 9, sprite: 'rock', type: 'obstacle' },
            { x: 8, y: 9, sprite: 'rock', type: 'obstacle' }
        ],
        exits: [],
        encounterRate: 0,
        wildPokemon: []
    },
    'route-22': {
        name: 'Route 22',
        width: 25,
        height: 12,
        tiles: [],
        npcs: [
            { x: 8, y: 5, sprite: 'trainer-down', name: 'Rival', dialogue: ['So we meet again!', 'My pokemon are stronger now!', 'Lets battle!'], battle: { pokemon: ['charmander', 'squirtle', 'bulbasaur'], level: 7 }, rival: true }
        ],
        objects: [
            { x: 5, y: 2, sprite: 'tree', type: 'decoration' },
            { x: 6, y: 2, sprite: 'tree', type: 'decoration' },
            { x: 18, y: 8, sprite: 'tree', type: 'decoration' },
            { x: 19, y: 8, sprite: 'tree', type: 'decoration' },
            { x: 12, y: 4, sprite: 'rock', type: 'decoration' },
            { x: 13, y: 4, sprite: 'rock', type: 'decoration' },
            { x: 3, y: 9, sprite: 'grass', type: 'grass' },
            { x: 4, y: 9, sprite: 'grass', type: 'grass' },
            { x: 5, y: 9, sprite: 'grass', type: 'grass' },
            { x: 3, y: 10, sprite: 'grass', type: 'grass' },
            { x: 4, y: 10, sprite: 'grass', type: 'grass' },
            { x: 5, y: 10, sprite: 'grass', type: 'grass' },
            { x: 20, y: 3, sprite: 'potion', type: 'item', item: 'potion' },
            { x: 15, y: 7, sprite: 'water', type: 'water' },
            { x: 16, y: 7, sprite: 'water', type: 'water' },
            { x: 15, y: 8, sprite: 'water', type: 'water' },
            { x: 16, y: 8, sprite: 'water', type: 'water' }
        ],
        exits: [
            { x: 24, y: 6, width: 1, direction: 'east', destination: 'viridian-city', destX: 1, destY: 7 }
        ],
        encounterRate: 0.2,
        wildPokemon: ['pikachu', 'magikarp', 'psyduck', 'geodude']
    },
    'mystery-cave': {
        name: 'Mystery Cave',
        width: 18,
        height: 14,
        tiles: [],
        npcs: [],
        objects: [
            { x: 0, y: 0, width: 18, height: 1, sprite: 'house-wall', type: 'wall' },
            { x: 0, y: 0, width: 1, height: 14, sprite: 'house-wall', type: 'wall' },
            { x: 17, y: 0, width: 1, height: 14, sprite: 'house-wall', type: 'wall' },
            { x: 0, y: 13, width: 18, height: 1, sprite: 'house-floor', type: 'floor' },
            { x: 9, y: 13, sprite: 'door', type: 'door', destination: 'route-1', destX: 5, destY: 5 },
            { x: 5, y: 5, sprite: 'rock', type: 'obstacle' },
            { x: 12, y: 5, sprite: 'rock', type: 'obstacle' },
            { x: 8, y: 8, sprite: 'rock', type: 'obstacle' },
            { x: 3, y: 10, sprite: 'crystal', type: 'decoration' },
            { x: 14, y: 10, sprite: 'crystal', type: 'decoration' },
            { x: 9, y: 6, sprite: 'pokeball', type: 'item', item: 'potion' },
            { x: 15, y: 3, sprite: 'berry', type: 'item', item: 'berry' }
        ],
        exits: [],
        encounterRate: 0.25,
        wildPokemon: ['gastly', 'geodude', 'machop']
    }
};

// Initialize map tiles
function initializeMap(mapKey) {
    const map = maps[mapKey];
    if (!map) return;

    map.tiles = [];
    for (let y = 0; y < map.height; y++) {
        map.tiles[y] = [];
        for (let x = 0; x < map.width; x++) {
            // Default tile based on map type
            let tile = 'grass';
            if (mapKey.includes('lab') || mapKey.includes('mart') || mapKey.includes('gym') || mapKey.includes('pokecenter')) {
                tile = 'house-floor';
            } else if (mapKey.includes('cave')) {
                tile = 'sand';
            } else if (mapKey.includes('route')) {
                tile = Math.random() > 0.7 ? 'grass' : 'dirt-path';
            }
            map.tiles[y][x] = { type: tile, walkable: true };
        }
    }

    // Mark walls and obstacles as not walkable
    if (map.objects) {
        map.objects.forEach(obj => {
            if (obj.type === 'wall' || obj.type === 'obstacle' || obj.type === 'water') {
                const width = obj.width || 1;
                const height = obj.height || 1;
                for (let dy = 0; dy < height; dy++) {
                    for (let dx = 0; dx < width; dx++) {
                        const ty = obj.y + dy;
                        const tx = obj.x + dx;
                        if (ty >= 0 && ty < map.height && tx >= 0 && tx < map.width) {
                            map.tiles[ty][tx].walkable = false;
                            map.tiles[ty][tx].sprite = obj.sprite;
                        }
                    }
                }
            } else if (obj.sprite) {
                // For decorations (trees, rocks), items, grass patches - set sprite but keep walkable
                const width = obj.width || 1;
                const height = obj.height || 1;
                for (let dy = 0; dy < height; dy++) {
                    for (let dx = 0; dx < width; dx++) {
                        const ty = obj.y + dy;
                        const tx = obj.x + dx;
                        if (ty >= 0 && ty < map.height && tx >= 0 && tx < map.width) {
                            // Only mark as non-walkable if it's a decoration (tree, rock)
                            if (obj.type === 'decoration' && (obj.sprite === 'tree' || obj.sprite === 'rock')) {
                                map.tiles[ty][tx].walkable = false;
                            }
                            // Set the sprite for rendering
                            map.tiles[ty][tx].sprite = obj.sprite;
                            // Store object type for encounter checking
                            if (obj.type === 'grass') {
                                map.tiles[ty][tx].isGrass = true;
                            }
                            // Store floor tile under items for proper rendering
                            if (obj.type === 'item') {
                                map.tiles[ty][tx].floorTile = map.tiles[ty][tx].type;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Set pokecenter spawn point for each city/town
    if (mapKey.includes('town') || mapKey.includes('city')) {
        // Find a suitable spawn point near the center or entrance
        pokecenterSpawnPoint = { map: mapKey, x: 10, y: 5 };
    }
}

// Check collision
function checkCollision(x, y) {
    const map = maps[player.currentMap];
    if (!map) return true;

    const tileX = Math.floor(x / TILE_SIZE);
    const tileY = Math.floor(y / TILE_SIZE);

    // Check bounds
    if (tileX < 0 || tileX >= map.width || tileY < 0 || tileY >= map.height) {
        return true;
    }

    // Check tile walkability
    if (map.tiles[tileY] && map.tiles[tileY][tileX] && !map.tiles[tileY][tileX].walkable) {
        return true;
    }

    // Check NPCs
    for (const npc of map.npcs) {
        const npcPixelX = npc.x * TILE_SIZE;
        const npcPixelY = npc.y * TILE_SIZE;
        if (x < npcPixelX + TILE_SIZE && x + TILE_SIZE > npcPixelX &&
            y < npcPixelY + TILE_SIZE && y + TILE_SIZE > npcPixelY) {
            return true;
        }
    }

    // Check objects - include trees, rocks, doors, counters as obstacles
    if (map.objects) {
        for (const obj of map.objects) {
            // Obstacles: walls, water, decorations (trees, rocks), doors, counters
            if (obj.type === 'obstacle' || obj.type === 'wall' || obj.type === 'water' || 
                obj.type === 'decoration' || obj.type === 'door' || obj.sprite === 'tree' || 
                obj.sprite === 'rock' || obj.sprite === 'counter') {
                const objWidth = (obj.width || 1) * TILE_SIZE;
                const objHeight = (obj.height || 1) * TILE_SIZE;
                const objX = obj.x * TILE_SIZE;
                const objY = obj.y * TILE_SIZE;
                if (x < objX + objWidth && x + TILE_SIZE > objX &&
                    y < objY + objHeight && y + TILE_SIZE > objY) {
                    return true;
                }
            }
        }
    }

    return false;
}

// Check for exits
function checkExits() {
    const map = maps[player.currentMap];
    if (!map || !map.exits) return;

    const playerTileX = Math.floor(player.x / TILE_SIZE);
    const playerTileY = Math.floor(player.y / TILE_SIZE);

    for (const exit of map.exits) {
        if (playerTileX >= exit.x && playerTileX < exit.x + exit.width &&
            ((exit.direction === 'north' && playerTileY === exit.y) ||
             (exit.direction === 'south' && playerTileY === exit.y) ||
             (exit.direction === 'west' && playerTileX === exit.x) ||
             (exit.direction === 'east' && playerTileX === exit.x))) {
            
            // Transition to new map
            transitionToMap(exit.destination, exit.destX, exit.destY);
            break;
        }
    }
}

// Map transition
function transitionToMap(newMap, newX, newY) {
    currentState = GameState.TRANSITION;
    
    setTimeout(() => {
        player.currentMap = newMap;
        player.x = newX * TILE_SIZE;
        player.y = newY * TILE_SIZE;
        player.moving = false;
        
        initializeMap(newMap);
        
        // Show location name
        showLocationName(maps[newMap].name);
        
        // Play appropriate music for the new map
        playMusic(getMusicForMap(newMap));
        
        currentState = GameState.ROAMING;
    }, 500);
}

// Show location name
function showLocationName(name) {
    const locationEl = document.getElementById('location-name');
    locationEl.textContent = name;
    locationEl.classList.remove('active');
    void locationEl.offsetWidth; // Trigger reflow
    locationEl.classList.add('active');
}

// Render main menu
function renderMainMenu() {
    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#1a252f');
    gradient.addColorStop(0.5, '#2c3e50');
    gradient.addColorStop(1, '#1a252f');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw title
    ctx.save();
    ctx.fillStyle = '#f39c12';
    ctx.font = 'bold 48px "Press Start 2P", "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('POKEMON ADVENTURE', CANVAS_WIDTH / 2, 150);
    
    ctx.fillStyle = '#3498db';
    ctx.font = '24px "Press Start 2P", "Courier New", monospace';
    ctx.fillText('KANTO QUEST', CANVAS_WIDTH / 2, 210);
    
    // Draw menu options
    ctx.fillStyle = '#ecf0f1';
    ctx.font = '16px "Press Start 2P", "Courier New", monospace';
    
    // Start button (highlighted)
    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(CANVAS_WIDTH / 2 - 100, 300, 200, 50);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('PRESS ENTER TO START', CANVAS_WIDTH / 2, 335);
    
    // Instructions
    ctx.fillStyle = '#95a5a6';
    ctx.font = '12px "Press Start 2P", "Courier New", monospace';
    ctx.fillText('Controls: Arrow Keys/WASD to move', CANVAS_WIDTH / 2, 420);
    ctx.fillText('Enter/Space to interact', CANVAS_WIDTH / 2, 445);
    
    ctx.restore();
}

// Check for NPC interaction
function checkNPCInteraction() {
    const map = maps[player.currentMap];
    if (!map) return null;

    const playerTileX = Math.floor(player.x / TILE_SIZE);
    const playerTileY = Math.floor(player.y / TILE_SIZE);

    // Check adjacent tiles for NPCs
    const directions = [
        { dx: 0, dy: -1 }, // up
        { dx: 0, dy: 1 },  // down
        { dx: -1, dy: 0 }, // left
        { dx: 1, dy: 0 }   // right
    ];

    for (const dir of directions) {
        const checkX = playerTileX + dir.dx;
        const checkY = playerTileY + dir.dy;

        for (const npc of map.npcs) {
            if (npc.x === checkX && npc.y === checkY) {
                return npc;
            }
        }
    }

    return null;
}

// Check for object interaction
function checkObjectInteraction() {
    const map = maps[player.currentMap];
    if (!map || !map.objects) return null;

    const playerTileX = Math.floor(player.x / TILE_SIZE);
    const playerTileY = Math.floor(player.y / TILE_SIZE);

    const directions = [
        { dx: 0, dy: -1 },
        { dx: 0, dy: 1 },
        { dx: -1, dy: 0 },
        { dx: 1, dy: 0 }
    ];

    for (const dir of directions) {
        const checkX = playerTileX + dir.dx;
        const checkY = playerTileY + dir.dy;

        for (const obj of map.objects) {
            if (obj.x === checkX && obj.y === checkY) {
                if (obj.type === 'item') {
                    return obj;
                }
                if (obj.type === 'interactable') {
                    return obj;
                }
                if (obj.type === 'door') {
                    return obj;
                }
            }
        }
    }

    return null;
}

// Dialogue system - improved multi-line dialogue
function showDialogue(name, lines, callback) {
    currentState = GameState.DIALOGUE;
    
    // Initialize dialogue state
    dialogueState.active = true;
    dialogueState.name = name;
    dialogueState.lines = lines;
    dialogueState.currentIndex = 0;
    dialogueState.callback = callback;
    
    const dialogueBox = document.getElementById('dialogue-box');
    const dialogueName = document.getElementById('dialogue-name');
    const dialogueText = document.getElementById('dialogue-text');
    
    dialogueBox.classList.add('active');
    dialogueName.textContent = name;
    
    // Show first line
    showNextDialogueLine();
}

function showNextDialogueLine() {
    const dialogueText = document.getElementById('dialogue-text');
    
    if (dialogueState.currentIndex < dialogueState.lines.length) {
        dialogueText.textContent = dialogueState.lines[dialogueState.currentIndex];
        dialogueState.currentIndex++;
    } else {
        // All lines shown, close dialogue
        closeDialogue();
    }
}

function closeDialogue() {
    const dialogueBox = document.getElementById('dialogue-box');
    dialogueBox.classList.remove('active');
    
    // Call callback if exists
    if (dialogueState.callback) {
        const cb = dialogueState.callback;
        dialogueState.callback = null;
        cb();
    }
    
    dialogueState.active = false;
    dialogueState.lines = [];
    dialogueState.currentIndex = 0;
    currentState = GameState.ROAMING;
}

// Start battle
function startBattle(enemyPokemonList, levels, isTrainer = false, trainerName = '') {
    currentState = GameState.BATTLE;
    
    // If player has no pokemon, they can't battle - just return silently (no alert)
    if (player.party.length === 0) {
        currentState = GameState.ROAMING;
        return;
    }

    // Find first non-fainted pokemon
    let availablePokemon = player.party.filter(p => p.hp > 0);
    if (availablePokemon.length === 0) {
        currentState = GameState.ROAMING;
        return;
    }

    battleState.playerPokemon = availablePokemon[0];
    battleState.wildBattle = !isTrainer;
    battleState.trainerBattle = isTrainer;
    battleState.trainerName = trainerName;
    battleState.turn = 'player';
    battleState.phase = 'menu';
    battleState.animating = false;
    battleState.messageQueue = [];
    battleState.showingMessage = false;

    // Create enemy pokemon using createPokemon function
    const randomIndex = Math.floor(Math.random() * enemyPokemonList.length);
    const pokemonKey = enemyPokemonList[randomIndex];
    const level = levels ? levels[randomIndex] || 5 : 5;
    
    battleState.enemyPokemon = createPokemon(pokemonKey, level);
    if (!battleState.enemyPokemon) {
        battleState.enemyPokemon = createPokemon('pikachu', level);
    }
    battleState.enemyPokemon.currentMove = 0;

    // Update battle UI
    updateBattleUI();
    document.getElementById('battle-ui').classList.add('active');
    document.getElementById('battle-menu').style.display = 'grid';
    document.getElementById('move-selection').classList.remove('active');

    // Show battle start message
    if (isTrainer) {
        queueBattleMessage(`${trainerName} wants to battle!`);
    } else {
        queueBattleMessage(`Wild ${battleState.enemyPokemon.name} appeared!`);
    }
    
    processBattleMessages();
}

// Queue battle message
function queueBattleMessage(message) {
    battleState.messageQueue.push(message);
}

// Process battle messages
function processBattleMessages() {
    if (battleState.showingMessage || battleState.messageQueue.length === 0) {
        if (battleState.messageQueue.length === 0 && !battleState.showingMessage) {
            // All messages processed, continue battle
            if (battleState.phase === 'message') {
                battleState.phase = 'menu';
                updateBattleUI();
            }
        }
        return;
    }

    battleState.showingMessage = true;
    battleState.phase = 'message';
    
    const message = battleState.messageQueue.shift();
    
    // Create temporary message overlay
    const messageEl = document.createElement('div');
    messageEl.style.cssText = `
        position: absolute;
        bottom: 200px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 15px 30px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 300;
    `;
    messageEl.textContent = message;
    document.getElementById('battle-ui').appendChild(messageEl);

    setTimeout(() => {
        messageEl.remove();
        battleState.showingMessage = false;
        processBattleMessages();
    }, 1500);
}

// Update battle UI
function updateBattleUI() {
    if (!battleState.playerPokemon || !battleState.enemyPokemon) return;

    const playerPkmn = battleState.playerPokemon;
    const enemyPkmn = battleState.enemyPokemon;

    document.getElementById('enemy-name').textContent = enemyPkmn.name;
    document.getElementById('player-pokemon-name').textContent = playerPkmn.name;

    updateHealthBar('enemy', enemyPkmn.hp, enemyPkmn.maxHp);
    updateHealthBar('player', playerPkmn.hp, playerPkmn.maxHp);

    document.getElementById('enemy-hp-text').textContent = `${enemyPkmn.hp}/${enemyPkmn.maxHp}`;
    document.getElementById('player-hp-text').textContent = `${playerPkmn.hp}/${playerPkmn.maxHp}`;
}

function updateHealthBar(who, hp, maxHp) {
    const bar = document.getElementById(`${who}-health`);
    const percentage = (hp / maxHp) * 100;
    bar.style.width = `${percentage}%`;
    
    bar.classList.remove('low', 'medium');
    if (percentage <= 20) {
        bar.classList.add('low');
    } else if (percentage <= 50) {
        bar.classList.add('medium');
    }
}

// Calculate damage
function calculateDamage(attacker, defender, move) {
    if (move.power === 0) {
        if (move.effect) {
            return { damage: 0, effective: 1, status: move.effect };
        }
        if (move.fixedDamage) {
            return { damage: attacker.level, effective: 1 };
        }
        if (move.variable) {
            const hpPercent = attacker.hp / attacker.maxHp;
            const power = hpPercent > 0.5 ? 20 : (hpPercent > 0.25 ? 40 : 80);
            return { damage: Math.floor(power * attacker.attack / defender.defense), effective: 1 };
        }
        return { damage: 0, effective: 1 };
    }

    // Damage formula (simplified Pokemon formula)
    const level = attacker.level;
    const attack = attacker.attack;
    const defense = defender.defense;
    const basePower = move.power;

    let damage = Math.floor(((2 * level / 5 + 2) * basePower * attack / defense) / 50 + 2);

    // Type effectiveness
    let effectiveness = 1;
    const moveType = move.type;
    const defenderTypes = defender.type.split('/');

    for (const defType of defenderTypes) {
        if (TYPE_CHART[moveType] && TYPE_CHART[moveType][defType] !== undefined) {
            effectiveness *= TYPE_CHART[moveType][defType];
        }
    }

    damage = Math.floor(damage * effectiveness);

    // Random variance (0.85 to 1.0)
    damage = Math.floor(damage * (0.85 + Math.random() * 0.15));

    // STAB (Same Type Attack Bonus)
    const attackerTypes = attacker.type.split('/');
    if (attackerTypes.includes(moveType)) {
        damage = Math.floor(damage * 1.5);
    }

    return { damage, effective: effectiveness };
}

// Execute player move
function executePlayerMove(moveName) {
    if (battleState.animating) return;
    battleState.animating = true;

    const playerPkmn = battleState.playerPokemon;
    const enemyPkmn = battleState.enemyPokemon;
    const move = MOVE_DATA[moveName];

    if (!move) {
        battleState.animating = false;
        battleState.turn = 'player';
        battleState.phase = 'menu';
        updateBattleUI();
        return;
    }

    // Check accuracy
    if (Math.random() * 100 > move.accuracy) {
        queueBattleMessage(`${playerPkmn.name}'s attack missed!`);
        processBattleMessages();
        setTimeout(() => {
            battleState.animating = false;
            battleState.turn = 'enemy';
            battleState.phase = 'action';
            document.getElementById('battle-menu').style.display = 'none';
            updateBattleUI();
            enemyTurn();
        }, 2000);
        return;
    }

    const result = calculateDamage(playerPkmn, enemyPkmn, move);

    // Animate attack
    animateAttack('player', () => {
        queueBattleMessage(`${playerPkmn.name} used ${moveName}!`);
        
        if (result.effective > 1) {
            queueBattleMessage("It's super effective!");
        } else if (result.effective < 1 && result.effective > 0) {
            queueBattleMessage("It's not very effective...");
        } else if (result.effective === 0) {
            queueBattleMessage("It had no effect...");
        }

        processBattleMessages();

        // Apply damage
        enemyPkmn.hp = Math.max(0, enemyPkmn.hp - result.damage);
        updateBattleUI();

        // Check if enemy fainted
        if (enemyPkmn.hp <= 0) {
            setTimeout(() => {
                queueBattleMessage(`${enemyPkmn.name} fainted!`);
                processBattleMessages();
                
                setTimeout(() => {
                    if (battleState.trainerBattle) {
                        queueBattleMessage(`${battleState.trainerName} was defeated!`);
                        processBattleMessages();
                        
                        setTimeout(() => {
                            endBattle(true, true);
                        }, 2000);
                    } else {
                        // Wild battle - victory
                        setTimeout(() => {
                            endBattle(true, false);
                        }, 2000);
                    }
                }, 2000);
            }, 500);
        } else {
            setTimeout(() => {
                battleState.animating = false;
                battleState.turn = 'enemy';
                battleState.phase = 'action';
                enemyTurn();
            }, 2000);
        }
    });
}

// Enemy turn
function enemyTurn() {
    if (battleState.animating) return;
    battleState.animating = true;

    const playerPkmn = battleState.playerPokemon;
    const enemyPkmn = battleState.enemyPokemon;

    // Choose random move
    const moveName = enemyPkmn.moves[Math.floor(Math.random() * enemyPkmn.moves.length)];
    const move = MOVE_DATA[moveName];

    // Check accuracy
    if (Math.random() * 100 > move.accuracy) {
        queueBattleMessage(`${enemyPkmn.name}'s attack missed!`);
        processBattleMessages();
        setTimeout(() => {
            battleState.animating = false;
            battleState.turn = 'player';
            battleState.phase = 'menu';
            document.getElementById('battle-menu').style.display = 'grid';
            updateBattleUI();
        }, 2000);
        return;
    }

    const result = calculateDamage(enemyPkmn, playerPkmn, move);

    animateAttack('enemy', () => {
        queueBattleMessage(`${enemyPkmn.name} used ${moveName}!`);
        
        if (result.effective > 1) {
            queueBattleMessage("It's super effective!");
        } else if (result.effective < 1 && result.effective > 0) {
            queueBattleMessage("It's not very effective...");
        }

        processBattleMessages();

        // Apply damage
        playerPkmn.hp = Math.max(0, playerPkmn.hp - result.damage);
        updateBattleUI();

        // Check if player pokemon fainted
        if (playerPkmn.hp <= 0) {
            setTimeout(() => {
                queueBattleMessage(`${playerPkmn.name} fainted!`);
                processBattleMessages();

                setTimeout(() => {
                    // Check for other pokemon
                    const availablePokemon = player.party.filter(p => p.hp > 0);
                    if (availablePokemon.length > 0) {
                        // Switch pokemon
                        battleState.playerPokemon = availablePokemon[0];
                        updateBattleUI();
                        queueBattleMessage(`Go! ${battleState.playerPokemon.name}!`);
                        processBattleMessages();
                        setTimeout(() => {
                            battleState.animating = false;
                            battleState.turn = 'player';
                            battleState.phase = 'menu';
                            updateBattleUI();
                        }, 2000);
                    } else {
                        // All pokemon fainted - lose
                        queueBattleMessage('You have no more Pokemon!');
                        processBattleMessages();
                        setTimeout(() => {
                            endBattle(false, battleState.trainerBattle);
                        }, 2000);
                    }
                }, 2000);
            }, 500);
        } else {
            setTimeout(() => {
                battleState.animating = false;
                battleState.turn = 'player';
                battleState.phase = 'menu';
                document.getElementById('battle-menu').style.display = 'grid';
                updateBattleUI();
            }, 2000);
        }
    });
}

// Animate attack - simplified without DOM elements since we render on canvas
let attackAnimationState = {
    animating: false,
    who: null,
    frame: 0,
    maxFrames: 6,
    callback: null
};

function animateAttack(who, callback) {
    // Set up animation state
    attackAnimationState.animating = true;
    attackAnimationState.who = who;
    attackAnimationState.frame = 0;
    attackAnimationState.maxFrames = 6;
    attackAnimationState.callback = callback;
}

function updateAttackAnimation() {
    if (!attackAnimationState.animating) return false;
    
    attackAnimationState.frame++;
    if (attackAnimationState.frame > attackAnimationState.maxFrames) {
        attackAnimationState.animating = false;
        if (attackAnimationState.callback) {
            attackAnimationState.callback();
        }
        return false;
    }
    return true;
}

function getAttackAnimationOffset(who) {
    if (!attackAnimationState.animating || attackAnimationState.who !== who) {
        return { x: 0, y: 0 };
    }
    const direction = who === 'player' ? 20 : -20;
    const progress = attackAnimationState.frame / attackAnimationState.maxFrames;
    return {
        x: Math.sin(progress * Math.PI) * direction,
        y: Math.sin(progress * Math.PI) * 10
    };
}

// End battle
let pokecenterSpawnPoint = null;

// Level up function
function levelUpPokemon(pokemon) {
    let leveledUp = false;
    
    while (pokemon.experience >= pokemon.expToNextLevel && pokemon.level < 100) {
        pokemon.experience -= pokemon.expToNextLevel;
        pokemon.level++;
        
        // Recalculate stats with new level
        const hpMultiplier = pokemon.level / 5;
        const statMultiplier = pokemon.level / 50;
        
        const baseData = POKEMON_DATA[pokemon.name.toLowerCase()] || POKEMON_DATA.bulbasaur;
        
        // Calculate new max HP and increase current HP proportionally
        const oldMaxHp = pokemon.maxHp;
        pokemon.maxHp = Math.floor(baseData.maxHp * hpMultiplier);
        pokemon.hp = pokemon.hp + (pokemon.maxHp - oldMaxHp);
        
        pokemon.attack = Math.floor(baseData.attack * (1 + statMultiplier));
        pokemon.defense = Math.floor(baseData.defense * (1 + statMultiplier));
        pokemon.speed = Math.floor(baseData.speed * (1 + statMultiplier));
        
        // Add new moves if available
        const availableMoves = baseData.moves.slice(0, Math.min(4, Math.ceil(pokemon.level / 10) + 1));
        for (const move of availableMoves) {
            if (!pokemon.moves.includes(move)) {
                if (pokemon.moves.length < 4) {
                    pokemon.moves.push(move);
                }
            }
        }
        
        // Calculate new exp to next level
        pokemon.expToNextLevel = Math.floor(100 * Math.pow(pokemon.level, 1.5));
        
        leveledUp = true;
    }
    
    return leveledUp;
}

function endBattle(won, isTrainerBattle = false) {
    // Always ensure battle UI is hidden properly
    const battleUI = document.getElementById('battle-ui');
    const moveSelection = document.getElementById('move-selection');
    if (battleUI) battleUI.classList.remove('active');
    if (moveSelection) moveSelection.classList.remove('active');
    
    if (won) {
        // Gain experience for player's pokemon that participated
        if (battleState.playerPokemon && battleState.enemyPokemon) {
            const expGain = Math.floor(battleState.enemyPokemon.level * 20);
            battleState.playerPokemon.experience += expGain;
            queueBattleMessage(`${battleState.playerPokemon.name} gained ${expGain} EXP!`);
            
            // Check for level up
            const leveledUp = levelUpPokemon(battleState.playerPokemon);
            if (leveledUp) {
                setTimeout(() => {
                    queueBattleMessage(`${battleState.playerPokemon.name} grew to level ${battleState.playerPokemon.level}!`);
                    processBattleMessages();
                }, 500);
            }
        }
        
        // Give money for trainer battles
        if (isTrainerBattle || battleState.trainerBattle) {
            const rewardMoney = Math.floor(100 + Math.random() * 200);
            player.money += rewardMoney;
            setTimeout(() => {
                queueBattleMessage(`Received $${rewardMoney} prize money!`);
                processBattleMessages();
            }, 500);
        }
    } else {
        // Player lost - teleport to pokecenter
        if (pokecenterSpawnPoint) {
            player.x = pokecenterSpawnPoint.x * TILE_SIZE;
            player.y = pokecenterSpawnPoint.y * TILE_SIZE;
            player.currentMap = pokecenterSpawnPoint.map;
            
            // Heal all pokemon
            player.party.forEach(p => {
                p.hp = p.maxHp;
            });
            
            queueBattleMessage('You blacked out and were taken to the Pokemon Center!');
            setTimeout(() => {
                processBattleMessages();
            }, 500);
        }
    }

    currentState = GameState.ROAMING;
    battleState = {
        playerPokemon: null,
        enemyPokemon: null,
        turn: 'player',
        phase: 'menu',
        animating: false,
        wildBattle: true,
        trainerBattle: false,
        trainerName: '',
        messageQueue: [],
        showingMessage: false
    };

    // Clear battle messages and ensure UI state is correct
    setTimeout(() => {
        processBattleMessages();
        // Double check UI is hidden
        const battleUI = document.getElementById('battle-ui');
        const moveSelection = document.getElementById('move-selection');
        if (battleUI) battleUI.classList.remove('active');
        if (moveSelection) moveSelection.classList.remove('active');
    }, 1000);
}

// Render game
function render() {
    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Render main menu if in that state
    if (currentState === GameState.MAIN_MENU) {
        renderMainMenu();
        return;
    }

    const map = maps[player.currentMap];
    if (!map) return;

    // Update camera smoothly
    const targetCameraX = player.x - CANVAS_WIDTH / 2 + TILE_SIZE / 2;
    const targetCameraY = player.y - CANVAS_HEIGHT / 2 + TILE_SIZE / 2;
    
    camera.x += (targetCameraX - camera.x) * camera.smoothness;
    camera.y += (targetCameraY - camera.y) * camera.smoothness;

    // Clamp camera to map bounds
    camera.x = Math.max(0, Math.min(camera.x, map.width * TILE_SIZE - CANVAS_WIDTH));
    camera.y = Math.max(0, Math.min(camera.y, map.height * TILE_SIZE - CANVAS_HEIGHT));

    ctx.save();
    ctx.translate(-Math.floor(camera.x), -Math.floor(camera.y));

    // Draw tiles
    const startTileX = Math.floor(camera.x / TILE_SIZE);
    const startTileY = Math.floor(camera.y / TILE_SIZE);
    const endTileX = Math.min(map.width, startTileX + Math.ceil(CANVAS_WIDTH / TILE_SIZE) + 1);
    const endTileY = Math.min(map.height, startTileY + Math.ceil(CANVAS_HEIGHT / TILE_SIZE) + 1);

    for (let y = startTileY; y < endTileY; y++) {
        for (let x = startTileX; x < endTileX; x++) {
            if (y >= 0 && y < map.height && x >= 0 && x < map.width) {
                const tile = map.tiles[y][x];
                const spriteName = tile.sprite || tile.type;
                
                if (sprites[spriteName]) {
                    ctx.drawImage(sprites[spriteName], x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                } else {
                    // Fallback colored rectangle
                    ctx.fillStyle = getTileColor(tile.type);
                    ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                }
            }
        }
    }

    // Draw objects - handle multi-tile objects properly and ensure tiles are drawn beneath items
    if (map.objects) {
        for (const obj of map.objects) {
            if (obj.sprite && sprites[obj.sprite]) {
                const width = obj.width || 1;
                // For counters and other multi-tile objects, draw across multiple tiles
                ctx.drawImage(sprites[obj.sprite], obj.x * TILE_SIZE, obj.y * TILE_SIZE, TILE_SIZE * width, TILE_SIZE);
            } else if (obj.type === 'item' && obj.item && sprites[obj.item]) {
                // First draw the ground tile beneath the item (grass, sand, dirt-path, etc.)
                const tileX = obj.x;
                const tileY = obj.y;
                if (map.tiles[tileY] && map.tiles[tileY][tileX]) {
                    const tile = map.tiles[tileY][tileX];
                    const spriteName = tile.sprite || tile.type;
                    if (sprites[spriteName]) {
                        ctx.drawImage(sprites[spriteName], tileX * TILE_SIZE, tileY * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                    }
                }
                // Then draw the item centered on its tile, slightly smaller to show the tile beneath
                const itemSprite = sprites[obj.item];
                const offsetX = (TILE_SIZE - itemSprite.width * 0.8) / 2;
                const offsetY = (TILE_SIZE - itemSprite.height * 0.8) / 2;
                ctx.save();
                ctx.translate(obj.x * TILE_SIZE + TILE_SIZE / 2, obj.y * TILE_SIZE + TILE_SIZE / 2);
                ctx.scale(0.8, 0.8);
                ctx.drawImage(itemSprite, -itemSprite.width / 2, -itemSprite.height / 2, itemSprite.width, itemSprite.height);
                ctx.restore();
            }
        }
    }

    // Draw exits with visual indicators (arrows/markers)
    if (map.exits) {
        for (const exit of map.exits) {
            ctx.save();
            ctx.fillStyle = 'rgba(255, 255, 0, 0.6)';
            
            // Draw exit indicator based on direction
            for (let i = 0; i < exit.width; i++) {
                let ex = exit.x + i;
                let ey = exit.y;
                
                // Draw arrow/marker at exit location
                if (exit.direction === 'north') {
                    // Up arrow at top edge
                    ctx.beginPath();
                    ctx.moveTo(ex * TILE_SIZE + TILE_SIZE/2, ey * TILE_SIZE + 8);
                    ctx.lineTo(ex * TILE_SIZE + TILE_SIZE/2 - 8, ey * TILE_SIZE + 20);
                    ctx.lineTo(ex * TILE_SIZE + TILE_SIZE/2 + 8, ey * TILE_SIZE + 20);
                    ctx.closePath();
                    ctx.fill();
                } else if (exit.direction === 'south') {
                    // Down arrow at bottom edge
                    ctx.beginPath();
                    ctx.moveTo(ex * TILE_SIZE + TILE_SIZE/2, ey * TILE_SIZE + TILE_SIZE - 8);
                    ctx.lineTo(ex * TILE_SIZE + TILE_SIZE/2 - 8, ey * TILE_SIZE + TILE_SIZE - 20);
                    ctx.lineTo(ex * TILE_SIZE + TILE_SIZE/2 + 8, ey * TILE_SIZE + TILE_SIZE - 20);
                    ctx.closePath();
                    ctx.fill();
                } else if (exit.direction === 'west') {
                    // Left arrow
                    ctx.beginPath();
                    ctx.moveTo(ex * TILE_SIZE + 8, ey * TILE_SIZE + TILE_SIZE/2);
                    ctx.lineTo(ex * TILE_SIZE + 20, ey * TILE_SIZE + TILE_SIZE/2 - 8);
                    ctx.lineTo(ex * TILE_SIZE + 20, ey * TILE_SIZE + TILE_SIZE/2 + 8);
                    ctx.closePath();
                    ctx.fill();
                } else if (exit.direction === 'east') {
                    // Right arrow
                    ctx.beginPath();
                    ctx.moveTo(ex * TILE_SIZE + TILE_SIZE - 8, ey * TILE_SIZE + TILE_SIZE/2);
                    ctx.lineTo(ex * TILE_SIZE + TILE_SIZE - 20, ey * TILE_SIZE + TILE_SIZE/2 - 8);
                    ctx.lineTo(ex * TILE_SIZE + TILE_SIZE - 20, ey * TILE_SIZE + TILE_SIZE/2 + 8);
                    ctx.closePath();
                    ctx.fill();
                }
            }
            ctx.restore();
        }
    }

    // Draw NPCs
    for (const npc of map.npcs) {
        if (sprites[npc.sprite]) {
            ctx.drawImage(sprites[npc.sprite], npc.x * TILE_SIZE, npc.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }

    // Draw player - use correct sprite for each direction (FIXED: no flipping, use dedicated sprites)
    let playerSpriteName = `player-${player.direction}`;
    if (sprites[playerSpriteName]) {
        const sprite = sprites[playerSpriteName];
        // Draw without any transformation - use the sprite as-is
        ctx.drawImage(sprite, player.x, player.y, TILE_SIZE, TILE_SIZE);
    }

    ctx.restore();

    // Draw battle scene if in battle
    if (currentState === GameState.BATTLE) {
        renderBattle();
    }
}

function getTileColor(type) {
    const colors = {
        'grass': '#4a7c23',
        'water': '#3498db',
        'sand': '#f4d03f',
        'dirt-path': '#8b4513',
        'house-floor': '#deb887',
        'house-wall': '#8b0000'
    };
    return colors[type] || '#808080';
}

// Render battle scene
function renderBattle() {
    // Clear and draw battle background
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#1a252f');
    gradient.addColorStop(1, '#2c3e50');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT - 180);

    // Draw platforms first (behind pokemon)
    if (battleState.enemyPokemon) {
        // Draw enemy platform
        ctx.fillStyle = '#34495e';
        ctx.beginPath();
        ctx.ellipse(550, 200, 100, 30, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    if (battleState.playerPokemon) {
        // Draw player platform
        ctx.fillStyle = '#34495e';
        ctx.beginPath();
        ctx.ellipse(250, 380, 120, 40, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    // Update attack animation
    updateAttackAnimation();

    // Draw pokemon sprites on top of platforms
    if (battleState.enemyPokemon) {
        // Draw enemy pokemon (front sprite, top right)
        const enemySpriteName = battleState.enemyPokemon.frontSprite;
        const enemySprite = sprites[enemySpriteName];
        if (enemySprite) {
            // Get animation offset
            const offset = getAttackAnimationOffset('enemy');
            // Draw the actual sprite scaled appropriately and positioned correctly - slightly smaller
            ctx.save();
            ctx.translate(550 + offset.x, 150 + offset.y);  // Better position - more centered vertically
            ctx.scale(1.2, 1.2);      // Smaller scale for better visibility
            ctx.drawImage(enemySprite, -enemySprite.width / 2, -enemySprite.height / 2, enemySprite.width, enemySprite.height);
            ctx.restore();
        }
    }

    if (battleState.playerPokemon) {
        // Draw player pokemon (back sprite, bottom left)
        const playerSpriteName = battleState.playerPokemon.backSprite;
        const playerSprite = sprites[playerSpriteName];
        if (playerSprite) {
            // Get animation offset
            const offset = getAttackAnimationOffset('player');
            // Draw the actual sprite scaled appropriately and positioned correctly - slightly smaller
            ctx.save();
            ctx.translate(250 + offset.x, 350 + offset.y);  // Better position - above UI area
            ctx.scale(1.2, 1.2);      // Smaller scale for better visibility
            ctx.drawImage(playerSprite, -playerSprite.width / 2, -playerSprite.height / 2, playerSprite.width, playerSprite.height);
            ctx.restore();
        }
    }
}

// Handle input
function handleInput() {
    // Handle main menu state
    if (currentState === GameState.MAIN_MENU) {
        if (keys.Enter || keys.Space) {
            keys.Enter = false;
            keys.Space = false;
            // Start the game and play music
            currentState = GameState.ROAMING;
            playMusic('town');
        }
        return;
    }

    if (currentState === GameState.BATTLE) {
        return;
    }

    if (currentState === GameState.DIALOGUE) {
        if (keys.Enter || keys.Space) {
            keys.Enter = false;
            keys.Space = false;
            showNextDialogueLine();
        }
        return;
    }

    if (player.moving) {
        // Continue movement animation
        player.moveProgress += player.speed;
        
        if (player.moveProgress >= 1) {
            player.moving = false;
            player.x = player.targetX;
            player.y = player.targetY;
            player.moveProgress = 0;
            
            // Check for encounters after movement
            checkEncounter();
            
            // Check for exits
            checkExits();
        } else {
            // Interpolate position
            player.x = player.startX + (player.targetX - player.startX) * player.moveProgress;
            player.y = player.startY + (player.targetY - player.startY) * player.moveProgress;
        }
        return;
    }

    let dx = 0;
    let dy = 0;
    let newDirection = player.direction;

    if (keys.ArrowUp || keys.w) {
        dy = -TILE_SIZE;
        newDirection = 'up';
    } else if (keys.ArrowDown || keys.s) {
        dy = TILE_SIZE;
        newDirection = 'down';
    } else if (keys.ArrowLeft || keys.a) {
        dx = -TILE_SIZE;
        newDirection = 'left';
    } else if (keys.ArrowRight || keys.d) {
        dx = TILE_SIZE;
        newDirection = 'right';
    }

    if (dx !== 0 || dy !== 0) {
        // Swap left and right sprites as requested
        if (newDirection === 'left') {
            player.direction = 'right';  // Use right sprite when moving left
        } else if (newDirection === 'right') {
            player.direction = 'left';   // Use left sprite when moving right
        } else {
            player.direction = newDirection;
        }
        
        const newX = player.x + dx;
        const newY = player.y + dy;

        if (!checkCollision(newX, newY)) {
            player.moving = true;
            player.startX = player.x;
            player.startY = player.y;
            player.targetX = newX;
            player.targetY = newY;
            player.moveProgress = 0;
        }
    }

    // Interaction button
    if (keys.Enter || keys.Space) {
        keys.Enter = false;
        keys.Space = false;
        handleInteraction();
    }
}

// Handle interaction
function handleInteraction() {
    // Check for door first
    const doorObj = checkObjectInteraction();
    if (doorObj && doorObj.type === 'door') {
        transitionToMap(doorObj.destination, doorObj.destX, doorObj.destY);
        return;
    }

    // Check for interactable objects
    const obj = checkObjectInteraction();
    if (obj) {
        if (obj.type === 'item') {
            // Pick up item
            const map = maps[player.currentMap];
            map.objects = map.objects.filter(o => o !== obj);
            
            if (obj.item === 'potion') {
                player.inventory.potions++;
                showDialogue('Item', [`You found a Potion!`, `Added to your bag.`]);
            } else if (obj.item === 'pokeball') {
                player.inventory.pokeballs++;
                showDialogue('Item', [`You found a Poke Ball!`, `Added to your bag.`]);
            } else if (obj.item === 'berry') {
                player.inventory.berries++;
                showDialogue('Item', [`You found a Berry!`, `Added to your bag.`]);
            }
            return;
        }
        
        if (obj.type === 'interactable') {
            if (obj.action === 'heal') {
                // Heal all pokemon
                player.party.forEach(p => {
                    p.hp = p.maxHp;
                });
                showDialogue(obj.name, obj.dialogue);
            } else {
                showDialogue(obj.name, obj.dialogue);
            }
            return;
        }
    }

    // Check for NPCs
    const npc = checkNPCInteraction();
    if (npc) {
        if (npc.battle) {
            // Start trainer battle - only if player has pokemon
            if (player.party.length > 0) {
                startBattle(npc.battle.pokemon, npc.battle.pokemon.map(() => npc.battle.level), true, npc.name);
            } else {
                showDialogue(npc.name, [...npc.dialogue, 'But you have no Pokemon!']);
            }
        } else if (npc.givesStarter && !starterGiven) {
            // Give starter pokemon - only once per game
            if (player.party.length === 0) {
                // Show full dialogue sequence with starter selection
                showDialogue(npc.name, [
                    "Welcome to my lab!",
                    "I am Professor Oak, the Pokemon researcher.",
                    "Are you ready to begin your journey?",
                    "You need a Pokemon partner for your adventure.",
                    "Choose wisely - this Pokemon will be with you throughout your journey!",
                    "",
                    "Which Pokemon do you choose?",
                    "Press 1 for Bulbasaur (Grass type)",
                    "Press 2 for Charmander (Fire type)", 
                    "Press 3 for Squirtle (Water type)"
                ]);
            } else {
                showDialogue(npc.name, ['You already have a Pokemon!', 'Take care of it on your journey!']);
            }
        } else if (npc.givesStarter && starterGiven) {
            showDialogue(npc.name, ['Your journey has begun!', 'Go explore the world with your Pokemon!']);
        } else if (npc.shop) {
            // Open shop interface
            openShop(npc);
            return;
        } else {
            showDialogue(npc.name, npc.dialogue);
        }
        return;
    }
}

// Check for wild encounters
function checkEncounter() {
    const map = maps[player.currentMap];
    if (!map || map.encounterRate === 0) return;

    // Only allow encounters if player has pokemon
    if (player.party.length === 0) return;

    // Check if standing in grass
    const tileX = Math.floor(player.x / TILE_SIZE);
    const tileY = Math.floor(player.y / TILE_SIZE);
    
    if (tileX >= 0 && tileX < map.width && tileY >= 0 && tileY < map.height) {
        const tile = map.tiles[tileY][tileX];
        // Check for grass tiles or grass objects
        if (tile.type === 'grass' || tile.sprite === 'grass' || tile.isGrass) {
            if (Math.random() < map.encounterRate) {
                // Wild encounter!
                const wildPokemon = map.wildPokemon.length > 0 ? 
                    map.wildPokemon : ['pikachu', 'magikarp'];
                const level = Math.floor(3 + Math.random() * 4);
                startBattle(wildPokemon, [level], false);
            }
        }
    }
}

// Show move selection
function showMoveSelection() {
    const moveSelection = document.getElementById('move-selection');
    moveSelection.innerHTML = '';
    
    if (!battleState.playerPokemon) return;

    battleState.playerPokemon.moves.forEach((moveName, index) => {
        const move = MOVE_DATA[moveName];
        if (!move) return;

        const btn = document.createElement('button');
        btn.className = 'move-btn';
        btn.innerHTML = `
            <div>${moveName}</div>
            <div class="move-pp">PP: ${move.pp}/${move.pp} | ${move.type}</div>
        `;
        btn.onclick = () => {
            moveSelection.classList.remove('active');
            document.getElementById('battle-menu').style.display = 'none';
            executePlayerMove(moveName);
        };
        moveSelection.appendChild(btn);
    });

    moveSelection.classList.add('active');
}

// Use item from bag
function useItem(itemType) {
    if (itemType === 'potion' && player.inventory.potions > 0) {
        if (battleState.playerPokemon && battleState.playerPokemon.hp < battleState.playerPokemon.maxHp) {
            player.inventory.potions--;
            battleState.playerPokemon.hp = Math.min(
                battleState.playerPokemon.maxHp,
                battleState.playerPokemon.hp + 20
            );
            updateBattleUI();
            queueBattleMessage(`Used Potion! Restored HP.`);
            processBattleMessages();
            
            // End player turn
            document.getElementById('battle-menu').style.display = 'none';
            setTimeout(() => {
                battleState.turn = 'enemy';
                enemyTurn();
            }, 1000);
        } else {
            queueBattleMessage('HP is already full!');
            processBattleMessages();
        }
    } else if (itemType === 'pokeball' && player.inventory.pokeballs > 0 && battleState.wildBattle) {
        player.inventory.pokeballs--;
        
        // Catch chance based on HP
        const catchChance = 1 - (battleState.enemyPokemon.hp / battleState.enemyPokemon.maxHp) * 0.5;
        
        queueBattleMessage(`Threw Poke Ball!`);
        processBattleMessages();

        setTimeout(() => {
            if (Math.random() < catchChance) {
                queueBattleMessage(`Gotcha! ${battleState.enemyPokemon.name} was caught!`);
                processBattleMessages();
                
                // Add to party - create a fresh copy with full HP and reset experience
                const caughtPokemon = {
                    ...battleState.enemyPokemon,
                    hp: battleState.enemyPokemon.maxHp,
                    experience: 0,
                    expToNextLevel: Math.floor(100 * Math.pow(battleState.enemyPokemon.level, 1.5))
                };
                player.party.push(caughtPokemon);
                
                setTimeout(() => {
                    endBattle(true, false);
                }, 2000);
            } else {
                queueBattleMessage(`Darn! The Pokemon broke free!`);
                processBattleMessages();
                
                setTimeout(() => {
                    battleState.turn = 'enemy';
                    enemyTurn();
                }, 1000);
            }
        }, 1500);
    } else if (itemType === 'berry' && player.inventory.berries > 0) {
        if (battleState.playerPokemon && battleState.playerPokemon.hp < battleState.playerPokemon.maxHp) {
            player.inventory.berries--;
            battleState.playerPokemon.hp = Math.min(
                battleState.playerPokemon.maxHp,
                battleState.playerPokemon.hp + 10
            );
            updateBattleUI();
            queueBattleMessage(`Used Berry! Restored some HP.`);
            processBattleMessages();
            
            document.getElementById('battle-menu').style.display = 'none';
            setTimeout(() => {
                battleState.turn = 'enemy';
                enemyTurn();
            }, 1000);
        }
    }
}

// Run from battle
function runFromBattle() {
    if (battleState.trainerBattle) {
        queueBattleMessage("Can't run from a trainer battle!");
        processBattleMessages();
        setTimeout(() => {
            battleState.turn = 'enemy';
            enemyTurn();
        }, 1000);
        return;
    }

    const playerSpeed = battleState.playerPokemon.speed;
    const enemySpeed = battleState.enemyPokemon.speed;
    
    if (Math.random() < 0.5 || playerSpeed > enemySpeed) {
        queueBattleMessage('Got away safely!');
        processBattleMessages();
        setTimeout(() => {
            // End battle without teleporting - just return to roaming
            document.getElementById('battle-ui').classList.remove('active');
            document.getElementById('move-selection').classList.remove('active');
            currentState = GameState.ROAMING;
            battleState = {
                playerPokemon: null,
                enemyPokemon: null,
                turn: 'player',
                phase: 'menu',
                animating: false,
                wildBattle: true,
                trainerBattle: false,
                trainerName: '',
                messageQueue: [],
                showingMessage: false
            };
            setTimeout(() => {
                processBattleMessages();
            }, 500);
        }, 1500);
    } else {
        queueBattleMessage("Can't escape!");
        processBattleMessages();
        setTimeout(() => {
            battleState.turn = 'enemy';
            enemyTurn();
        }, 1000);
    }
}

// Toggle inventory
function toggleInventory() {
    const panel = document.getElementById('inventory-panel');
    const grid = document.getElementById('inventory-grid');
    
    if (panel.classList.contains('active')) {
        panel.classList.remove('active');
        if (currentState === GameState.BATTLE) {
            return;
        }
        currentState = GameState.ROAMING;
    } else {
        // Populate inventory
        grid.innerHTML = '';
        
        const items = [
            { key: 'potion', name: 'Potion', count: player.inventory.potions, sprite: 'potion', desc: 'Restores 20 HP' },
            { key: 'pokeball', name: 'Poke Ball', count: player.inventory.pokeballs, sprite: 'pokeball', desc: 'Catches wild Pokemon' },
            { key: 'berry', name: 'Berry', count: player.inventory.berries, sprite: 'berry', desc: 'Restores 10 HP' }
        ];

        items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'inventory-item';
            div.innerHTML = `
                ${sprites[item.sprite] ? `<img src="${item.sprite}.png" alt="${item.name}">` : '📦'}
                <div class="inventory-item-count">${item.name} x${item.count}</div>
                <div style="font-size: 8px; margin-top: 3px;">${item.desc}</div>
            `;
            div.onclick = () => {
                if (currentState === GameState.BATTLE && item.key !== 'pokeball') {
                    useItem(item.key);
                    panel.classList.remove('active');
                } else if (currentState === GameState.ROAMING && item.key === 'potion') {
                    // Use potion outside battle
                    if (player.inventory.potions > 0 && player.party.length > 0) {
                        player.inventory.potions--;
                        player.party[0].hp = Math.min(player.party[0].maxHp, player.party[0].hp + 20);
                        updateBattleUI();
                        alert(`Used Potion on ${player.party[0].name}!`);
                        toggleInventory();
                    }
                }
            };
            grid.appendChild(div);
        });

        panel.classList.add('active');
        if (currentState === GameState.ROAMING) {
            currentState = GameState.MENU;
        }
    }
}

// Toggle party view
function toggleParty() {
    const panel = document.getElementById('party-panel');
    const grid = document.getElementById('party-grid');
    
    if (panel.classList.contains('active')) {
        panel.classList.remove('active');
    } else {
        // Populate party
        grid.innerHTML = '';
        
        if (player.party.length === 0) {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 20px;">No Pokemon yet!</div>';
        } else {
            player.party.forEach((pokemon, index) => {
                const div = document.createElement('div');
                div.className = 'party-member' + (pokemon.hp <= 0 ? ' fainted' : '');
                
                const hpPercent = (pokemon.hp / pokemon.maxHp) * 100;
                
                div.innerHTML = `
                    ${sprites[pokemon.backSprite] ? `<img src="${pokemon.backSprite}.png" class="party-sprite" alt="${pokemon.name}">` : '❓'}
                    <div class="party-info">
                        <div class="party-name">${pokemon.name}</div>
                        <div class="party-hp">Lv.${pokemon.level}</div>
                        <div class="party-hp-bar">
                            <div class="party-hp-fill" style="width: ${hpPercent}%"></div>
                        </div>
                        <div style="font-size: 8px;">${pokemon.hp}/${pokemon.maxHp} HP</div>
                    </div>
                `;
                grid.appendChild(div);
            });
        }

        panel.classList.add('active');
    }
}

// Shop system
let currentShopNPC = null;

function openShop(npc) {
    currentShopNPC = npc;
    currentState = GameState.MENU;
    
    const shopPanel = document.getElementById('shop-panel');
    const shopGrid = document.getElementById('shop-grid');
    const shopMoney = document.getElementById('shop-money');
    
    if (!shopPanel) {
        console.error('Shop panel not found in HTML');
        return;
    }
    
    shopMoney.textContent = `$${player.money}`;
    shopGrid.innerHTML = '';
    
    const shopItems = [
        { key: 'potion', name: 'Potion', price: 100, sprite: 'potion', desc: 'Restores 20 HP' },
        { key: 'pokeball', name: 'Poke Ball', price: 200, sprite: 'pokeball', desc: 'Catches wild Pokemon' },
        { key: 'berry', name: 'Berry', price: 50, sprite: 'berry', desc: 'Restores 10 HP' },
        { key: 'super_potion', name: 'Super Potion', price: 250, sprite: 'potion', desc: 'Restores 50 HP' }
    ];
    
    shopItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'inventory-item';
        div.innerHTML = `
            ${sprites[item.sprite] ? `<img src="${item.sprite}.png" alt="${item.name}">` : '📦'}
            <div class="inventory-item-count">${item.name}</div>
            <div style="font-size: 9px; color: #f39c12; margin-top: 3px;">$${item.price}</div>
            <div style="font-size: 7px; margin-top: 2px;">${item.desc}</div>
        `;
        div.onclick = () => buyItem(item);
        shopGrid.appendChild(div);
    });
    
    shopPanel.classList.add('active');
}

function buyItem(item) {
    let price = 0;
    let itemType = '';
    
    if (item.key === 'potion') {
        price = 100;
        itemType = 'potions';
    } else if (item.key === 'pokeball') {
        price = 200;
        itemType = 'pokeballs';
    } else if (item.key === 'berry') {
        price = 50;
        itemType = 'berries';
    } else if (item.key === 'super_potion') {
        price = 250;
        itemType = 'potions';
    }
    
    if (player.money >= price) {
        player.money -= price;
        player.inventory[itemType]++;
        document.getElementById('shop-money').textContent = `$${player.money}`;
        
        // Show confirmation
        const shopPanel = document.getElementById('shop-panel');
        const confirmMsg = document.createElement('div');
        confirmMsg.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 20px 40px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 400;
            text-align: center;
        `;
        confirmMsg.textContent = `Bought ${item.name}!`;
        shopPanel.appendChild(confirmMsg);
        
        setTimeout(() => {
            confirmMsg.remove();
        }, 1000);
    } else {
        // Not enough money
        const shopPanel = document.getElementById('shop-panel');
        const errorMsg = document.createElement('div');
        errorMsg.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.9);
            color: #e74c3c;
            padding: 20px 40px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 400;
            text-align: center;
        `;
        errorMsg.textContent = 'Not enough money!';
        shopPanel.appendChild(errorMsg);
        
        setTimeout(() => {
            errorMsg.remove();
        }, 1000);
    }
}

function closeShop() {
    const shopPanel = document.getElementById('shop-panel');
    shopPanel.classList.remove('active');
    currentShopNPC = null;
    currentState = GameState.ROAMING;
}

// Battle UI event handlers
document.getElementById('battle-menu').addEventListener('click', (e) => {
    if (battleState.phase !== 'menu' || battleState.turn !== 'player') return;

    const action = e.target.dataset.action;
    
    if (action === 'fight') {
        document.getElementById('battle-menu').style.display = 'none';
        showMoveSelection();
    } else if (action === 'bag') {
        toggleInventory();
    } else if (action === 'pokemon') {
        toggleParty();
    } else if (action === 'run') {
        runFromBattle();
    }
});

// Keyboard events
window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key) || keys.hasOwnProperty(e.code)) {
        keys[e.key] = true;
    }
    
    // Number keys for starter selection
    if (currentState === GameState.DIALOGUE) {
        if (e.key === '1') {
            giveStarter('bulbasaur');
        } else if (e.key === '2') {
            giveStarter('charmander');
        } else if (e.key === '3') {
            giveStarter('squirtle');
        }
    }
    
    // Escape to close menus
    if (e.key === 'Escape') {
        document.getElementById('inventory-panel').classList.remove('active');
        document.getElementById('party-panel').classList.remove('active');
        if (currentState === GameState.MENU) {
            currentState = GameState.ROAMING;
        }
    }
});

window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;
    }
});

// Give starter pokemon
function giveStarter(pokemonKey) {
    if (starterGiven || player.party.length > 0) return; // Prevent duplicate
    
    const pokemonData = POKEMON_DATA[pokemonKey];
    if (!pokemonData) return;

    const newPokemon = createPokemon(pokemonKey, 5);
    if (!newPokemon) {
        // Fallback to bulbasaur if creation fails
        newPokemon = {
            ...pokemonData,
            level: 5,
            hp: pokemonData.maxHp,
            maxHp: pokemonData.maxHp,
            experience: 0,
            expToNextLevel: Math.floor(100 * Math.pow(5, 1.5))
        };
    }

    player.party.push(newPokemon);
    starterGiven = true; // Mark starter as given
    
    closeDialogue();
    
    showDialogue('Prof. Oak', [
        `Excellent choice!`,
        `${pokemonData.name} is a wonderful partner.`,
        `Now go out and explore the world!`
    ]);
}

// Initialize game - start with main menu instead of直接进入游戏
async function init() {
    await loadSprites();
    
    // Initialize starting map (in background)
    initializeMap('pallet-town');
    
    // Set player position
    player.x = 10 * TILE_SIZE;
    player.y = 7 * TILE_SIZE;
    player.currentMap = 'pallet-town';
    
    // Show welcome message
    setTimeout(() => {
        showLocationName('Pallet Town');
    }, 1000);

    // Setup inventory button
    document.getElementById('inventory-btn').onclick = toggleInventory;
    
    // Add click listener to enable audio context on first interaction
    document.addEventListener('click', () => {
        if (currentMusic && currentMusic.paused) {
            playMusic(getMusicForMap(player.currentMap));
        }
    }, { once: true });

    // Start in main menu state
    currentState = GameState.MAIN_MENU;
    
    // Start game loop
    gameLoop();
}

// Game loop
function gameLoop() {
    handleInput();
    render();
    requestAnimationFrame(gameLoop);
}

// Start the game
init();

console.log('Pokemon Adventure - Kanto Quest initialized!');
console.log('Controls: Arrow Keys or WASD to move, Enter/Space to interact');
console.log('Battle: Click Fight/Bag/Pokemon/Run buttons');
