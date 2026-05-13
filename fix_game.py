import re

# Read the file
with open('/workspace/game.js', 'r') as f:
    content = f.read()

# Fix 1: Player sprite rendering - remove the flipping logic since we have separate left/right sprites
old_player_render = '''    // Draw player - correct sprite direction handling
    let playerSpriteName = `player-${player.direction}`;
    if (sprites[playerSpriteName]) {
        const sprite = sprites[playerSpriteName];
        ctx.save();
        // For left direction, flip the sprite horizontally
        if (player.direction === 'left') {
            ctx.translate(player.x + TILE_SIZE, player.y);
            ctx.scale(-1, 1);
            ctx.drawImage(sprite, 0, 0, TILE_SIZE, TILE_SIZE);
        } else {
            // For right, down, up - draw normally
            ctx.drawImage(sprite, player.x, player.y, TILE_SIZE, TILE_SIZE);
        }
        ctx.restore();
    }'''

new_player_render = '''    // Draw player - use correct sprite for each direction
    let playerSpriteName = `player-${player.direction}`;
    if (sprites[playerSpriteName]) {
        const sprite = sprites[playerSpriteName];
        ctx.drawImage(sprite, player.x, player.y, TILE_SIZE, TILE_SIZE);
    }'''

content = content.replace(old_player_render, new_player_render)

# Fix 2: Improve Professor Oak dialogue to be multi-step with starter selection
old_oak_dialogue = '''{ x: 8, y: 5, sprite: 'npc-down', name: 'Prof. Oak', dialogue: ['Welcome to Pallet Town!', 'My lab is to the north.', 'Visit me when you are ready for your first Pokemon!'], givesStarter: true },'''
new_oak_dialogue = '''{ x: 8, y: 5, sprite: 'npc-down', name: 'Prof. Oak', dialogue: ['Welcome to Pallet Town!', 'I am Professor Oak, but everyone calls me the Pokemon Professor!', 'My lab is to the north.', 'Visit me when you are ready for your first Pokemon!'], givesStarter: true },'''
content = content.replace(old_oak_dialogue, new_oak_dialogue)

old_oak_lab_dialogue = '''{ x: 7, y: 4, sprite: 'npc-down', name: 'Prof. Oak', dialogue: ['Ah, welcome!', 'Are you ready to begin your journey?', 'Choose wisely!'], givesStarter: true }'''
new_oak_lab_dialogue = '''{ x: 7, y: 4, sprite: 'npc-down', name: 'Prof. Oak', dialogue: ['Ah, welcome to my lab!', 'I am Professor Oak, the Pokemon researcher.', 'Are you ready to begin your journey?', 'You need a Pokemon partner for your adventure.', 'Choose wisely - this Pokemon will be with you throughout your journey!'], givesStarter: true }'''
content = content.replace(old_oak_lab_dialogue, new_oak_lab_dialogue)

# Fix 3: Improve the NPC interaction handler for better dialogue flow
old_npc_handler = '''        } else if (npc.givesStarter && !starterGiven) {
            // Give starter pokemon - only once per game
            if (player.party.length === 0) {
                showDialogue(npc.name, [...npc.dialogue, '', 'Which pokemon do you choose?', 'Press 1 for Bulbasaur, 2 for Charmander, 3 for Squirtle']);
                dialogueState.callback = () => {
                    // Starter selection handled by number keys
                };
            } else {
                showDialogue(npc.name, ['You already have a Pokemon!', 'Take care of it!']);
            }'''

new_npc_handler = '''        } else if (npc.givesStarter && !starterGiven) {
            // Give starter pokemon - only once per game
            if (player.party.length === 0) {
                showDialogue(npc.name, npc.dialogue);
                dialogueState.callback = () => {
                    // Show selection prompt after dialogue
                    setTimeout(() => {
                        showDialogue(npc.name, ['', 'Which Pokemon do you choose?', 'Press 1 for Bulbasaur (Grass)', 'Press 2 for Charmander (Fire)', 'Press 3 for Squirtle (Water)']);
                    }, 100);
                };
            } else {
                showDialogue(npc.name, ['You already have a Pokemon!', 'Take care of it on your journey!']);
            }'''

content = content.replace(old_npc_handler, new_npc_handler)

# Write the fixed content back
with open('/workspace/game.js', 'w') as f:
    f.write(content)

print("Fixes applied successfully!")
