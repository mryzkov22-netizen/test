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

if old_player_render in content:
    content = content.replace(old_player_render, new_player_render)
    print("✓ Fixed player sprite rendering")
else:
    print("✗ Player sprite rendering fix not found (may already be applied)")

# Write the fixed content back
with open('/workspace/game.js', 'w') as f:
    f.write(content)

print("Comprehensive fixes applied!")
