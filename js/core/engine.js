// Game Engine and World Management for PONGTANK-II
import { Entity } from './entity.js';
import { Position, Velocity, Collision, Health, Weapon, Player, Enemy, Wall, Brick, Powerup } from './components.js';
import { MazeGenerator } from '../utils/maze-generator.js';
import { PoolManager } from '../utils/object-pool.js';

// Game constants
export const CANVAS_WIDTH = 1024;
export const CANVAS_HEIGHT = 768;
export const FIXED_TIMESTEP = 16.67; // 60 FPS
export const TILE_SIZE = 32;
export const MAZE_WIDTH = Math.floor(CANVAS_WIDTH / TILE_SIZE);
export const MAZE_HEIGHT = Math.floor(CANVAS_HEIGHT / TILE_SIZE);

export class World {
    constructor() {
        this.entities = [];
        this.systems = [];
        this.maze = [];
        this.score = 0;
        this.streak = 1;
        this.lastScoreTime = 0;
        this.player = null;
        this.powerupSpawnTimer = 0;
        this.enemySpawnTimer = 0;
        
        // Initialize object pools
        this.poolManager = new PoolManager();
        this.initializePools();
        
        // Generate improved maze
        this.generateMaze();
        this.createPlayer();
        this.spawnEnemies();
    }
    
    initializePools() {
        // Projectile pool
        this.poolManager.createPool('projectiles', 
            () => new Entity(),
            (entity) => {
                entity.components.clear();
                entity.active = true;
            },
            100
        );
        
        // Particle pool
        this.poolManager.createPool('particles',
            () => new Entity(),
            (entity) => {
                entity.components.clear();
                entity.active = true;
            },
            200
        );
        
        // Enemy pool
        this.poolManager.createPool('enemies',
            () => new Entity(),
            (entity) => {
                entity.components.clear();
                entity.active = true;
            },
            20
        );
        
        // Powerup pool
        this.poolManager.createPool('powerups',
            () => new Entity(),
            (entity) => {
                entity.components.clear();
                entity.active = true;
            },
            10
        );
    }
    
    addEntity(entity) {
        this.entities.push(entity);
        return entity;
    }
    
    removeEntity(entityId) {
        const entity = this.entities.find(e => e.id === entityId);
        if (entity) {
            // Return pooled entities to their pools
            if (entity.hasComponent('projectile')) {
                this.poolManager.release('projectiles', entity);
            } else if (entity.hasComponent('particle')) {
                this.poolManager.release('particles', entity);
            } else if (entity.hasComponent('enemy')) {
                this.poolManager.release('enemies', entity);
            } else if (entity.hasComponent('powerup')) {
                this.poolManager.release('powerups', entity);
            }
            
            this.entities = this.entities.filter(e => e.id !== entityId);
        }
    }
    
    getEntitiesWith(...components) {
        return this.entities.filter(entity => 
            components.every(comp => entity.hasComponent(comp))
        );
    }
    
    generateMaze() {
        const generator = new MazeGenerator(MAZE_WIDTH, MAZE_HEIGHT, TILE_SIZE);
        this.maze = generator.generate();
        
        // Create wall and brick entities from maze data
        for (let y = 0; y < MAZE_HEIGHT; y++) {
            for (let x = 0; x < MAZE_WIDTH; x++) {
                const cellType = this.maze[y][x];
                const worldX = x * TILE_SIZE + TILE_SIZE / 2;
                const worldY = y * TILE_SIZE + TILE_SIZE / 2;
                
                if (cellType === 1) {
                    this.createWall(worldX, worldY);
                } else if (cellType === 2) {
                    this.createBrick(worldX, worldY);
                }
            }
        }
        
        // Store generator reference for spawn positions
        this.mazeGenerator = generator;
    }
    
    createWall(x, y) {
        return this.addEntity(new Entity()
            .addComponent('position', Position(x, y))
            .addComponent('collision', Collision(TILE_SIZE/2, 'wall'))
            .addComponent('wall', Wall()));
    }
    
    createBrick(x, y) {
        return this.addEntity(new Entity()
            .addComponent('position', Position(x, y))
            .addComponent('collision', Collision(TILE_SIZE/2, 'brick'))
            .addComponent('brick', Brick()));
    }
    
    createPlayer() {
        // Find a good spawn position in center
        let playerX = CANVAS_WIDTH / 2;
        let playerY = CANVAS_HEIGHT / 2;
        
        // Try to find a clear spawn position
        const spawnPositions = this.mazeGenerator.findSpawnPositions(1);
        if (spawnPositions.length > 0) {
            playerX = spawnPositions[0].x;
            playerY = spawnPositions[0].y;
        }
        
        this.player = this.addEntity(new Entity()
            .addComponent('position', Position(playerX, playerY))
            .addComponent('velocity', Velocity(0, 0))
            .addComponent('collision', Collision(15, 'player'))
            .addComponent('health', Health(100, 100))
            .addComponent('weapon', Weapon(3, 3, 500))
            .addComponent('player', Player()));
    }
    
    spawnEnemies() {
        const spawnPositions = this.mazeGenerator.findSpawnPositions(4);
        const numEnemies = Math.min(3, spawnPositions.length - 1); // Reserve one for player
        
        for (let i = 0; i < numEnemies; i++) {
            if (i + 1 < spawnPositions.length) {
                const pos = spawnPositions[i + 1];
                
                const enemy = this.poolManager.acquire('enemies');
                enemy.addComponent('position', Position(pos.x, pos.y))
                     .addComponent('velocity', Velocity(0, 0))
                     .addComponent('collision', Collision(15, 'enemy'))
                     .addComponent('health', Health(50, 50))
                     .addComponent('weapon', Weapon(1, 1, 2000))
                     .addComponent('ai', { 
                         state: 'patrol', 
                         target: null, 
                         lastSeen: null, 
                         fireRate: 2000,
                         lastFired: 0,
                         patrolTarget: null,
                         stateTimer: 0
                     })
                     .addComponent('enemy', Enemy());
                
                this.addEntity(enemy);
            }
        }
    }
    
    spawnPowerup(x, y) {
        const type = Math.random() < 0.5 ? 'health' : 'ammo';
        const value = type === 'health' ? 50 : 3;
        const duration = type === 'ammo' ? 30000 : 0;
        
        const powerup = this.poolManager.acquire('powerups');
        powerup.addComponent('position', Position(x, y))
               .addComponent('collision', Collision(12, 'powerup'))
               .addComponent('powerup', Powerup(type, value, duration));
        
        this.addEntity(powerup);
    }
    
    getDistance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }
    
    addScore(points) {
        const now = Date.now();
        if (now - this.lastScoreTime < 3000) {
            this.streak = Math.min(this.streak + 0.5, 5);
        } else {
            this.streak = 1;
        }
        
        this.score += Math.floor(points * this.streak);
        this.lastScoreTime = now;
        this.updateUI();
    }
    
    resetStreak() {
        this.streak = 1;
        this.updateUI();
    }
    
    updateUI() {
        if (this.player) {
            const health = this.player.getComponent('health');
            const weapon = this.player.getComponent('weapon');
            
            const healthFill = document.getElementById('healthFill');
            const scoreValue = document.getElementById('scoreValue');
            const streakValue = document.getElementById('streakValue');
            const ammoDisplay = document.getElementById('ammoDisplay');
            
            if (healthFill) {
                healthFill.style.width = `${(health.current / health.max) * 100}%`;
            }
            if (scoreValue) {
                scoreValue.textContent = this.score;
            }
            if (streakValue) {
                streakValue.textContent = this.streak.toFixed(1);
            }
            if (ammoDisplay) {
                const bullets = ammoDisplay.children;
                for (let i = 0; i < bullets.length; i++) {
                    bullets[i].className = i < weapon.ammo ? 'ammo-bullet' : 'ammo-bullet empty';
                }
            }
        }
    }
    
    getPoolStats() {
        return this.poolManager.getStats();
    }
}

// Game State Manager
export class GameStateManager {
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
            if (this.currentState) {
                this.currentState.enter(this.nextState.data);
            }
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
