// Collision System for PONGTANK-II
// Handles collision detection, projectile bouncing, and time-to-live mechanics

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../core/engine.js';

export class CollisionSystem {
    update(world, deltaTime) {
        const entities = world.getEntitiesWith('position', 'collision');
        
        // Check entity-to-entity collisions
        for (let i = 0; i < entities.length; i++) {
            for (let j = i + 1; j < entities.length; j++) {
                this.checkCollision(world, entities[i], entities[j]);
            }
        }
        
        // Handle projectile bounds, bouncing, and time-to-live
        const projectiles = world.getEntitiesWith('projectile');
        projectiles.forEach(proj => {
            this.updateProjectile(world, proj, deltaTime);
        });
    }
    
    updateProjectile(world, projectile, deltaTime) {
        const pos = projectile.getComponent('position');
        const vel = projectile.getComponent('velocity');
        const projComp = projectile.getComponent('projectile');
        
        // Check time-to-live
        const now = Date.now();
        const timeAlive = now - projComp.spawnTime;
        
        // Start warning effect at 80% of lifetime
        if (timeAlive > projComp.timeToLive * 0.8 && !projComp.warningStarted) {
            projComp.warningStarted = true;
        }
        
        // Despawn if TTL exceeded
        if (timeAlive > projComp.timeToLive) {
            world.removeEntity(projectile.id);
            this.checkAmmoRegeneration(world);
            return;
        }
        
        // Check bounds and apply bouncing
        let bounced = false;
        
        if (pos.x <= 0 || pos.x >= CANVAS_WIDTH) {
            vel.vx *= -0.9;
            bounced = true;
        }
        
        if (pos.y <= 0 || pos.y >= CANVAS_HEIGHT) {
            vel.vy *= -0.9;
            bounced = true;
        }
        
        if (bounced) {
            projComp.bounces++;
            if (projComp.bounces >= projComp.maxBounces) {
                world.removeEntity(projectile.id);
                this.checkAmmoRegeneration(world);
            }
        }
    }
    
    checkCollision(world, entityA, entityB) {
        // Validate entities and components exist before processing
        if (!entityA || !entityB || !entityA.active || !entityB.active) {
            return;
        }
        
        const posA = entityA.getComponent('position');
        const posB = entityB.getComponent('position');
        const colA = entityA.getComponent('collision');
        const colB = entityB.getComponent('collision');
        
        // Check if any components are missing (entity may have been pooled)
        if (!posA || !posB || !colA || !colB) {
            return;
        }
        
        const dx = posA.x - posB.x;
        const dy = posA.y - posB.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < colA.radius + colB.radius) {
            this.handleCollision(world, entityA, entityB);
        }
    }
    
    handleCollision(world, entityA, entityB) {
        const typeA = entityA.getComponent('collision').type;
        const typeB = entityB.getComponent('collision').type;
        
        // Projectile collisions
        if (typeA.includes('Projectile') || typeB.includes('Projectile')) {
            const projectile = typeA.includes('Projectile') ? entityA : entityB;
            const target = typeA.includes('Projectile') ? entityB : entityA;
            const targetType = target.getComponent('collision').type;
            
            if (targetType === 'wall') {
                this.bounceProjectile(world, projectile, target);
            } else if (targetType === 'brick') {
                world.removeEntity(target.id);
                world.removeEntity(projectile.id);
                world.addScore(10);
                
                // Chance to spawn powerup
                if (Math.random() < 0.3) {
                    const pos = target.getComponent('position');
                    world.spawnPowerup(pos.x, pos.y);
                }
                
                this.checkAmmoRegeneration(world);
            } else if (targetType === 'player' && projectile.getComponent('collision').type === 'enemyProjectile') {
                this.damageEntity(world, target, 20);
                world.removeEntity(projectile.id);
                world.resetStreak();
                this.checkAmmoRegeneration(world);
            } else if (targetType === 'enemy' && projectile.getComponent('collision').type === 'playerProjectile') {
                this.damageEntity(world, target, 25);
                world.removeEntity(projectile.id);
                world.addScore(50);
                this.checkAmmoRegeneration(world);
            }
        }
        
        // Powerup collection
        if ((typeA === 'player' && typeB === 'powerup') || (typeA === 'powerup' && typeB === 'player')) {
            const player = typeA === 'player' ? entityA : entityB;
            const powerup = typeA === 'powerup' ? entityA : entityB;
            
            this.collectPowerup(world, player, powerup);
            world.removeEntity(powerup.id);
        }
    }
    
    bounceProjectile(world, projectile, wall) {
        const projComp = projectile.getComponent('projectile');
        const vel = projectile.getComponent('velocity');
        
        projComp.bounces++;
        
        if (projComp.bounces >= projComp.maxBounces) {
            world.removeEntity(projectile.id);
            this.checkAmmoRegeneration(world);
            return;
        }
        
        // Calculate reflection based on wall position
        const pos = projectile.getComponent('position');
        const wallPos = wall.getComponent('position');
        
        const dx = pos.x - wallPos.x;
        const dy = pos.y - wallPos.y;
        
        // Determine which face of the wall was hit
        if (Math.abs(dx) > Math.abs(dy)) {
            vel.vx *= -0.9; // Horizontal bounce with energy loss
        } else {
            vel.vy *= -0.9; // Vertical bounce with energy loss
        }
    }
    
    damageEntity(world, entity, damage) {
        const health = entity.getComponent('health');
        health.current = Math.max(0, health.current - damage);
        
        if (health.current <= 0) {
            if (entity.hasComponent('player')) {
                // Player died - trigger game over
                const menuOverlay = document.getElementById('menuOverlay');
                if (menuOverlay) {
                    menuOverlay.classList.remove('hidden');
                    menuOverlay.innerHTML = `
                        <div class="menu-title">GAME OVER</div>
                        <div class="menu-subtitle">Final Score: ${world.score}</div>
                        <div class="instructions">Press F5 to restart</div>
                    `;
                }
            } else {
                // Enemy died
                world.removeEntity(entity.id);
                world.addScore(100);
                
                // Spawn new enemy after delay
                setTimeout(() => {
                    if (world.getEntitiesWith('enemy').length < 2) {
                        world.spawnEnemies();
                    }
                }, 5000);
            }
        }
        
        world.updateUI();
    }
    
    collectPowerup(world, player, powerup) {
        const powerupComp = powerup.getComponent('powerup');
        
        if (powerupComp.type === 'health') {
            const health = player.getComponent('health');
            health.current = Math.min(health.max, health.current + powerupComp.value);
        } else if (powerupComp.type === 'ammo') {
            const weapon = player.getComponent('weapon');
            weapon.maxAmmo = 6; // Double ammo capacity
            weapon.ammo = weapon.maxAmmo;
            
            // Reset to normal after duration
            setTimeout(() => {
                if (weapon.maxAmmo > 3) {
                    weapon.maxAmmo = 3;
                    weapon.ammo = Math.min(weapon.ammo, weapon.maxAmmo);
                    world.updateUI();
                }
            }, powerupComp.duration);
        }
        
        world.updateUI();
    }
    
    checkAmmoRegeneration(world) {
        // Regenerate ammo when all player projectiles are gone
        const playerProjectiles = world.getEntitiesWith('playerProjectile');
        if (playerProjectiles.length === 0 && world.player) {
            const weapon = world.player.getComponent('weapon');
            weapon.ammo = weapon.maxAmmo;
            world.updateUI();
        }
    }
}
