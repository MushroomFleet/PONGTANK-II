// Input System for PONGTANK-II
// Handles player input with improved tank controls

import { Entity } from '../core/entity.js';
import { Position, Velocity, Projectile } from '../core/components.js';

export class InputSystem {
    constructor() {
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
        
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            canvas.addEventListener('mousemove', (e) => {
                const rect = canvas.getBoundingClientRect();
                this.mouse.x = e.clientX - rect.left;
                this.mouse.y = e.clientY - rect.top;
            });
            
            canvas.addEventListener('mousedown', (e) => {
                this.mouse.buttons[e.button] = true;
            });
            
            canvas.addEventListener('mouseup', (e) => {
                this.mouse.buttons[e.button] = false;
            });
        }
    }
    
    update(world, deltaTime) {
        const player = world.player;
        if (!player) return;
        
        const pos = player.getComponent('position');
        const vel = player.getComponent('velocity');
        const weapon = player.getComponent('weapon');
        const playerComp = player.getComponent('player');
        
        // Tank movement with reduced turning rate
        const MOVE_FORCE = 300;
        const TURN_FORCE = 60; // Reduced from 180 to 60 degrees/second
        
        if (this.keys['KeyW']) {
            vel.vx += Math.cos(pos.rotation) * MOVE_FORCE * deltaTime / 1000;
            vel.vy += Math.sin(pos.rotation) * MOVE_FORCE * deltaTime / 1000;
        }
        if (this.keys['KeyS']) {
            vel.vx -= Math.cos(pos.rotation) * MOVE_FORCE * deltaTime / 1000;
            vel.vy -= Math.sin(pos.rotation) * MOVE_FORCE * deltaTime / 1000;
        }
        if (this.keys['KeyA']) {
            vel.angular -= TURN_FORCE * deltaTime / 1000;
        }
        if (this.keys['KeyD']) {
            vel.angular += TURN_FORCE * deltaTime / 1000;
        }
        
        // Turret rotation follows mouse
        playerComp.turretRotation = Math.atan2(
            this.mouse.y - pos.y,
            this.mouse.x - pos.x
        );
        
        // Shooting
        if (this.mouse.buttons[0] && weapon.ammo > 0) {
            const now = Date.now();
            if (now - weapon.lastFired > weapon.cooldown) {
                this.fireProjectile(world, player, playerComp.turretRotation);
                weapon.ammo--;
                weapon.lastFired = now;
                world.updateUI();
            }
        }
    }
    
    fireProjectile(world, shooter, angle) {
        const pos = shooter.getComponent('position');
        const speed = 400;
        const projX = pos.x + Math.cos(angle) * 20;
        const projY = pos.y + Math.sin(angle) * 20;
        const isPlayer = shooter.hasComponent('player');
        
        // Use object pool for projectiles
        const projectile = world.poolManager.acquire('projectiles');
        projectile.addComponent('position', Position(projX, projY))
                  .addComponent('velocity', Velocity(
                      Math.cos(angle) * speed,
                      Math.sin(angle) * speed
                  ))
                  .addComponent('collision', { 
                      radius: 4, 
                      type: isPlayer ? 'playerProjectile' : 'enemyProjectile' 
                  })
                  .addComponent('projectile', Projectile(0, 5, 6000)); // 6 second TTL
        
        if (isPlayer) {
            projectile.addComponent('playerProjectile', {});
        }
        
        world.addEntity(projectile);
    }
    
    handleMenuInput(code, gameState) {
        // Menu input handling will be moved to a separate menu system
        return gameState;
    }
}
