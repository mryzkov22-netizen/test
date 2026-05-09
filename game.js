// Pokemon Adventure Game
// A fully functioning 2D pixelart Pokemon game

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.TILE_SIZE = 48;
        this.MAP_WIDTH = 20;
        this.MAP_HEIGHT = 15;
        
        // Game state
        this.currentState = 'ROAMING'; // ROAMING, BATTLE, DIALOG, HOUSE
        this.currentMap = 'pallet-town';
        this.currentHouse = null;
        
        // Player
        this.player = {
            x: 10,
            y: 7,
            direction: 'down',
            isMoving: false,
            moveProgress: 0,
            fromX: 10,
            fromY: 7,
            toX: 10,
            toY: 7,
            speed: 0.15
        };
        
        // Player's Pokemon team
        this.pokemonTeam = [];
        this.items = {
            pokeballs: 5,
            potions: 3
        };
        
        // Sprites cache
        this.sprites = {};
        this.spriteCache = {};
        
        // Input handling
        this.keys = {};
        this.lastKeyTime = 0;
        this.keyDelay = 150; // ms between key presses
        
        // NPCs and trainers
        this.npcs = [];
        this.trainers = [];
        
        // Interactive objects
        this.interactables = [];
        
        // Maps data
        this.maps = {};
        
        // Battle system
        this.battle = null;
        
        // Load all data
        this.init();
    }
    
    async init() {
        await this.loadSprites();
        this.setupMaps();
        this.setupNPCs();
        this.setupTrainers();
        this.setupInteractables();
        this.setupStarterPokemon();
        this.setupEventListeners();
        this.gameLoop();
    }
    
    async loadSprites() {
        const spriteNames = [
            // Player
            'player-down', 'player-up', 'player-left', 'player-right',
            // NPCs
            'npc-down', 'trainer-down',
            // Items
            'pokeball', 'potion', 'berry',
            // Tiles
            'grass', 'dirt-path', 'water', 'tree', 'house-floor', 'house-wall', 
            'door', 'counter', 'pc', 'bookshelf', 'flower', 'rock', 'sand', 'bridge',
            // Pokemon fronts
            'bulbasaur-front', 'charmander-front', 'squirtle-front', 'pikachu-front',
            'jigglypuff-front', 'geodude-front', 'magikarp-front', 'psyduck-front',
            'machop-front', 'gastly-front',
            // Pokemon backs
            'bulbasaur-back', 'charmander-back', 'squirtle-back', 'pikachu-back',
            'jigglypuff-back', 'geodude-back', 'magikarp-back', 'psyduck-back',
            'machop-back', 'gastly-back'
        ];
        
        const promises = spriteNames.map(name => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    this.sprites[name] = img;
                    resolve();
                };
                img.onerror = () => {
                    console.warn(`Failed to load sprite: ${name}`);
                    resolve(); // Continue even if sprite fails
                };
                img.src = `${name}.png`;
            });
        });
        
        await Promise.all(promises);
        console.log('All sprites loaded');
    }
    
    setupMaps() {
        // Pallet Town - Starting town with grassy paths and houses
        this.maps['pallet-town'] = {
            name: 'Pallet Town',
            width: 20,
            height: 15,
            tiles: [],
            houses: [
                { x: 2, y: 2, width: 5, height: 4, doorX: 4, doorY: 5, interior: 'house-1' },
                { x: 13, y: 2, width: 5, height: 4, doorX: 15, doorY: 5, interior: 'house-2' },
                { x: 8, y: 10, width: 4, height: 3, doorX: 9, doorY: 12, interior: 'lab' }
            ],
            warps: [
                { x: 10, y: 14, targetMap: 'route-1', targetX: 10, targetY: 0 }
            ]
        };
        
        // Generate Pallet Town tiles
        this.generateTownMap('pallet-town', 'grass');
        
        // Route 1 - Path between towns
        this.maps['route-1'] = {
            name: 'Route 1',
            width: 20,
            height: 15,
            tiles: [],
            houses: [],
            warps: [
                { x: 10, y: 0, targetMap: 'pallet-town', targetX: 10, targetY: 14 },
                { x: 10, y: 14, targetMap: 'viridian-city', targetX: 10, targetY: 0 }
            ]
        };
        
        // Generate Route 1 tiles
        this.generateRouteMap('route-1');
        
        // Viridian City - Larger city with different aesthetic
        this.maps['viridian-city'] = {
            name: 'Viridian City',
            width: 20,
            height: 15,
            tiles: [],
            houses: [
                { x: 3, y: 3, width: 6, height: 5, doorX: 5, doorY: 7, interior: 'mart' },
                { x: 12, y: 3, width: 6, height: 5, doorX: 14, doorY: 7, interior: 'center' },
                { x: 8, y: 9, width: 5, height: 4, doorX: 10, doorY: 12, interior: 'gym-house' }
            ],
            warps: [
                { x: 10, y: 0, targetMap: 'route-1', targetX: 10, targetY: 14 },
                { x: 0, y: 7, targetMap: 'route-22', targetX: 19, targetY: 7 }
            ]
        };
        
        // Generate Viridian City tiles
        this.generateCityMap('viridian-city');
        
        // Route 22 - Forest path
        this.maps['route-22'] = {
            name: 'Route 22',
            width: 20,
            height: 15,
            tiles: [],
            houses: [],
            warps: [
                { x: 19, y: 7, targetMap: 'viridian-city', targetX: 0, targetY: 7 },
                { x: 0, y: 7, targetMap: 'pewter-city', targetX: 19, targetY: 7 }
            ]
        };
        
        // Generate Route 22 tiles
        this.generateForestRouteMap('route-22');
        
        // Pewter City - Rocky mountain town
        this.maps['pewter-city'] = {
            name: 'Pewter City',
            width: 20,
            height: 15,
            tiles: [],
            houses: [
                { x: 4, y: 4, width: 5, height: 4, doorX: 6, doorY: 7, interior: 'museum' },
                { x: 13, y: 8, width: 5, height: 4, doorX: 15, doorY: 11, interior: 'gym' }
            ],
            warps: [
                { x: 19, y: 7, targetMap: 'route-22', targetX: 0, targetY: 7 }
            ]
        };
        
        // Generate Pewter City tiles
        this.generateMountainCityMap('pewter-city');
        
        // House interiors
        this.setupHouseInteriors();
    }
    
    generateTownMap(mapName, baseTile = 'grass') {
        const map = this.maps[mapName];
        map.tiles = [];
        
        for (let y = 0; y < map.height; y++) {
            map.tiles[y] = [];
            for (let x = 0; x < map.width; x++) {
                // Default to grass
                map.tiles[y][x] = baseTile;
                
                // Add dirt paths
                if (y === 7 || x === 10) {
                    map.tiles[y][x] = 'dirt-path';
                }
                
                // Add some decorative elements
                if ((x === 0 || x === map.width - 1 || y === 0 || y === map.height - 1) && 
                    map.tiles[y][x] !== 'dirt-path') {
                    if (Math.random() < 0.3) {
                        map.tiles[y][x] = 'flower';
                    }
                }
            }
        }
        
        // Clear areas for houses
        map.houses.forEach(house => {
            for (let hy = house.y; hy < house.y + house.height; hy++) {
                for (let hx = house.x; hx < house.x + house.width; hx++) {
                    if (hy < map.height && hx < map.width) {
                        map.tiles[hy][hx] = 'dirt-path';
                    }
                }
            }
        });
    }
    
    generateRouteMap(mapName) {
        const map = this.maps[mapName];
        map.tiles = [];
        
        for (let y = 0; y < map.height; y++) {
            map.tiles[y] = [];
            for (let x = 0; x < map.width; x++) {
                map.tiles[y][x] = 'grass';
                
                // Main path down the center
                if (x >= 8 && x <= 11) {
                    map.tiles[y][x] = 'dirt-path';
                }
                
                // Random trees on sides
                if ((x < 6 || x > 13) && Math.random() < 0.15) {
                    map.tiles[y][x] = 'tree';
                }
                
                // Some rocks
                if ((x < 6 || x > 13) && Math.random() < 0.05) {
                    map.tiles[y][x] = 'rock';
                }
            }
        }
    }
    
    generateCityMap(mapName) {
        const map = this.maps[mapName];
        map.tiles = [];
        
        for (let y = 0; y < map.height; y++) {
            map.tiles[y] = [];
            for (let x = 0; x < map.width; x++) {
                map.tiles[y][x] = 'dirt-path';
                
                // Buildings areas
                if ((y >= 2 && y <= 6 && x >= 2 && x <= 7) ||
                    (y >= 2 && y <= 6 && x >= 11 && x <= 16) ||
                    (y >= 8 && y <= 11 && x >= 7 && x <= 11)) {
                    map.tiles[y][x] = 'dirt-path';
                }
                
                // Decorative flowers
                if (Math.random() < 0.08 && map.tiles[y][x] === 'dirt-path') {
                    map.tiles[y][x] = 'flower';
                }
            }
        }
    }
    
    generateForestRouteMap(mapName) {
        const map = this.maps[mapName];
        map.tiles = [];
        
        for (let y = 0; y < map.height; y++) {
            map.tiles[y] = [];
            for (let x = 0; x < map.width; x++) {
                map.tiles[y][x] = 'grass';
                
                // Winding path
                const pathOffset = Math.floor(Math.sin(y * 0.5) * 3);
                if (x >= 7 + pathOffset && x <= 10 + pathOffset) {
                    map.tiles[y][x] = 'dirt-path';
                }
                
                // More trees in forest
                if (map.tiles[y][x] === 'grass' && Math.random() < 0.2) {
                    map.tiles[y][x] = 'tree';
                }
            }
        }
    }
    
    generateMountainCityMap(mapName) {
        const map = this.maps[mapName];
        map.tiles = [];
        
        for (let y = 0; y < map.height; y++) {
            map.tiles[y] = [];
            for (let x = 0; x < map.width; x++) {
                map.tiles[y][x] = 'sand';
                
                // Rocky areas
                if (Math.random() < 0.1) {
                    map.tiles[y][x] = 'rock';
                }
                
                // Paths
                if (y === 7 || x === 10) {
                    map.tiles[y][x] = 'dirt-path';
                }
            }
        }
    }
    
    setupHouseInteriors() {
        // House 1 - Cozy home
        this.maps['house-1'] = {
            name: 'Home',
            width: 10,
            height: 8,
            tiles: [],
            isInterior: true,
            exitX: 4,
            exitY: 7
        };
        
        for (let y = 0; y < 8; y++) {
            this.maps['house-1'].tiles[y] = [];
            for (let x = 0; x < 10; x++) {
                this.maps['house-1'].tiles[y][x] = 'house-floor';
            }
        }
        
        // Add furniture
        this.maps['house-1'].tiles[1][2] = 'bookshelf';
        this.maps['house-1'].tiles[1][3] = 'bookshelf';
        this.maps['house-1'].tiles[1][7] = 'pc';
        this.maps['house-1'].tiles[5][1] = 'counter';
        this.maps['house-1'].tiles[5][2] = 'counter';
        
        // House 2 - Modern home
        this.maps['house-2'] = {
            name: 'Home',
            width: 10,
            height: 8,
            tiles: [],
            isInterior: true,
            exitX: 4,
            exitY: 7
        };
        
        for (let y = 0; y < 8; y++) {
            this.maps['house-2'].tiles[y] = [];
            for (let x = 0; x < 10; x++) {
                this.maps['house-2'].tiles[y][x] = 'house-floor';
            }
        }
        
        this.maps['house-2'].tiles[1][1] = 'pc';
        this.maps['house-2'].tiles[1][8] = 'bookshelf';
        this.maps['house-2'].tiles[1][9] = 'bookshelf';
        this.maps['house-2'].tiles[6][4] = 'counter';
        this.maps['house-2'].tiles[6][5] = 'counter';
        
        // Lab
        this.maps['lab'] = {
            name: 'Pokemon Lab',
            width: 10,
            height: 8,
            tiles: [],
            isInterior: true,
            exitX: 4,
            exitY: 7
        };
        
        for (let y = 0; y < 8; y++) {
            this.maps['lab'].tiles[y] = [];
            for (let x = 0; x < 10; x++) {
                this.maps['lab'].tiles[y][x] = 'house-floor';
            }
        }
        
        this.maps['lab'].tiles[2][3] = 'pc';
        this.maps['lab'].tiles[2][4] = 'pc';
        this.maps['lab'].tiles[2][5] = 'pc';
        this.maps['lab'].tiles[5][1] = 'counter';
        this.maps['lab'].tiles[5][2] = 'counter';
        this.maps['lab'].tiles[5][7] = 'counter';
        this.maps['lab'].tiles[5][8] = 'counter';
        
        // Mart
        this.maps['mart'] = {
            name: 'PokéMart',
            width: 12,
            height: 10,
            tiles: [],
            isInterior: true,
            exitX: 5,
            exitY: 9
        };
        
        for (let y = 0; y < 10; y++) {
            this.maps['mart'].tiles[y] = [];
            for (let x = 0; x < 12; x++) {
                this.maps['mart'].tiles[y][x] = 'house-floor';
            }
        }
        
        for (let x = 1; x <= 10; x++) {
            this.maps['mart'].tiles[2][x] = 'counter';
        }
        
        // Center
        this.maps['center'] = {
            name: 'Pokémon Center',
            width: 12,
            height: 10,
            tiles: [],
            isInterior: true,
            exitX: 5,
            exitY: 9
        };
        
        for (let y = 0; y < 10; y++) {
            this.maps['center'].tiles[y] = [];
            for (let x = 0; x < 12; x++) {
                this.maps['center'].tiles[y][x] = 'house-floor';
            }
        }
        
        this.maps['center'].tiles[2][5] = 'pc';
        this.maps['center'].tiles[2][6] = 'pc';
        this.maps['center'].tiles[6][1] = 'counter';
        this.maps['center'].tiles[6][2] = 'counter';
        this.maps['center'].tiles[6][9] = 'counter';
        this.maps['center'].tiles[6][10] = 'counter';
        
        // Gym House
        this.maps['gym-house'] = {
            name: 'House',
            width: 10,
            height: 8,
            tiles: [],
            isInterior: true,
            exitX: 4,
            exitY: 7
        };
        
        for (let y = 0; y < 8; y++) {
            this.maps['gym-house'].tiles[y] = [];
            for (let x = 0; x < 10; x++) {
                this.maps['gym-house'].tiles[y][x] = 'house-floor';
            }
        }
        
        this.maps['gym-house'].tiles[3][4] = 'bookshelf';
        this.maps['gym-house'].tiles[3][5] = 'bookshelf';
        
        // Museum
        this.maps['museum'] = {
            name: 'Museum',
            width: 12,
            height: 10,
            tiles: [],
            isInterior: true,
            exitX: 5,
            exitY: 9
        };
        
        for (let y = 0; y < 10; y++) {
            this.maps['museum'].tiles[y] = [];
            for (let x = 0; x < 12; x++) {
                this.maps['museum'].tiles[y][x] = 'house-floor';
            }
        }
        
        this.maps['museum'].tiles[3][2] = 'bookshelf';
        this.maps['museum'].tiles[3][3] = 'bookshelf';
        this.maps['museum'].tiles[3][8] = 'bookshelf';
        this.maps['museum'].tiles[3][9] = 'bookshelf';
        this.maps['museum'].tiles[6][5] = 'counter';
        this.maps['museum'].tiles[6][6] = 'counter';
        
        // Gym
        this.maps['gym'] = {
            name: 'Gym',
            width: 12,
            height: 10,
            tiles: [],
            isInterior: true,
            exitX: 5,
            exitY: 9
        };
        
        for (let y = 0; y < 10; y++) {
            this.maps['gym'].tiles[y] = [];
            for (let x = 0; x < 12; x++) {
                this.maps['gym'].tiles[y][x] = 'house-floor';
            }
        }
        
        this.maps['gym'].tiles[2][5] = 'pc';
        this.maps['gym'].tiles[7][1] = 'counter';
        this.maps['gym'].tiles[7][10] = 'counter';
    }
    
    setupNPCs() {
        this.npcs = [
            { x: 5, y: 4, map: 'pallet-town', sprite: 'npc-down', name: 'Mom', dialog: ['Welcome home!', 'Your Pokemon are doing great!', 'Be careful on your adventures!'] },
            { x: 15, y: 4, map: 'pallet-town', sprite: 'npc-down', name: 'Neighbor', dialog: ['Prof. Oak is looking for you.', 'Have you seen his new Pokemon?'] },
            { x: 3, y: 5, map: 'house-1', sprite: 'npc-down', name: 'Mom', dialog: ['Take care of your Pokemon.', 'Come visit anytime!'] },
            { x: 7, y: 3, map: 'lab', sprite: 'npc-down', name: 'Assistant', dialog: ['Prof. Oak is in the back.', 'Choose your starter Pokemon!'] },
            { x: 5, y: 5, map: 'viridian-city', sprite: 'npc-down', name: 'Citizen', dialog: ['Welcome to Viridian City!', 'The PokéMart is very useful.'] },
            { x: 8, y: 4, map: 'center', sprite: 'npc-down', name: 'Nurse', dialog: ['We can heal your Pokemon here.', 'Rest is important for Pokemon!'] },
            { x: 3, y: 4, map: 'mart', sprite: 'npc-down', name: 'Clerk', dialog: ['Welcome to PokéMart!', 'We have everything you need.'] },
            { x: 10, y: 5, map: 'pewter-city', sprite: 'npc-down', name: 'Hiker', dialog: ['The gym leader is strong.', 'Train your Pokemon well!'] }
        ];
    }
    
    setupTrainers() {
        this.trainers = [
            { 
                x: 10, y: 5, map: 'route-1', sprite: 'trainer-down', name: 'Youngster Joey', 
                pokemon: [{ name: 'ratatta', level: 3, hp: 15, maxHp: 15, attack: 8, defense: 4, speed: 7, moves: ['Tackle', 'Tail Whip'] }],
                defeated: false,
                dialogBefore: ['Ready to battle!', 'My Pokemon is strong!'],
                dialogAfter: ['Good battle!', 'You trained well.']
            },
            { 
                x: 5, y: 8, map: 'route-1', sprite: 'trainer-down', name: 'Lass', 
                pokemon: [{ name: 'pidgey', level: 4, hp: 18, maxHp: 18, attack: 7, defense: 5, speed: 8, moves: ['Tackle', 'Gust'] }],
                defeated: false,
                dialogBefore: ['Want to battle?', 'Lets go!'],
                dialogAfter: ['Youre good!', 'Keep training!']
            },
            { 
                x: 15, y: 10, map: 'route-1', sprite: 'trainer-down', name: 'Bug Catcher', 
                pokemon: [
                    { name: 'caterpie', level: 3, hp: 14, maxHp: 14, attack: 6, defense: 4, speed: 5, moves: ['Tackle', 'String Shot'] },
                    { name: 'weedle', level: 3, hp: 14, maxHp: 14, attack: 7, defense: 3, speed: 6, moves: ['Poison Sting', 'String Shot'] }
                ],
                defeated: false,
                dialogBefore: ['I caught these today!', 'Battle time!'],
                dialogAfter: ['Wow, you beat them!', 'Nice battling!']
            },
            { 
                x: 12, y: 3, map: 'route-22', sprite: 'trainer-down', name: 'Camper', 
                pokemon: [{ name: 'charmander', level: 5, hp: 22, maxHp: 22, attack: 10, defense: 6, speed: 9, moves: ['Scratch', 'Growl', 'Ember'] }],
                defeated: false,
                dialogBefore: ['My Charmander is ready!', 'Lets fight!'],
                dialogAfter: ['Great battle!', 'Your Pokemon are strong.']
            },
            { 
                x: 8, y: 12, map: 'route-22', sprite: 'trainer-down', name: 'Picnicker', 
                pokemon: [
                    { name: 'bulbasaur', level: 5, hp: 24, maxHp: 24, attack: 9, defense: 8, speed: 7, moves: ['Tackle', 'Growl', 'Vine Whip'] },
                    { name: 'oddish', level: 4, hp: 18, maxHp: 18, attack: 8, defense: 5, speed: 6, moves: ['Absorb', 'Poison Powder'] }
                ],
                defeated: false,
                dialogBefore: ['Enjoying a picnic!', 'But we can battle!'],
                dialogAfter: ['That was fun!', 'Come battle again!']
            }
        ];
    }
    
    setupInteractables() {
        this.interactables = [
            { x: 7, y: 3, map: 'pallet-town', type: 'item', item: 'potion', name: 'Potion' },
            { x: 14, y: 6, map: 'pallet-town', type: 'item', item: 'pokeball', name: 'Poké Ball' },
            { x: 3, y: 7, map: 'route-1', type: 'item', item: 'berry', name: 'Berry' },
            { x: 17, y: 4, map: 'route-1', type: 'item', item: 'potion', name: 'Potion' },
            { x: 6, y: 2, map: 'viridian-city', type: 'item', item: 'pokeball', name: 'Poké Ball' },
            { x: 14, y: 5, map: 'viridian-city', type: 'item', item: 'potion', name: 'Potion' },
            { x: 4, y: 8, map: 'route-22', type: 'item', item: 'berry', name: 'Berry' },
            { x: 15, y: 6, map: 'route-22', type: 'item', item: 'pokeball', name: 'Poké Ball' },
            { x: 8, y: 3, map: 'pewter-city', type: 'item', item: 'potion', name: 'Potion' }
        ];
    }
    
    setupStarterPokemon() {
        // Give player a starter Pokemon
        this.pokemonTeam = [
            {
                name: 'bulbasaur',
                level: 5,
                hp: 24,
                maxHp: 24,
                attack: 9,
                defense: 8,
                speed: 7,
                moves: ['Tackle', 'Growl', 'Vine Whip'],
                exp: 0,
                expToLevel: 50
            }
        ];
    }
    
    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            if (this.keys[e.key]) return;
            
            const now = Date.now();
            if (now - this.lastKeyTime < this.keyDelay) return;
            
            this.keys[e.key] = true;
            this.lastKeyTime = now;
            
            if (this.currentState === 'ROAMING') {
                this.handleMovement(e.key);
            } else if (this.currentState === 'DIALOG') {
                this.closeDialog();
            }
            
            if (e.key === 'Enter' || e.key === ' ') {
                this.interact();
            }
            
            if (e.key === 'Escape') {
                this.openMenu();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }
    
    handleMovement(key) {
        if (this.player.isMoving) return;
        
        let newX = this.player.x;
        let newY = this.player.y;
        let newDirection = this.player.direction;
        
        switch(key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                newY--;
                newDirection = 'up';
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                newY++;
                newDirection = 'down';
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                newX--;
                newDirection = 'left';
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                newX++;
                newDirection = 'right';
                break;
            default:
                return;
        }
        
        // Check collision
        if (!this.checkCollision(newX, newY)) {
            this.player.fromX = this.player.x;
            this.player.fromY = this.player.y;
            this.player.toX = newX;
            this.player.toY = newY;
            this.player.direction = newDirection;
            this.player.isMoving = true;
            this.player.moveProgress = 0;
        }
    }
    
    checkCollision(x, y) {
        const map = this.maps[this.currentMap];
        if (!map) return true;
        
        // Check bounds
        if (x < 0 || x >= map.width || y < 0 || y >= map.height) {
            return true;
        }
        
        // Check tile collision
        const tile = map.tiles[y][x];
        const collidableTiles = ['tree', 'water', 'rock', 'house-wall', 'counter', 'pc', 'bookshelf'];
        if (collidableTiles.includes(tile)) {
            return true;
        }
        
        // Check NPC collision
        const npcsInMap = this.npcs.filter(npc => npc.map === this.currentMap);
        for (const npc of npcsInMap) {
            if (npc.x === x && npc.y === y) {
                return true;
            }
        }
        
        // Check trainer collision
        const trainersInMap = this.trainers.filter(trainer => trainer.map === this.currentMap && !trainer.defeated);
        for (const trainer of trainersInMap) {
            if (trainer.x === x && trainer.y === y) {
                return true;
            }
        }
        
        return false;
    }
    
    interact() {
        if (this.currentState !== 'ROAMING') return;
        
        const map = this.maps[this.currentMap];
        if (!map) return;
        
        // Get position in front of player
        let checkX = this.player.x;
        let checkY = this.player.y;
        
        switch(this.player.direction) {
            case 'up': checkY--; break;
            case 'down': checkY++; break;
            case 'left': checkX--; break;
            case 'right': checkX++; break;
        }
        
        // Check for houses
        if (map.houses) {
            for (const house of map.houses) {
                if (checkX === house.doorX && checkY === house.doorY) {
                    this.enterHouse(house);
                    return;
                }
            }
        }
        
        // Check for NPCs
        const npcsInMap = this.npcs.filter(npc => npc.map === this.currentMap);
        for (const npc of npcsInMap) {
            if (npc.x === checkX && npc.y === checkY) {
                this.showDialog(npc.name, npc.dialog);
                return;
            }
        }
        
        // Check for trainers
        const trainersInMap = this.trainers.filter(trainer => trainer.map === this.currentMap && !trainer.defeated);
        for (const trainer of trainersInMap) {
            if (trainer.x === checkX && trainer.y === checkY) {
                this.startBattle(trainer);
                return;
            }
        }
        
        // Check for items
        const itemIndex = this.interactables.findIndex(item => 
            item.map === this.currentMap && item.x === checkX && item.y === checkY
        );
        
        if (itemIndex !== -1) {
            const item = this.interactables[itemIndex];
            this.pickupItem(item, itemIndex);
        }
        
        // Check for warps
        if (map.warps) {
            for (const warp of map.warps) {
                if (checkX === warp.x && checkY === warp.y) {
                    this.changeMap(warp.targetMap, warp.targetX, warp.targetY);
                    return;
                }
            }
        }
    }
    
    enterHouse(house) {
        this.currentHouse = house;
        this.currentMap = house.interior;
        this.player.x = house.exitX;
        this.player.y = house.exitY;
        this.player.fromX = house.exitX;
        this.player.fromY = house.exitY;
        this.player.toX = house.exitX;
        this.player.toY = house.exitY;
        this.player.isMoving = false;
        this.currentState = 'ROAMING';
    }
    
    leaveHouse() {
        if (!this.currentHouse) return;
        
        // Find the map that contains this house
        for (const mapName in this.maps) {
            const map = this.maps[mapName];
            if (map.houses) {
                const houseIndex = map.houses.findIndex(h => h.interior === this.currentHouse.interior);
                if (houseIndex !== -1) {
                    const house = map.houses[houseIndex];
                    this.currentMap = mapName;
                    this.player.x = house.doorX;
                    this.player.y = house.doorY + 1;
                    this.player.fromX = house.doorX;
                    this.player.fromY = house.doorY + 1;
                    this.player.toX = house.doorX;
                    this.player.toY = house.doorY + 1;
                    this.player.isMoving = false;
                    this.currentHouse = null;
                    return;
                }
            }
        }
    }
    
    changeMap(targetMap, targetX, targetY) {
        this.currentMap = targetMap;
        this.player.x = targetX;
        this.player.y = targetY;
        this.player.fromX = targetX;
        this.player.fromY = targetY;
        this.player.toX = targetX;
        this.player.toY = targetY;
        this.player.isMoving = false;
    }
    
    pickupItem(item, index) {
        if (item.item === 'potion') {
            this.items.potions++;
            this.showNotification(`Got ${item.name}!`);
        } else if (item.item === 'pokeball') {
            this.items.pokeballs++;
            this.showNotification(`Got ${item.name}!`);
        } else if (item.item === 'berry') {
            this.items.berries = (this.items.berries || 0) + 1;
            this.showNotification(`Got ${item.name}!`);
        }
        
        this.interactables.splice(index, 1);
    }
    
    showDialog(name, messages) {
        this.currentState = 'DIALOG';
        const dialogBox = document.getElementById('dialog-box');
        const dialogName = document.getElementById('dialog-name');
        const dialogText = document.getElementById('dialog-text');
        
        dialogName.textContent = name;
        dialogBox.style.display = 'block';
        
        let messageIndex = 0;
        const showMessage = () => {
            if (messageIndex < messages.length) {
                dialogText.textContent = messages[messageIndex];
                messageIndex++;
            } else {
                this.closeDialog();
            }
        };
        
        showMessage();
        this.currentDialogHandler = showMessage;
    }
    
    closeDialog() {
        const dialogBox = document.getElementById('dialog-box');
        dialogBox.style.display = 'none';
        this.currentState = 'ROAMING';
    }
    
    showNotification(text) {
        const notification = document.getElementById('item-notification');
        notification.textContent = text;
        notification.style.display = 'block';
        
        setTimeout(() => {
            notification.style.display = 'none';
        }, 2000);
    }
    
    startBattle(trainer) {
        this.currentState = 'BATTLE';
        this.battle = new BattleSystem(this, trainer);
        this.battle.start();
    }
    
    openMenu() {
        // Simple menu - just show items for now
        const messageLog = document.getElementById('message-log');
        messageLog.style.display = messageLog.style.display === 'block' ? 'none' : 'block';
        
        if (messageLog.style.display === 'block') {
            this.updateMessageLog();
        }
    }
    
    updateMessageLog() {
        const messageLog = document.getElementById('message-log');
        messageLog.innerHTML = `
            <div><strong>Items:</strong></div>
            <div>Poké Balls: ${this.items.pokeballs}</div>
            <div>Potions: ${this.items.potions}</div>
            <div>Berries: ${this.items.berries || 0}</div>
            <br>
            <div><strong>Pokemon:</strong></div>
            ${this.pokemonTeam.map(p => `<div>${p.name.toUpperCase()} Lv.${p.level} HP:${p.hp}/${p.maxHp}</div>`).join('')}
        `;
    }
    
    update(deltaTime) {
        // Update player movement
        if (this.player.isMoving) {
            this.player.moveProgress += this.player.speed;
            
            if (this.player.moveProgress >= 1) {
                this.player.x = this.player.toX;
                this.player.y = this.player.toY;
                this.player.isMoving = false;
                this.player.moveProgress = 0;
                
                // Check for automatic triggers after movement
                this.checkMapTriggers();
            }
        }
        
        // Update battle if active
        if (this.battle && this.currentState === 'BATTLE') {
            this.battle.update(deltaTime);
        }
    }
    
    checkMapTriggers() {
        const map = this.maps[this.currentMap];
        if (!map) return;
        
        // Check for warps (automatic when walking into them)
        if (map.warps) {
            for (const warp of map.warps) {
                if (this.player.x === warp.x && this.player.y === warp.y) {
                    this.changeMap(warp.targetMap, warp.targetX, warp.targetY);
                    return;
                }
            }
        }
        
        // Check for house exits
        if (map.isInterior && this.currentHouse) {
            if (this.player.x === this.currentHouse.exitX && this.player.y === this.currentHouse.exitY) {
                // Player is at the exit position but inside, they need to walk out
            }
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const map = this.maps[this.currentMap];
        if (!map) return;
        
        // Calculate camera position (centered on player)
        const cameraX = Math.max(0, Math.min(
            this.player.x * this.TILE_SIZE - this.canvas.width / 2 + this.TILE_SIZE / 2,
            map.width * this.TILE_SIZE - this.canvas.width
        ));
        const cameraY = Math.max(0, Math.min(
            this.player.y * this.TILE_SIZE - this.canvas.height / 2 + this.TILE_SIZE / 2,
            map.height * this.TILE_SIZE - this.canvas.height
        ));
        
        // Render tiles
        for (let y = 0; y < map.height; y++) {
            for (let x = 0; x < map.width; x++) {
                const tile = map.tiles[y][x];
                this.renderTile(x, y, tile, cameraX, cameraY);
            }
        }
        
        // Render house walls (for exterior maps)
        if (!map.isInterior && map.houses) {
            for (const house of map.houses) {
                this.renderHouseExterior(house, cameraX, cameraY);
            }
        }
        
        // Render items
        const itemsInMap = this.interactables.filter(item => item.map === this.currentMap);
        for (const item of itemsInMap) {
            this.renderItem(item, cameraX, cameraY);
        }
        
        // Render NPCs
        const npcsInMap = this.npcs.filter(npc => npc.map === this.currentMap);
        for (const npc of npcsInMap) {
            this.renderSprite(npc.sprite, npc.x, npc.y, cameraX, cameraY);
        }
        
        // Render trainers
        const trainersInMap = this.trainers.filter(trainer => 
            trainer.map === this.currentMap && !trainer.defeated
        );
        for (const trainer of trainersInMap) {
            this.renderSprite(trainer.sprite, trainer.x, trainer.y, cameraX, cameraY);
        }
        
        // Render player
        this.renderPlayer(cameraX, cameraY);
    }
    
    renderTile(x, y, tileType, cameraX, cameraY) {
        const screenX = x * this.TILE_SIZE - cameraX;
        const screenY = y * this.TILE_SIZE - cameraY;
        
        // Only render visible tiles
        if (screenX < -this.TILE_SIZE || screenX > this.canvas.width ||
            screenY < -this.TILE_SIZE || screenY > this.canvas.height) {
            return;
        }
        
        const sprite = this.sprites[tileType];
        if (sprite) {
            this.ctx.drawImage(sprite, screenX, screenY, this.TILE_SIZE, this.TILE_SIZE);
        } else {
            // Fallback colors for missing sprites
            const colors = {
                'grass': '#4a8f3a',
                'dirt-path': '#8b7355',
                'water': '#4a90c9',
                'tree': '#2d5a27',
                'house-floor': '#d4c4a8',
                'house-wall': '#8b4513',
                'door': '#654321',
                'counter': '#cd853f',
                'pc': '#708090',
                'bookshelf': '#8b4513',
                'flower': '#ff69b4',
                'rock': '#808080',
                'sand': '#f4e4bc',
                'bridge': '#deb887'
            };
            
            this.ctx.fillStyle = colors[tileType] || '#808080';
            this.ctx.fillRect(screenX, screenY, this.TILE_SIZE, this.TILE_SIZE);
        }
    }
    
    renderHouseExterior(house, cameraX, cameraY) {
        // Render house walls around the perimeter
        for (let x = house.x; x < house.x + house.width; x++) {
            // Top wall
            this.renderTile(x, house.y - 1, 'house-wall', cameraX, cameraY);
            // Bottom wall
            if (house.y + house.height < this.maps[this.currentMap].height) {
                this.renderTile(x, house.y + house.height, 'house-wall', cameraX, cameraY);
            }
        }
        
        for (let y = house.y; y < house.y + house.height; y++) {
            // Left wall
            this.renderTile(house.x - 1, y, 'house-wall', cameraX, cameraY);
            // Right wall
            if (house.x + house.width < this.maps[this.currentMap].width) {
                this.renderTile(house.x + house.width, y, 'house-wall', cameraX, cameraY);
            }
        }
    }
    
    renderItem(item, cameraX, cameraY) {
        const screenX = item.x * this.TILE_SIZE - cameraX;
        const screenY = item.y * this.TILE_SIZE - cameraY;
        
        // Only render visible items
        if (screenX < -this.TILE_SIZE || screenX > this.canvas.width ||
            screenY < -this.TILE_SIZE || screenY > this.canvas.height) {
            return;
        }
        
        const sprite = this.sprites[item.item];
        if (sprite) {
            // Bobbing animation
            const bobOffset = Math.sin(Date.now() / 200) * 3;
            this.ctx.drawImage(sprite, screenX, screenY + bobOffset, this.TILE_SIZE, this.TILE_SIZE);
        }
    }
    
    renderPlayer(cameraX, cameraY) {
        const screenX = this.getInterpolatedX(cameraX);
        const screenY = this.getInterpolatedY(cameraY);
        
        const spriteName = `player-${this.player.direction}`;
        const sprite = this.sprites[spriteName];
        
        if (sprite) {
            this.ctx.drawImage(sprite, screenX, screenY, this.TILE_SIZE, this.TILE_SIZE);
        } else {
            // Fallback
            this.ctx.fillStyle = '#ff0000';
            this.ctx.fillRect(screenX, screenY, this.TILE_SIZE, this.TILE_SIZE);
        }
    }
    
    getInterpolatedX(cameraX) {
        if (this.player.isMoving) {
            return (this.player.fromX + (this.player.toX - this.player.fromX) * this.player.moveProgress) * 
                   this.TILE_SIZE - cameraX;
        }
        return this.player.x * this.TILE_SIZE - cameraX;
    }
    
    getInterpolatedY(cameraY) {
        if (this.player.isMoving) {
            return (this.player.fromY + (this.player.toY - this.player.fromY) * this.player.moveProgress) * 
                   this.TILE_SIZE - cameraY;
        }
        return this.player.y * this.TILE_SIZE - cameraY;
    }
    
    renderSprite(spriteName, x, y, cameraX, cameraY) {
        const screenX = x * this.TILE_SIZE - cameraX;
        const screenY = y * this.TILE_SIZE - cameraY;
        
        // Only render visible sprites
        if (screenX < -this.TILE_SIZE || screenX > this.canvas.width ||
            screenY < -this.TILE_SIZE || screenY > this.canvas.height) {
            return;
        }
        
        const sprite = this.sprites[spriteName];
        if (sprite) {
            this.ctx.drawImage(sprite, screenX, screenY, this.TILE_SIZE, this.TILE_SIZE);
        }
    }
    
    gameLoop() {
        let lastTime = performance.now();
        
        const loop = (currentTime) => {
            const deltaTime = currentTime - lastTime;
            lastTime = currentTime;
            
            this.update(deltaTime);
            this.render();
            
            requestAnimationFrame(loop);
        };
        
        requestAnimationFrame(loop);
    }
}

// Battle System
class BattleSystem {
    constructor(game, trainer) {
        this.game = game;
        this.trainer = trainer;
        this.currentPokemonIndex = 0;
        this.enemyPokemonIndex = 0;
        this.isPlayerTurn = true;
        this.battleState = 'START'; // START, PLAYER_CHOICE, ANIMATION, ENEMY_TURN, WON, LOST, CAUGHT
        this.messageQueue = [];
        this.currentMessage = '';
        this.messageTimer = 0;
        this.animationFrame = 0;
    }
    
    start() {
        const battleUI = document.getElementById('battle-ui');
        battleUI.style.display = 'block';
        
        this.showMessage(`${this.trainer.name} wants to battle!`);
        
        setTimeout(() => {
            this.sendEnemyPokemon();
        }, 1500);
    }
    
    sendEnemyPokemon() {
        if (this.enemyPokemonIndex >= this.trainer.pokemon.length) {
            this.endBattle(true);
            return;
        }
        
        this.enemyPokemon = this.trainer.pokemon[this.enemyPokemonIndex];
        this.playerPokemon = this.game.pokemonTeam[this.currentPokemonIndex];
        
        this.updateBattleUI();
        this.showMessage(`Go! ${this.enemyPokemon.name.toUpperCase()}!`);
        
        setTimeout(() => {
            this.battleState = 'PLAYER_CHOICE';
            this.showMessage(`What will ${this.playerPokemon.name.toUpperCase()} do?`);
        }, 1500);
    }
    
    updateBattleUI() {
        if (!this.playerPokemon || !this.enemyPokemon) return;
        
        document.getElementById('player-pokemon-name').textContent = this.playerPokemon.name.toUpperCase();
        document.getElementById('player-pokemon-level').textContent = this.playerPokemon.level;
        document.getElementById('player-hp-current').textContent = this.playerPokemon.hp;
        document.getElementById('player-hp-max').textContent = this.playerPokemon.maxHp;
        
        const playerHPPercent = (this.playerPokemon.hp / this.playerPokemon.maxHp) * 100;
        const playerHPFill = document.getElementById('player-hp-fill');
        playerHPFill.style.width = `${playerHPPercent}%`;
        playerHPFill.className = 'hp-fill';
        if (playerHPPercent < 25) playerHPFill.classList.add('low');
        else if (playerHPPercent < 50) playerHPFill.classList.add('medium');
        
        document.getElementById('enemy-pokemon-name').textContent = this.enemyPokemon.name.toUpperCase();
        document.getElementById('enemy-pokemon-level').textContent = this.enemyPokemon.level;
        document.getElementById('enemy-hp-current').textContent = this.enemyPokemon.hp;
        document.getElementById('enemy-hp-max').textContent = this.enemyPokemon.maxHp;
        
        const enemyHPPercent = (this.enemyPokemon.hp / this.enemyPokemon.maxHp) * 100;
        const enemyHPFill = document.getElementById('enemy-hp-fill');
        enemyHPFill.style.width = `${enemyHPPercent}%`;
        enemyHPFill.className = 'hp-fill';
        if (enemyHPPercent < 25) enemyHPFill.classList.add('low');
        else if (enemyHPPercent < 50) enemyHPFill.classList.add('medium');
    }
    
    showMessage(text) {
        this.currentMessage = text;
        this.messageTimer = 60; // frames
        
        // Also show in dialog box
        const dialogBox = document.getElementById('dialog-box');
        const dialogText = document.getElementById('dialog-text');
        const dialogName = document.getElementById('dialog-name');
        
        dialogName.textContent = 'Battle';
        dialogText.textContent = text;
        dialogBox.style.display = 'block';
    }
    
    update(deltaTime) {
        if (this.messageTimer > 0) {
            this.messageTimer--;
            if (this.messageTimer === 0) {
                const dialogBox = document.getElementById('dialog-box');
                dialogBox.style.display = 'none';
            }
        }
        
        this.animationFrame++;
    }
    
    attack() {
        if (this.battleState !== 'PLAYER_CHOICE') return;
        
        this.battleState = 'ANIMATION';
        const move = this.playerPokemon.moves[0]; // Use first move for simplicity
        
        this.showMessage(`${this.playerPokemon.name.toUpperCase()} used ${move}!`);
        
        setTimeout(() => {
            this.executeMove(this.playerPokemon, this.enemyPokemon, move, true);
        }, 1000);
    }
    
    executeMove(attacker, defender, move, isPlayer) {
        // Calculate damage
        const baseDamage = attacker.attack * 2;
        const defense = defender.defense;
        const damage = Math.max(1, Math.floor(baseDamage - defense / 2));
        
        // Apply damage
        defender.hp = Math.max(0, defender.hp - damage);
        this.updateBattleUI();
        
        setTimeout(() => {
            if (defender.hp === 0) {
                this.showMessage(`${defender.name.toUpperCase()} fainted!`);
                
                setTimeout(() => {
                    if (isPlayer) {
                        // Enemy Pokemon fainted
                        this.gainExp();
                        this.enemyPokemonIndex++;
                        this.sendEnemyPokemon();
                    } else {
                        // Player Pokemon fainted
                        this.currentPokemonIndex++;
                        if (this.currentPokemonIndex >= this.game.pokemonTeam.length) {
                            this.endBattle(false);
                        } else {
                            this.playerPokemon = this.game.pokemonTeam[this.currentPokemonIndex];
                            this.showMessage(`Go! ${this.playerPokemon.name.toUpperCase()}!`);
                            setTimeout(() => {
                                this.battleState = 'PLAYER_CHOICE';
                            }, 1500);
                        }
                    }
                }, 1500);
            } else {
                if (isPlayer) {
                    this.battleState = 'ENEMY_TURN';
                    setTimeout(() => this.enemyTurn(), 1000);
                } else {
                    this.battleState = 'PLAYER_CHOICE';
                    this.showMessage(`What will ${this.playerPokemon.name.toUpperCase()} do?`);
                }
            }
        }, 1000);
    }
    
    enemyTurn() {
        const move = this.enemyPokemon.moves[0];
        this.showMessage(`${this.enemyPokemon.name.toUpperCase()} used ${move}!`);
        
        setTimeout(() => {
            this.executeMove(this.enemyPokemon, this.playerPokemon, move, false);
        }, 1000);
    }
    
    gainExp() {
        const expGain = this.enemyPokemon.level * 10;
        this.playerPokemon.exp += expGain;
        
        if (this.playerPokemon.exp >= this.playerPokemon.expToLevel) {
            this.playerPokemon.level++;
            this.playerPokemon.exp = 0;
            this.playerPokemon.expToLevel = Math.floor(this.playerPokemon.expToLevel * 1.5);
            this.playerPokemon.maxHp += 5;
            this.playerPokemon.hp = this.playerPokemon.maxHp;
            this.playerPokemon.attack += 2;
            this.playerPokemon.defense += 2;
            this.playerPokemon.speed += 2;
            this.showMessage(`${this.playerPokemon.name.toUpperCase()} grew to Lv.${this.playerPokemon.level}!`);
        }
        
        this.updateBattleUI();
    }
    
    usePotion() {
        if (this.battleState !== 'PLAYER_CHOICE') return;
        if (this.game.items.potions <= 0) {
            this.showMessage("You don't have any Potions!");
            return;
        }
        
        this.game.items.potions--;
        const healAmount = 20;
        this.playerPokemon.hp = Math.min(this.playerPokemon.maxHp, this.playerPokemon.hp + healAmount);
        this.updateBattleUI();
        this.showMessage(`${this.playerPokemon.name.toUpperCase()} recovered HP!`);
        
        setTimeout(() => {
            this.battleState = 'ENEMY_TURN';
            setTimeout(() => this.enemyTurn(), 1000);
        }, 1500);
    }
    
    throwPokeball() {
        if (this.battleState !== 'PLAYER_CHOICE') return;
        if (this.game.items.pokeballs <= 0) {
            this.showMessage("You don't have any Poké Balls!");
            return;
        }
        
        this.game.items.pokeballs--;
        
        // Calculate catch chance
        const hpPercent = this.enemyPokemon.hp / this.enemyPokemon.maxHp;
        const catchChance = (1 - hpPercent) * 0.8 + 0.2;
        
        if (Math.random() < catchChance) {
            this.showMessage("Gotcha! Pokémon was caught!");
            setTimeout(() => {
                // Add Pokemon to team
                const caughtPokemon = { ...this.enemyPokemon };
                caughtPokemon.hp = caughtPokemon.maxHp;
                caughtPokemon.exp = 0;
                caughtPokemon.expToLevel = 50;
                this.game.pokemonTeam.push(caughtPokemon);
                this.endBattle(true, true);
            }, 1500);
        } else {
            this.showMessage("Oh no! The Pokémon broke free!");
            setTimeout(() => {
                this.battleState = 'ENEMY_TURN';
                setTimeout(() => this.enemyTurn(), 1000);
            }, 1500);
        }
    }
    
    run() {
        if (this.battleState !== 'PLAYER_CHOICE') return;
        
        // Can always run from wild battles, but not trainer battles
        // For simplicity, allow running with 70% chance
        if (Math.random() < 0.7) {
            this.showMessage("Got away safely!");
            setTimeout(() => {
                this.endBattle(false);
            }, 1000);
        } else {
            this.showMessage("Can't escape!");
            setTimeout(() => {
                this.battleState = 'ENEMY_TURN';
                setTimeout(() => this.enemyTurn(), 1000);
            }, 1000);
        }
    }
    
    endBattle(playerWon, caught = false) {
        const battleUI = document.getElementById('battle-ui');
        const dialogBox = document.getElementById('dialog-box');
        
        battleUI.style.display = 'none';
        dialogBox.style.display = 'none';
        
        if (playerWon) {
            if (caught) {
                this.showMessage(`You caught ${this.enemyPokemon.name.toUpperCase()}!`);
            } else {
                this.showMessage(`You won! ${this.trainer.name} says: "${this.trainer.dialogAfter[0]}"`);
                this.trainer.defeated = true;
            }
        } else {
            this.showMessage("You whited out...");
            // Return to last Pokemon Center or starting position
            this.game.currentMap = 'pallet-town';
            this.game.player.x = 10;
            this.game.player.y = 7;
            this.game.player.fromX = 10;
            this.game.player.fromY = 7;
            this.game.player.toX = 10;
            this.game.player.toY = 7;
            
            // Heal Pokemon
            this.game.pokemonTeam.forEach(p => {
                p.hp = p.maxHp;
            });
        }
        
        setTimeout(() => {
            dialogBox.style.display = 'none';
            this.game.currentState = 'ROAMING';
            this.game.battle = null;
        }, 2000);
    }
}

// Start the game
const game = new Game();
