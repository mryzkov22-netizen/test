# Pokémon Game - Required Sprite Images

This document lists all the sprite images you need to add to your `/workspace` directory for the game to use custom pixel art graphics instead of the procedural fallbacks.

## Image Specifications
- **Tile sprites**: 32x32 pixels (PNG format recommended)
- **Character sprites**: 32x32 pixels (PNG format recommended)  
- **Pokemon sprites**: 96x96 pixels (PNG format recommended)
- **Item sprites**: 32x32 pixels (PNG format recommended)
- All images should have transparent backgrounds where appropriate

---

## 📁 Required Image Files

### 👤 Player Sprites (4 files)
| Filename | Size | Description |
|----------|------|-------------|
| `player-down.png` | 32x32 | Player character facing down |
| `player-up.png` | 32x32 | Player character facing up (back view) |
| `player-left.png` | 32x32 | Player character facing left |
| `player-right.png` | 32x32 | Player character facing right |

### 🧑‍🤝‍🧑 NPC & Trainer Sprites (2 files)
| Filename | Size | Description |
|----------|------|-------------|
| `npc-down.png` | 32x32 | Generic NPC facing down |
| `trainer-down.png` | 32x32 | Trainer character facing down |

### 🎒 Item Sprites (3 files)
| Filename | Size | Description |
|----------|------|-------------|
| `pokeball.png` | 32x32 | Poké Ball item |
| `potion.png` | 32x32 | Potion item |
| `berry.png` | 32x32 | Berry item |

### 🗺️ Tile/Environment Sprites (14 files)
| Filename | Size | Description |
|----------|------|-------------|
| `grass.png` | 32x32 | Grass tile |
| `dirt-path.png` | 32x32 | Dirt path tile |
| `water.png` | 32x32 | Water tile |
| `tree.png` | 32x32 | Tree tile |
| `house-floor.png` | 32x32 | House floor tile |
| `house-wall.png` | 32x32 | House wall tile |
| `door.png` | 32x32 | Door tile |
| `counter.png` | 32x32 | Counter tile (for shops) |
| `pc.png` | 32x32 | PC tile |
| `bookshelf.png` | 32x32 | Bookshelf tile |
| `flower.png` | 32x32 | Flower decoration |
| `rock.png` | 32x32 | Rock tile |
| `sand.png` | 32x32 | Sand tile |
| `bridge.png` | 32x32 | Bridge tile |

### ⚡ Pokémon Battle Sprites (20 files - 10 Pokémon × 2 views each)

#### Front Views (used for enemy Pokémon)
| Filename | Size | Description |
|----------|------|-------------|
| `pikachu-front.png` | 96x96 | Pikachu front view |
| `charmander-front.png` | 96x96 | Charmander front view |
| `squirtle-front.png` | 96x96 | Squirtle front view |
| `bulbasaur-front.png` | 96x96 | Bulbasaur front view |
| `rattata-front.png` | 96x96 | Rattata front view |
| `pidgey-front.png` | 96x96 | Pidgey front view |
| `caterpie-front.png` | 96x96 | Caterpie front view |
| `zubat-front.png` | 96x96 | Zubat front view |
| `geodude-front.png` | 96x96 | Geodude front view |
| `machop-front.png` | 96x96 | Machop front view |

#### Back Views (used for player's Pokémon)
| Filename | Size | Description |
|----------|------|-------------|
| `pikachu-back.png` | 96x96 | Pikachu back view |
| `charmander-back.png` | 96x96 | Charmander back view |
| `squirtle-back.png` | 96x96 | Squirtle back view |
| `bulbasaur-back.png` | 96x96 | Bulbasaur back view |
| `rattata-back.png` | 96x96 | Rattata back view |
| `pidgey-back.png` | 96x96 | Pidgey back view |
| `caterpie-back.png` | 96x96 | Caterpie back view |
| `zubat-back.png` | 96x96 | Zubat back view |
| `geodude-back.png` | 96x96 | Geodude back view |
| `machop-back.png` | 96x96 | Machop back view |

---

## 📊 Total Count
- **Player sprites**: 4
- **NPC/Trainer sprites**: 2
- **Item sprites**: 3
- **Tile sprites**: 14
- **Pokémon sprites**: 20 (10 front + 10 back)

**Grand Total: 43 image files**

---

## 🎨 Notes
1. The game will work WITHOUT these images using procedural pixel art fallbacks
2. When images are present, they will automatically replace the procedural graphics
3. Place all images directly in the `/workspace` folder (same level as `index.html` and `game.js`)
4. PNG format with transparency is recommended for best results
5. For Pokémon sprites, you can find free-to-use sprite sheets on sites like:
   - The Spriters Resource
   - PokeAPI sprites
   - DeviantArt (check licensing)

---

## 🔧 Where to Find Free Pokémon Sprites
- **PokeAPI**: https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/
- **Official artwork**: Various fan resources (ensure proper licensing)
- **OpenGameArt.org**: Free game assets

For a complete Pokémon sprite resource, visit: https://github.com/PokeAPI/sprites
