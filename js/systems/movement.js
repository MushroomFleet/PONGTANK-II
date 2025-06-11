// Movement System for PONGTANK-II
// Handles entity movement, physics, and bounds checking

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../core/engine.js';

export class MovementSystem {
    update(world, deltaTime) {
        const entities = world.getEntitiesWith('position', 'velocity');
        
        entities.forEach(entity => {
            const pos = entity.getComponent('position');
            const vel = entity.getComponent('velocity');
            
            // Apply movement
            pos.x += vel.vx * deltaTime / 1000;
            pos.y += vel.vy * deltaTime / 1000;
            pos.rotation += vel.angular * deltaTime / 1000;
            
            // Apply friction (but not to projectiles - they maintain constant speed)
            if (!entity.hasComponent('projectile')) {
                vel.vx *= 0.95;
                vel.vy *= 0.95;
                vel.angular *= 0.95;
            }
            
            // Keep entities in bounds
            pos.x = Math.max(20, Math.min(CANVAS_WIDTH - 20, pos.x));
            pos.y = Math.max(20, Math.min(CANVAS_HEIGHT - 20, pos.y));
            
            // Normalize rotation
            pos.rotation = pos.rotation % (Math.PI * 2);
            if (pos.rotation < 0) {
                pos.rotation += Math.PI * 2;
            }
        });
    }
}
