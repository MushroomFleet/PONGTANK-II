# PONGTANK-II Art Team Handoff

## Project Overview
PONGTANK-II is a retro-inspired top-down tank combat game featuring industrial aesthetics, classic arcade styling, and pixel-perfect visual design. The art style combines 1980s arcade nostalgia with modern visual fidelity.

## Visual Style Guide

### Color Palette
**Primary Colors:**
- Industrial Blue: `#2E4057` (backgrounds, UI frames)
- Steel Gray: `#4A5568` (walls, structural elements)  
- Neon Green: `#38A169` (health powerups, player UI accents)
- Warning Red: `#E53E3E` (ammo powerups, enemy elements, damage indicators)
- Electric Yellow: `#D69E2E` (projectiles, score highlights)

**Secondary Colors:**
- Dark Charcoal: `#1A202C` (shadows, depth)
- Light Steel: `#718096` (inactive elements)
- Bright White: `#FFFFFF` (text, highlights)
- Orange Alert: `#DD6B20` (streak bonuses, special effects)

### Typography
- **Font Style**: Monospace/Pixel font reminiscent of 1980s arcade games
- **Primary Font**: 8-bit style, clean and readable
- **UI Text Size**: 16px base, 24px headers, 12px details
- **Score Display**: Large, prominent numbers with digital styling

## Asset Specifications

### Tank Assets

#### Player Tank Body
- **Filename**: `player_tank_body.png`
- **Dimensions**: 32x32 pixels
- **Format**: PNG with transparency
- **Style**: Industrial military tank, steel blue color scheme
- **Details**: Top-down view, detailed treads, angular design
- **Animation**: Single static sprite (rotation handled by code)
- **Note**: Tank body rotates independently from turret

#### Player Tank Turret
- **Filename**: `player_tank_turret.png`
- **Dimensions**: 24x24 pixels
- **Format**: PNG with transparency
- **Style**: Matches tank body, prominent barrel extending from center
- **Details**: Clear directional indicator, industrial detailing
- **Pivot Point**: Center of sprite (12, 12)

#### Enemy Tank Body
- **Filename**: `enemy_tank_body.png`
- **Dimensions**: 32x32 pixels
- **Format**: PNG with transparency
- **Style**: Similar to player but with red accents
- **Details**: Slightly more angular, hostile appearance
- **Color Scheme**: Dark gray with red warning stripes

#### Enemy Tank Turret
- **Filename**: `enemy_tank_turret.png`
- **Dimensions**: 24x24 pixels
- **Format**: PNG with transparency
- **Style**: Matches enemy tank body
- **Details**: Red-tinted barrel, aggressive styling

### Projectile Assets

#### Player Projectile
- **Filename**: `projectile_player.png`
- **Dimensions**: 8x8 pixels
- **Format**: PNG with transparency
- **Style**: Classic PONG ball aesthetic with modern glow
- **Details**: Bright white/yellow center with subtle glow effect
- **Animation**: Optional subtle pulsing glow (3 frames if animated)

#### Enemy Projectile
- **Filename**: `projectile_enemy.png`
- **Dimensions**: 8x8 pixels
- **Format**: PNG with transparency
- **Style**: Similar to player but red-tinted
- **Details**: Red core with orange glow effect

#### Projectile Trail Effect
- **Filename**: `projectile_trail.png`
- **Dimensions**: 16x4 pixels
- **Format**: PNG with transparency
- **Style**: Subtle light streak following projectiles
- **Details**: Gradient from opaque to transparent

### Environment Assets

#### Wall Tile
- **Filename**: `wall_tile.png`
- **Dimensions**: 32x32 pixels
- **Format**: PNG
- **Style**: Industrial concrete/steel plating
- **Details**: Seamlessly tileable, subtle weathering effects
- **Variations**: Create 4 rotation variants for visual variety

#### Floor Tile
- **Filename**: `floor_tile.png`
- **Dimensions**: 32x32 pixels
- **Format**: PNG
- **Style**: Industrial concrete floor
- **Details**: Seamlessly tileable, subtle grid lines or wear patterns
- **Color**: Neutral gray tone

#### Destructible Brick
- **Filename**: `brick_destructible.png`
- **Dimensions**: 32x32 pixels
- **Format**: PNG with transparency
- **Style**: Classic arcade brick with industrial theme
- **Details**: Orange/brown coloring, subtle 3D effect
- **Destruction**: Create 4-frame destruction animation sequence

#### Brick Destruction Frames
- **Filenames**: `brick_destroy_01.png` through `brick_destroy_04.png`
- **Dimensions**: 32x32 pixels each
- **Format**: PNG with transparency
- **Style**: Progressive destruction from intact to rubble
- **Timing**: Each frame 50ms duration

### Powerup Assets

#### Health Powerup (Green)
- **Filename**: `powerup_health.png`
- **Dimensions**: 24x24 pixels
- **Format**: PNG with transparency
- **Style**: Medical cross or heart symbol in bright green
- **Details**: Subtle pulsing glow effect, clear medical iconography
- **Animation**: 4-frame floating animation (2-second cycle)

#### Ammo Powerup (Red)
- **Filename**: `powerup_ammo.png`
- **Dimensions**: 24x24 pixels
- **Format**: PNG with transparency
- **Style**: Ammunition or bullet symbol in bright red
- **Details**: Weapon/ammo iconography, energetic appearance
- **Animation**: 4-frame floating animation (2-second cycle)

#### Powerup Glow Effect
- **Filename**: `powerup_glow.png`
- **Dimensions**: 48x48 pixels
- **Format**: PNG with transparency
- **Style**: Soft circular glow for powerup highlighting
- **Details**: Radial gradient, very transparent center to opaque edge

### UI Assets

#### Health Bar Background
- **Filename**: `ui_health_bg.png`
- **Dimensions**: 200x20 pixels
- **Format**: PNG
- **Style**: Industrial frame with inner recess
- **Details**: Steel gray frame, dark inner area

#### Health Bar Fill
- **Filename**: `ui_health_fill.png`
- **Dimensions**: 196x16 pixels
- **Format**: PNG
- **Style**: Bright green gradient bar
- **Details**: Seamlessly tileable horizontally for partial fills

#### Ammo Counter Background
- **Filename**: `ui_ammo_bg.png`
- **Dimensions**: 150x40 pixels
- **Format**: PNG
- **Style**: Digital display frame
- **Details**: Dark background with bright border

#### Ammo Bullet Icon
- **Filename**: `ui_ammo_bullet.png`
- **Dimensions**: 16x16 pixels
- **Format**: PNG with transparency
- **Style**: Simple bullet/shell representation
- **Details**: Yellow/gold coloring for active ammo

#### Score Display Background
- **Filename**: `ui_score_bg.png`
- **Dimensions**: 300x60 pixels
- **Format**: PNG
- **Style**: Retro arcade score display
- **Details**: Dark background with neon-style borders

### Particle Effects

#### Explosion Effect
- **Filename**: `explosion_frame_01.png` through `explosion_frame_08.png`
- **Dimensions**: 64x64 pixels each
- **Format**: PNG with transparency
- **Style**: Bright orange/yellow explosion
- **Details**: Classic arcade-style explosion, 8 frames total
- **Timing**: Each frame 60ms duration

#### Muzzle Flash
- **Filename**: `muzzle_flash.png`
- **Dimensions**: 32x16 pixels
- **Format**: PNG with transparency
- **Style**: Bright white/yellow flash
- **Details**: Directional sprite for tank turret firing

#### Spark Effect
- **Filename**: `spark_01.png` through `spark_04.png`
- **Dimensions**: 8x8 pixels each
- **Format**: PNG with transparency
- **Style**: Small bright sparks for projectile impacts
- **Details**: Various shapes for randomization

#### Smoke Puff
- **Filename**: `smoke_puff.png`
- **Dimensions**: 32x32 pixels
- **Format**: PNG with transparency
- **Style**: Gray smoke cloud
- **Details**: Soft edges, semi-transparent

### Menu and UI Graphics

#### Menu Background
- **Filename**: `menu_background.png`
- **Dimensions**: 1920x1080 pixels (scale down as needed)
- **Format**: PNG or JPG
- **Style**: Industrial/military theme
- **Details**: Dark, atmospheric background with subtle details

#### Logo
- **Filename**: `logo_pongtank_ii.png`
- **Dimensions**: 600x200 pixels
- **Format**: PNG with transparency
- **Style**: Retro arcade styling with modern effects
- **Details**: Metallic text with neon accents

#### Button Graphics
- **Filename**: `button_normal.png`, `button_hover.png`, `button_pressed.png`
- **Dimensions**: 200x50 pixels each
- **Format**: PNG
- **Style**: Industrial button design
- **Details**: Three states for interactive feedback

#### Name Entry Display
- **Filename**: `name_entry_bg.png`
- **Dimensions**: 400x100 pixels
- **Format**: PNG
- **Style**: Retro arcade high-score entry screen
- **Details**: Three character slots with cursor indicator

## Technical Requirements

### File Format Standards
- **Sprites**: PNG with transparency where needed
- **Backgrounds**: PNG or optimized JPG
- **Color Depth**: 32-bit RGBA or 24-bit RGB
- **Compression**: Optimize for web delivery while maintaining quality

### Performance Considerations
- **Sprite Sheets**: Combine small sprites into sheets where beneficial
- **Optimization**: Use web-optimized PNGs (tools like TinyPNG)
- **File Size**: Target <50KB per sprite sheet, <10KB per individual sprite
- **Loading**: All assets must support progressive loading

### Animation Specifications
- **Frame Rate**: All animations at 60 FPS (16.67ms per frame)
- **Timing**: Provide timing specifications for each animation
- **Looping**: Specify which animations loop and which play once
- **Interpolation**: Support for linear interpolation between frames

## Asset Organization

### Directory Structure
```
assets/
├── sprites/
│   ├── tanks/
│   │   ├── player_tank_body.png
│   │   ├── player_tank_turret.png
│   │   ├── enemy_tank_body.png
│   │   └── enemy_tank_turret.png
│   ├── projectiles/
│   │   ├── projectile_player.png
│   │   ├── projectile_enemy.png
│   │   └── projectile_trail.png
│   ├── environment/
│   │   ├── wall_tile.png
│   │   ├── floor_tile.png
│   │   ├── brick_destructible.png
│   │   └── brick_destroy_01-04.png
│   ├── powerups/
│   │   ├── powerup_health.png
│   │   ├── powerup_ammo.png
│   │   └── powerup_glow.png
│   ├── ui/
│   │   ├── ui_health_bg.png
│   │   ├── ui_health_fill.png
│   │   ├── ui_ammo_bg.png
│   │   ├── ui_ammo_bullet.png
│   │   └── ui_score_bg.png
│   ├── effects/
│   │   ├── explosion_frame_01-08.png
│   │   ├── muzzle_flash.png
│   │   ├── spark_01-04.png
│   │   └── smoke_puff.png
│   └── menu/
│       ├── menu_background.png
│       ├── logo_pongtank_ii.png
│       ├── button_normal.png
│       ├── button_hover.png
│       ├── button_pressed.png
│       └── name_entry_bg.png
```

### Naming Conventions
- Use lowercase with underscores
- Include frame numbers for animations: `_01`, `_02`, etc.
- State indicators: `_normal`, `_hover`, `_pressed`, `_active`
- Descriptive names that match functionality

## Style Reference Guidelines

### Visual Consistency
- Maintain consistent pixel density across all assets
- Use the defined color palette exclusively
- Ensure visual style cohesion between related elements
- Apply consistent lighting direction (top-left light source)

### Arcade Aesthetic
- Sharp, clean pixel art style
- High contrast for readability
- Bright, saturated colors for key gameplay elements
- Nostalgic 1980s arcade game visual language

### Industrial Theme
- Metallic textures and materials
- Mechanical, angular designs
- Weathered and battle-worn appearance
- Military/industrial color schemes

## Quality Assurance

### Asset Verification Checklist
- [ ] All sprites at correct dimensions
- [ ] Transparent backgrounds where specified
- [ ] Consistent pixel density
- [ ] Optimized file sizes
- [ ] Proper naming conventions
- [ ] Animation timing specifications included
- [ ] Color palette compliance
- [ ] Visual style consistency

### Testing Requirements
- Test all assets at different zoom levels
- Verify animations play smoothly at 60 FPS
- Confirm transparency renders correctly
- Validate file size targets are met
- Check cross-browser compatibility

## Delivery Format
- All assets delivered as individual PNG files
- Include sprite sheet versions where beneficial
- Provide timing data for all animations
- Include source files (PSD, AI, etc.) for future modifications
- Comprehensive asset manifest with dimensions and specifications

## Contact and Revisions
- All revisions must maintain technical specifications
- File naming must remain consistent
- Provide change logs for any modifications
- Maintain backup of all asset versions