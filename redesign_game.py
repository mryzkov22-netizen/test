#!/usr/bin/env python3
"""
Redesign the game world as a polished top-down monster-catching RPG
with cozy, readable, layered pixel-art look.
"""

import re

# Read the original game.js
with open('/workspace/game.js', 'r') as f:
    content = f.read()

# New sprite loading function with ALL sprites
new_load_sprites = '''// Load all sprites
async function loadSprites() {
    const spriteNames = [
        // Player sprites
        'player-down', 'player-up', 'player-left', 'player-right',
        // NPC sprites
        'npc-down', 'trainer-down',
        // Path tiles
        'dirt-path', 'dirt-path-corner', 'dirt-path-tjunction', 'dirt-path-cross', 'dirt-path-end',
        // Ground tiles
        'grass', 'tall-grass', 'water', 'sand', 'house-floor',
        // Nature decorations
        'tree', 'bush', 'hedge', 'flower', 'flower-bed', 'plant', 'rock',
        // Cliff and elevation
        'cliff-top', 'cliff-mid', 'cliff-bottom', 'stairs-up', 'stairs-down',
        // Water features
        'waterfall', 'bridge', 'dock', 'boat',
        // Cave
        'cave-entrance',
        // Fences
        'fence-wood', 'fence-gate',
        // House exterior
        'house-wall', 'door', 'roof', 'roof-corner', 'roof-ridge', 'window', 'chimney',
        // House interior furniture
        'bed', 'table', 'chair', 'rug', 'stove', 'sink', 'cabinet', 'tv', 'bookshelf',
        // Shop/Service furniture
        'counter', 'pc',
        // Town decorations
        'fountain', 'well', 'lamppost', 'bench', 'signpost', 'mailbox',
        // Items
        'berry', 'potion', 'pokeball',
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
'''

# Replace the loadSprites function
content = re.sub(
    r'// Load all sprites\nasync function loadSprites\(\) \{[^}]+\}\n',
    new_load_sprites,
    content,
    flags=re.DOTALL
)

# New getTileColor with expanded palette
new_getTileColor = '''function getTileColor(type) {
    const colors = {
        'grass': '#5a8f3a',
        'tall-grass': '#4a7c23',
        'water': '#4aa3df',
        'sand': '#e8d68a',
        'dirt-path': '#a06838',
        'house-floor': '#d4a76a',
        'house-wall': '#8b4513',
        'cliff-top': '#6b5b4f',
        'cliff-mid': '#5a4a3f',
        'cliff-bottom': '#4a3a2f'
    };
    return colors[type] || '#808080';
}
'''

content = re.sub(
    r'function getTileColor\(type\) \{[^}]+\}',
    new_getTileColor,
    content,
    flags=re.DOTALL
)

# Write the updated content
with open('/workspace/game.js', 'w') as f:
    f.write(content)

print("Updated sprite loading and tile colors!")
