# Pokemon Adventure - 2D Pixel Art Game

A fully functioning 2D pixelart Pokemon-style game built with HTML5 Canvas and JavaScript.

## Features Implemented

### Multiple Towns with Different Vibes and Aesthetics
- **Pallet Town** - Starting town with grassy areas and cozy houses
- **Route 1** - Path between towns with trees and rocks
- **Viridian City** - Larger city with urban feel, includes PokéMart and Pokémon Center
- **Route 22** - Forest path with winding trails and dense trees
- **Pewter City** - Rocky mountain town with sandy terrain

### Explorable Areas with Points of Interest
- Dirt paths connecting different areas
- Decorative flowers, trees, and rocks
- Interactive items scattered throughout the world (Potions, Poké Balls, Berries)
- Warps at map edges to travel between locations

### Enterable Houses with Interiors
- Multiple houses in each town that can be entered
- Unique interior designs:
  - Cozy homes with bookshelves, PCs, and counters
  - Pokémon Lab with research equipment
  - PokéMart for shopping
  - Pokémon Center for healing
  - Museum with exhibits
  - Gym for battles
- NPCs inside houses with unique dialogues

### Full Pokemon Battle Mechanics
- Turn-based battle system
- HP bars with color-coded health status (green/yellow/red)
- Attack moves with damage calculation
- Potion usage during battle
- Poké Ball throwing with catch mechanics
- Run option with escape chance
- Experience points and leveling system
- Multiple Pokemon per trainer
- Pokemon fainting and sending out new Pokemon

### Trainers to Fight
- 5 unique trainers across different routes
- Each trainer has their own team of Pokemon
- Trainers have dialog before and after battles
- Defeated trainers are marked and won't battle again

### Item Interaction
- Pick up items by facing them and pressing Enter/Space
- Items include: Potions, Poké Balls, Berries
- Item collection notifications
- Inventory tracking (accessible via ESC key)

### Smooth Movement System
- Non-twitchy, grid-based movement with interpolation
- Player slides smoothly between tiles
- Direction-based sprites (up, down, left, right)
- Key press delay to prevent accidental multiple moves
- Collision detection with:
  - Map boundaries
  - Solid tiles (trees, water, rocks, furniture)
  - NPCs and trainers
  - House walls

### Player Cannot Get Stuck
- Proper collision detection prevents walking into solid objects
- Houses have clear entrance/exit points
- Warps positioned to avoid trapping player
- White-out mechanic returns player to start position with healed Pokemon

## Controls

- **WASD or Arrow Keys**: Move the player character
- **Enter or Space**: Interact with NPCs, trainers, items, house doors
- **ESC**: Toggle inventory/menu display

## How to Play

1. Open `index.html` in a modern web browser
2. Use WASD or Arrow keys to move around
3. Walk into houses by facing the door and pressing Enter
4. Talk to NPCs by facing them and pressing Enter
5. Challenge trainers by facing them and pressing Enter
6. Pick up items by facing them and pressing Enter
7. Walk to map edges (marked by paths) to travel to other areas

## Technical Details

- Pure HTML5 Canvas rendering
- No external dependencies
- Sprite-based graphics using provided PNG files
- Tile-based map system (48x48 pixel tiles)
- Camera follows player smoothly
- State machine for game states (ROAMING, BATTLE, DIALOG)
- Modular code structure with Game and BattleSystem classes

## Files Included

- `index.html` - Main HTML file with game container and UI elements
- `game.js` - Complete game logic including:
  - Game engine
  - Map system
  - Battle system
  - NPC/trainer interactions
  - Item system
  - Movement and collision

## Sprites Used

All sprites are loaded from PNG files in the same directory:
- Player sprites (4 directions)
- NPC and Trainer sprites
- Item sprites (Pokéball, Potion, Berry)
- Tile sprites (grass, dirt-path, water, tree, etc.)
- Pokemon sprites (front and back for 10 species)

Enjoy your Pokemon adventure!
