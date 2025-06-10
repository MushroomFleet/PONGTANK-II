// Main Game Loop and Initialization for PONGTANK-II v1.0.0
import { World, GameStateManager, FIXED_TIMESTEP } from './core/engine.js';
import { MovementSystem } from './systems/movement.js';
import { InputSystem } from './systems/input.js';
import { CollisionSystem } from './systems/collision.js';
import { AISystem } from './systems/ai.js';
import { RenderSystem } from './systems/rendering.js';

// Game state
let gameState = 'menu';
let playerName = ['A', 'A', 'A'];
let nameIndex = 0;
let lastTime = 0;
let accumulator = 0;

// Game objects
let world = null;
let systems = [];
let canvas = null;
let ctx = null;

// UI Elements
let healthFill, scoreValue, streakValue, ammoDisplay, menuOverlay;

// Initialize the game
function initGame() {
    // Get canvas and context
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Get UI elements
    healthFill = document.getElementById('healthFill');
    scoreValue = document.getElementById('scoreValue');
    streakValue = document.getElementById('streakValue');
    ammoDisplay = document.getElementById('ammoDisplay');
    menuOverlay = document.getElementById('menuOverlay');
    
    // Create world and systems
    world = new World();
    
    // Initialize systems
    const inputSystem = new InputSystem();
    const movementSystem = new MovementSystem();
    const collisionSystem = new CollisionSystem();
    const aiSystem = new AISystem();
    const renderSystem = new RenderSystem(canvas, ctx);
    
    systems = [
        inputSystem,
        movementSystem,
        collisionSystem,
        aiSystem,
        renderSystem
    ];
    
    // Setup menu input handling
    setupMenuInput(inputSystem);
    
    // Update UI
    world.updateUI();
    
    console.log('PONGTANK-II v1.0.0 initialized');
    console.log('Pool stats:', world.getPoolStats());
}

function setupMenuInput(inputSystem) {
    // Override keydown for menu handling
    const originalKeyHandler = inputSystem.keys;
    
    document.addEventListener('keydown', (e) => {
        if (gameState === 'menu') {
            handleMenuInput(e.code);
        }
    });
}

function handleMenuInput(code) {
    if (code === 'ArrowLeft') {
        nameIndex = Math.max(0, nameIndex - 1);
    } else if (code === 'ArrowRight') {
        nameIndex = Math.min(2, nameIndex + 1);
    } else if (code === 'ArrowUp') {
        const char = playerName[nameIndex];
        playerName[nameIndex] = String.fromCharCode(((char.charCodeAt(0) - 65 + 1) % 26) + 65);
    } else if (code === 'ArrowDown') {
        const char = playerName[nameIndex];
        playerName[nameIndex] = String.fromCharCode(((char.charCodeAt(0) - 65 + 25) % 26) + 65);
    } else if (code === 'Enter') {
        startGame();
    }
    
    updateNameDisplay();
}

function updateNameDisplay() {
    for (let i = 0; i < 3; i++) {
        const charElement = document.getElementById(`char${i}`);
        if (charElement) {
            charElement.textContent = playerName[i];
            charElement.className = i === nameIndex ? 'name-char active' : 'name-char';
        }
    }
}

function startGame() {
    gameState = 'playing';
    if (menuOverlay) {
        menuOverlay.classList.add('hidden');
    }
    
    // Reset world for new game
    world = new World();
    world.updateUI();
    
    console.log(`Game started! Player: ${playerName.join('')}`);
    console.log('Enhanced features active:');
    console.log('- Reduced turning rate (60°/s)');
    console.log('- Projectile TTL (6 seconds)');
    console.log('- Sector-based maze generation');
    console.log('- Object pooling enabled');
    console.log('- Enhanced AI with state machine');
}

function gameLoop(currentTime) {
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    accumulator += deltaTime;
    
    // Fixed timestep updates
    while (accumulator >= FIXED_TIMESTEP) {
        if (gameState === 'playing' && world) {
            // Update all systems
            systems.forEach(system => {
                if (system.update) {
                    system.update(world, FIXED_TIMESTEP);
                }
            });
        }
        accumulator -= FIXED_TIMESTEP;
    }
    
    // Always render (even in menu)
    if (gameState === 'playing' && world) {
        const renderSystem = systems.find(s => s instanceof RenderSystem);
        if (renderSystem) {
            renderSystem.render(world);
        }
    }
    
    requestAnimationFrame(gameLoop);
}

// Performance monitoring
function logPerformanceStats() {
    if (world) {
        const stats = world.getPoolStats();
        console.log('Performance Stats:');
        console.log('- Entities:', world.entities.length);
        console.log('- Pool usage:', stats);
        console.log('- Memory usage:', (performance.memory ? 
            `${Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)}MB` : 
            'N/A'));
    }
}

// Start the game when page loads
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    requestAnimationFrame(gameLoop);
    
    // Log performance stats every 10 seconds
    setInterval(logPerformanceStats, 10000);
});

// Export for debugging
window.PONGTANK = {
    world: () => world,
    systems: () => systems,
    gameState: () => gameState,
    stats: () => world ? world.getPoolStats() : null
};
