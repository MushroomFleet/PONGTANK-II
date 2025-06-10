# PONGTANK-II Development Handoff

## Project Overview
PONGTANK-II is a retro-inspired top-down tank game built entirely in HTML5/JavaScript. The game combines classic arcade mechanics with modern web technologies, featuring bouncing projectiles inspired by PONG, procedural maze generation, and strategic tank combat.

## Technical Architecture

### Core Architecture Pattern
Implement **Entity Component System (ECS)** architecture for optimal performance:

```javascript
// Core ECS Structure
class Entity {
    constructor(id) {
        this.id = id;
        this.components = new Map();
    }
}

class Component {
    constructor(type, data) {
        this.type = type;
        this.data = data;
    }
}

class System {
    update(entities, deltaTime) {
        // System-specific logic
    }
}
```

### Game Loop Implementation
Use **fixed timestep with variable rendering** for consistent physics:

```javascript
const FIXED_TIMESTEP = 16.67; // 60 FPS
let accumulator = 0;
let lastTime = 0;

function gameLoop(currentTime) {
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    accumulator += deltaTime;
    
    while (accumulator >= FIXED_TIMESTEP) {
        updateGame(FIXED_TIMESTEP);
        accumulator -= FIXED_TIMESTEP;
    }
    
    renderGame(accumulator / FIXED_TIMESTEP);
    requestAnimationFrame(gameLoop);
}
```

## Component System Design

### Core Components
```javascript
// Position Component
const Position = (x, y, rotation = 0) => ({ x, y, rotation });

// Velocity Component  
const Velocity = (vx, vy, angularVelocity = 0) => ({ vx, vy, angularVelocity });

// Health Component
const Health = (current, max) => ({ current, max });

// Collision Component
const Collision = (radius, type) => ({ radius, type });

// Weapon Component
const Weapon = (ammo, maxAmmo, cooldown, projectileSpeed) => ({ 
    ammo, maxAmmo, cooldown, projectileSpeed, lastFired: 0 
});

// AI Component
const AI = (state, target, lastKnownPosition, fireRate) => ({ 
    state, target, lastKnownPosition, fireRate, lastFired: 0 
});
```

### Entity Creation Patterns
```javascript
function createPlayerTank(x, y) {
    const entity = new Entity(generateId());
    entity.addComponent('position', Position(x, y));
    entity.addComponent('velocity', Velocity(0, 0));
    entity.addComponent('health', Health(100, 100));
    entity.addComponent('collision', Collision(15, 'player'));
    entity.addComponent('weapon', Weapon(3, 3, 500, 200));
    entity.addComponent('player', {});
    return entity;
}

function createEnemyTank(x, y) {
    const entity = new Entity(generateId());
    entity.addComponent('position', Position(x, y));
    entity.addComponent('velocity', Velocity(0, 0));
    entity.addComponent('health', Health(50, 50));
    entity.addComponent('collision', Collision(15, 'enemy'));
    entity.addComponent('weapon', Weapon(1, 1, 2000, 150));
    entity.addComponent('ai', AI('patrol', null, null, 2000));
    return entity;
}
```

## Game Systems Implementation

### 1. Movement System
```javascript
class MovementSystem extends System {
    update(entities, deltaTime) {
        entities.forEach(entity => {
            if (entity.hasComponents(['position', 'velocity'])) {
                const pos = entity.getComponent('position');
                const vel = entity.getComponent('velocity');
                
                // Apply movement
                pos.x += vel.vx * deltaTime / 1000;
                pos.y += vel.vy * deltaTime / 1000;
                pos.rotation += vel.angularVelocity * deltaTime / 1000;
                
                // Apply friction
                vel.vx *= 0.95;
                vel.vy *= 0.95;
                vel.angularVelocity *= 0.95;
            }
        });
    }
}
```

### 2. Input System
```javascript
class InputSystem extends System {
    constructor() {
        super();
        this.keys = {};
        this.mouse = { x: 0, y: 0, buttons: {} };
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });
        
        canvas.addEventListener('mousedown', (e) => {
            this.mouse.buttons[e.button] = true;
        });
    }
    
    update(entities, deltaTime) {
        entities.forEach(entity => {
            if (entity.hasComponent('player')) {
                this.handlePlayerInput(entity, deltaTime);
            }
        });
    }
    
    handlePlayerInput(entity, deltaTime) {
        const pos = entity.getComponent('position');
        const vel = entity.getComponent('velocity');
        const weapon = entity.getComponent('weapon');
        
        // Tank movement
        const MOVE_FORCE = 300;
        const TURN_FORCE = 180;
        
        if (this.keys['KeyW']) {
            vel.vx += Math.cos(pos.rotation) * MOVE_FORCE * deltaTime / 1000;
            vel.vy += Math.sin(pos.rotation) * MOVE_FORCE * deltaTime / 1000;
        }
        if (this.keys['KeyS']) {
            vel.vx -= Math.cos(pos.rotation) * MOVE_FORCE * deltaTime / 1000;
            vel.vy -= Math.sin(pos.rotation) * MOVE_FORCE * deltaTime / 1000;
        }
        if (this.keys['KeyA']) {
            vel.angularVelocity -= TURN_FORCE * deltaTime / 1000;
        }
        if (this.keys['KeyD']) {
            vel.angularVelocity += TURN_FORCE * deltaTime / 1000;
        }
        
        // Turret rotation (follows mouse)
        const turretAngle = Math.atan2(this.mouse.y - pos.y, this.mouse.x - pos.x);
        entity.turretRotation = turretAngle;
        
        // Shooting
        if (this.mouse.buttons[0] && weapon.ammo > 0) {
            const now = Date.now();
            if (now - weapon.lastFired > weapon.cooldown) {
                this.fireProjectile(entity, turretAngle);
                weapon.ammo--;
                weapon.lastFired = now;
            }
        }
    }
}
```

### 3. Collision System
```javascript
class CollisionSystem extends System {
    update(entities, deltaTime) {
        const collisionEntities = entities.filter(e => e.hasComponent('collision'));
        
        for (let i = 0; i < collisionEntities.length; i++) {
            for (let j = i + 1; j < collisionEntities.length; j++) {
                this.checkCollision(collisionEntities[i], collisionEntities[j]);
            }
        }
    }
    
    checkCollision(entityA, entityB) {
        const posA = entityA.getComponent('position');
        const posB = entityB.getComponent('position');
        const colA = entityA.getComponent('collision');
        const colB = entityB.getComponent('collision');
        
        const dx = posA.x - posB.x;
        const dy = posA.y - posB.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < colA.radius + colB.radius) {
            this.handleCollision(entityA, entityB);
        }
    }
    
    handleCollision(entityA, entityB) {
        // Implement collision response based on entity types
        const typeA = entityA.getComponent('collision').type;
        const typeB = entityB.getComponent('collision').type;
        
        if (typeA === 'projectile' && typeB === 'wall') {
            this.bounceProjectile(entityA, entityB);
        } else if (typeA === 'projectile' && typeB === 'brick') {
            this.destroyBrick(entityB);
            this.destroyProjectile(entityA);
        }
        // Add more collision handlers...
    }
    
    bounceProjectile(projectile, wall) {
        const proj = projectile.getComponent('projectile');
        proj.bounces++;
        
        if (proj.bounces >= 5) {
            this.destroyProjectile(projectile);
            return;
        }
        
        // Calculate reflection vector
        const vel = projectile.getComponent('velocity');
        const wallNormal = this.getWallNormal(wall);
        
        // Reflection formula: R = V - 2(V·N)N
        const dotProduct = vel.vx * wallNormal.x + vel.vy * wallNormal.y;
        vel.vx = vel.vx - 2 * dotProduct * wallNormal.x;
        vel.vy = vel.vy - 2 * dotProduct * wallNormal.y;
        
        // Apply energy loss
        vel.vx *= 0.9;
        vel.vy *= 0.9;
    }
}
```

### 4. AI System
```javascript
class AISystem extends System {
    update(entities, deltaTime) {
        entities.forEach(entity => {
            if (entity.hasComponent('ai')) {
                this.updateAI(entity, deltaTime);
            }
        });
    }
    
    updateAI(entity, deltaTime) {
        const ai = entity.getComponent('ai');
        const pos = entity.getComponent('position');
        const vel = entity.getComponent('velocity');
        const weapon = entity.getComponent('weapon');
        
        switch (ai.state) {
            case 'patrol':
                this.patrolBehavior(entity, deltaTime);
                break;
            case 'chase':
                this.chaseBehavior(entity, deltaTime);
                break;
            case 'attack':
                this.attackBehavior(entity, deltaTime);
                break;
        }
        
        // State transitions
        const player = this.findPlayer();
        if (player && this.hasLineOfSight(entity, player)) {
            ai.state = 'attack';
            ai.target = player;
            ai.lastKnownPosition = { 
                x: player.getComponent('position').x, 
                y: player.getComponent('position').y 
            };
        }
    }
    
    attackBehavior(entity, deltaTime) {
        const ai = entity.getComponent('ai');
        const weapon = entity.getComponent('weapon');
        
        if (ai.target && ai.lastKnownPosition) {
            // Aim at last known position
            const pos = entity.getComponent('position');
            const angle = Math.atan2(
                ai.lastKnownPosition.y - pos.y,
                ai.lastKnownPosition.x - pos.x
            );
            
            // Fire at intervals
            const now = Date.now();
            if (now - ai.lastFired > ai.fireRate && weapon.ammo > 0) {
                this.fireProjectile(entity, angle);
                weapon.ammo--;
                ai.lastFired = now;
            }
        }
    }
}
```

## Object Pooling Implementation

```javascript
class ObjectPool {
    constructor(createFn, resetFn, initialSize = 50) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.pool = [];
        this.active = [];
        
        // Pre-allocate objects
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.createFn());
        }
    }
    
    acquire() {
        let obj = this.pool.pop();
        if (!obj) {
            obj = this.createFn();
        }
        this.active.push(obj);
        return obj;
    }
    
    release(obj) {
        const index = this.active.indexOf(obj);
        if (index > -1) {
            this.active.splice(index, 1);
            this.resetFn(obj);
            this.pool.push(obj);
        }
    }
}

// Usage
const projectilePool = new ObjectPool(
    () => createProjectile(0, 0, 0),
    (proj) => {
        proj.getComponent('position').x = 0;
        proj.getComponent('position').y = 0;
        proj.getComponent('velocity').vx = 0;
        proj.getComponent('velocity').vy = 0;
        proj.getComponent('projectile').bounces = 0;
    }
);
```

## Maze Generation Algorithm

```javascript
class MazeGenerator {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.maze = [];
        this.initialize();
    }
    
    generate() {
        this.recursiveBacktrack(1, 1);
        this.addRooms();
        this.placeBricks();
        return this.maze;
    }
    
    recursiveBacktrack(x, y) {
        const directions = this.shuffleDirections();
        this.maze[y][x] = 0; // Mark as passage
        
        for (const [dx, dy] of directions) {
            const nx = x + dx * 2;
            const ny = y + dy * 2;
            
            if (this.isValid(nx, ny) && this.maze[ny][nx] === 1) {
                this.maze[y + dy][x + dx] = 0; // Remove wall
                this.recursiveBacktrack(nx, ny);
            }
        }
    }
    
    addRooms() {
        // Add strategic rooms for gameplay variety
        const roomCount = Math.floor((this.width * this.height) / 400);
        for (let i = 0; i < roomCount; i++) {
            this.createRoom();
        }
    }
    
    placeBricks() {
        // Place destructible bricks in strategic locations
        for (let y = 1; y < this.height - 1; y++) {
            for (let x = 1; x < this.width - 1; x++) {
                if (this.maze[y][x] === 0 && Math.random() < 0.1) {
                    this.maze[y][x] = 2; // Brick
                }
            }
        }
    }
}
```

## Game State Management

```javascript
class GameStateManager {
    constructor() {
        this.states = new Map();
        this.currentState = null;
        this.nextState = null;
    }
    
    addState(name, state) {
        this.states.set(name, state);
    }
    
    changeState(name, data = {}) {
        this.nextState = { name, data };
    }
    
    update(deltaTime) {
        if (this.nextState) {
            if (this.currentState) {
                this.currentState.exit();
            }
            this.currentState = this.states.get(this.nextState.name);
            this.currentState.enter(this.nextState.data);
            this.nextState = null;
        }
        
        if (this.currentState) {
            this.currentState.update(deltaTime);
        }
    }
    
    render(ctx, interpolation) {
        if (this.currentState) {
            this.currentState.render(ctx, interpolation);
        }
    }
}

// Game States
class MenuState {
    enter(data) {
        this.selectedOption = 0;
        this.playerName = ['A', 'A', 'A'];
        this.nameIndex = 0;
    }
    
    update(deltaTime) {
        // Handle name input logic
    }
    
    render(ctx, interpolation) {
        // Render menu UI
    }
}

class PlayingState {
    enter(data) {
        this.world = new World();
        this.setupLevel();
    }
    
    update(deltaTime) {
        this.world.update(deltaTime);
    }
    
    render(ctx, interpolation) {
        this.world.render(ctx, interpolation);
    }
}
```

## Performance Optimization Guidelines

### Rendering Optimizations
1. **Use multiple canvas layers**: Static background, dynamic objects, UI
2. **Implement dirty rectangle tracking**: Only redraw changed areas
3. **Pre-render complex sprites**: Use offscreen canvas for complex graphics
4. **Minimize context state changes**: Batch similar drawing operations

### Memory Management
1. **Object pooling**: Pre-allocate 100 projectiles, 50 particles, 20 enemies
2. **Avoid object creation in hot paths**: Reuse temporary objects
3. **Clean up event listeners**: Remove listeners when entities are destroyed
4. **Monitor garbage collection**: Target <50MB total memory usage

### JavaScript Optimizations
1. **Use typed arrays**: For large numeric datasets
2. **Minimize closure creation**: In frequently called functions
3. **Cache frequently accessed properties**: Avoid repeated property lookups
4. **Use bitwise operations**: For flags and simple math

## Performance Targets
- **Frame Rate**: Maintain 60 FPS with 100+ active entities
- **Memory Usage**: Keep below 50MB total allocation
- **Load Time**: Initial load under 2 seconds
- **Input Latency**: Sub-16ms input response time

## Testing Requirements
1. **Cross-browser compatibility**: Chrome, Firefox, Safari, Edge
2. **Performance testing**: With 100+ entities active
3. **Memory leak detection**: Extended gameplay sessions
4. **Input responsiveness**: All input combinations work correctly

## File Structure
```
pongtank-ii/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── core/
│   │   ├── engine.js
│   │   ├── entity.js
│   │   └── component.js
│   ├── systems/
│   │   ├── movement.js
│   │   ├── collision.js
│   │   ├── ai.js
│   │   └── rendering.js
│   ├── components/
│   │   └── components.js
│   ├── utils/
│   │   ├── pool.js
│   │   ├── maze.js
│   │   └── math.js
│   └── main.js
└── assets/
    ├── sprites/
    ├── sounds/
    └── data/
```

## Integration Notes
- All asset references should use the exact filenames provided by the art team
- Implement asset preloading before game start
- Use event-driven architecture for clean separation between systems
- Maintain consistent coordinate system (0,0 at top-left)
- Scale factors should be configurable for different screen sizes

## Next Steps
1. Implement core ECS framework
2. Create basic game loop with fixed timestep
3. Implement player tank with movement and shooting
4. Add collision detection and projectile bouncing
5. Create AI system for enemy tanks
6. Implement maze generation
7. Add powerup system and scoring
8. Create game state management
9. Optimize performance and add visual polish
10. Test across all target platforms