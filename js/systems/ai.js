// AI System for PONGTANK-II
// Enhanced enemy tank behavior with state machine

import { Position, Velocity, Projectile } from '../core/components.js';

export class AISystem {
    update(world, deltaTime) {
        const enemies = world.getEntitiesWith('ai', 'position');
        
        enemies.forEach(enemy => {
            this.updateAI(world, enemy, deltaTime);
        });
    }
    
    updateAI(world, enemy, deltaTime) {
        const ai = enemy.getComponent('ai');
        const pos = enemy.getComponent('position');
        const vel = enemy.getComponent('velocity');
        const weapon = enemy.getComponent('weapon');
        
        // Update state timer
        ai.stateTimer += deltaTime;
        
        // Find player
        const player = world.player;
        if (!player) return;
        
        const playerPos = player.getComponent('position');
        const distanceToPlayer = world.getDistance(pos.x, pos.y, playerPos.x, playerPos.y);
        
        // State machine logic
        switch (ai.state) {
            case 'patrol':
                this.patrolBehavior(enemy, deltaTime);
                
                // Transition to chase if player is nearby
                if (distanceToPlayer < 200 && this.hasLineOfSight(world, enemy, player)) {
                    ai.state = 'chase';
                    ai.target = player;
                    ai.stateTimer = 0;
                }
                break;
                
            case 'chase':
                this.chaseBehavior(world, enemy, player, deltaTime);
                
                // Transition to attack if close enough
                if (distanceToPlayer < 150) {
                    ai.state = 'attack';
                    ai.stateTimer = 0;
                } else if (distanceToPlayer > 300 || ai.stateTimer > 5000) {
                    // Lost player or chased too long
                    ai.state = 'patrol';
                    ai.target = null;
                    ai.stateTimer = 0;
                }
                break;
                
            case 'attack':
                this.attackBehavior(world, enemy, player, deltaTime);
                
                // Transition back to chase if player moves away
                if (distanceToPlayer > 200) {
                    ai.state = 'chase';
                    ai.stateTimer = 0;
                } else if (!this.hasLineOfSight(world, enemy, player)) {
                    ai.state = 'patrol';
                    ai.target = null;
                    ai.stateTimer = 0;
                }
                break;
        }
        
        // Regenerate ammo
        if (weapon.ammo <= 0) {
            weapon.ammo = 1;
        }
    }
    
    patrolBehavior(enemy, deltaTime) {
        const ai = enemy.getComponent('ai');
        const pos = enemy.getComponent('position');
        const vel = enemy.getComponent('velocity');
        
        // Random movement every 2 seconds
        if (ai.stateTimer > 2000) {
            const angle = Math.random() * Math.PI * 2;
            const force = 30;
            
            vel.vx += Math.cos(angle) * force;
            vel.vy += Math.sin(angle) * force;
            
            // Update tank rotation to face movement direction
            if (Math.abs(vel.vx) > 5 || Math.abs(vel.vy) > 5) {
                pos.rotation = Math.atan2(vel.vy, vel.vx);
            }
            
            ai.stateTimer = 0;
        }
    }
    
    chaseBehavior(world, enemy, player, deltaTime) {
        const pos = enemy.getComponent('position');
        const vel = enemy.getComponent('velocity');
        const playerPos = player.getComponent('position');
        
        // Move towards player
        const dx = playerPos.x - pos.x;
        const dy = playerPos.y - pos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            const force = 80;
            vel.vx += (dx / distance) * force * deltaTime / 1000;
            vel.vy += (dy / distance) * force * deltaTime / 1000;
            
            // Face movement direction
            pos.rotation = Math.atan2(dy, dx);
        }
    }
    
    attackBehavior(world, enemy, player, deltaTime) {
        const ai = enemy.getComponent('ai');
        const pos = enemy.getComponent('position');
        const vel = enemy.getComponent('velocity');
        const weapon = enemy.getComponent('weapon');
        const playerPos = player.getComponent('position');
        
        // Stop moving and aim
        vel.vx *= 0.8;
        vel.vy *= 0.8;
        
        // Calculate aim angle with some prediction
        const playerVel = player.getComponent('velocity');
        const predictTime = 0.5; // Predict 0.5 seconds ahead
        const predictedX = playerPos.x + playerVel.vx * predictTime;
        const predictedY = playerPos.y + playerVel.vy * predictTime;
        
        const aimAngle = Math.atan2(predictedY - pos.y, predictedX - pos.x);
        
        // Face target
        pos.rotation = aimAngle;
        
        // Fire at intervals
        const now = Date.now();
        if (now - ai.lastFired > ai.fireRate && weapon.ammo > 0) {
            // Add some inaccuracy
            const accuracy = 0.95; // 95% accuracy
            const finalAngle = aimAngle + (Math.random() - 0.5) * (1 - accuracy);
            
            this.fireProjectile(world, enemy, finalAngle);
            weapon.ammo--;
            ai.lastFired = now;
        }
    }
    
    hasLineOfSight(world, enemy, player) {
        const enemyPos = enemy.getComponent('position');
        const playerPos = player.getComponent('position');
        
        // Simple line-of-sight check using raycasting
        const dx = playerPos.x - enemyPos.x;
        const dy = playerPos.y - enemyPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.floor(distance / 16); // Check every 16 pixels
        
        for (let i = 1; i < steps; i++) {
            const t = i / steps;
            const checkX = enemyPos.x + dx * t;
            const checkY = enemyPos.y + dy * t;
            
            // Check if this point intersects with any walls
            const walls = world.getEntitiesWith('wall');
            for (const wall of walls) {
                const wallPos = wall.getComponent('position');
                const wallCol = wall.getComponent('collision');
                
                const wallDx = checkX - wallPos.x;
                const wallDy = checkY - wallPos.y;
                const wallDistance = Math.sqrt(wallDx * wallDx + wallDy * wallDy);
                
                if (wallDistance < wallCol.radius) {
                    return false; // Line of sight blocked
                }
            }
        }
        
        return true; // Clear line of sight
    }
    
    fireProjectile(world, shooter, angle) {
        const pos = shooter.getComponent('position');
        const speed = 300; // Slower than player projectiles
        const projX = pos.x + Math.cos(angle) * 20;
        const projY = pos.y + Math.sin(angle) * 20;
        
        // Use object pool for enemy projectiles
        const projectile = world.poolManager.acquire('projectiles');
        projectile.addComponent('position', Position(projX, projY))
                  .addComponent('velocity', Velocity(
                      Math.cos(angle) * speed,
                      Math.sin(angle) * speed
                  ))
                  .addComponent('collision', { 
                      radius: 4, 
                      type: 'enemyProjectile' 
                  })
                  .addComponent('projectile', Projectile(0, 5, 5000)); // 5 second TTL
        
        world.addEntity(projectile);
    }
}
