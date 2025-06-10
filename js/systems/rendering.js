// Rendering System for PONGTANK-II
// Handles all game rendering with performance optimizations

import { CANVAS_WIDTH, CANVAS_HEIGHT, TILE_SIZE, MAZE_WIDTH, MAZE_HEIGHT } from '../core/engine.js';

export class RenderSystem {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
    }
    
    update(world, deltaTime) {
        this.render(world);
    }
    
    render(world) {
        // Clear canvas with dark background
        this.ctx.fillStyle = '#111111';
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Draw maze floor pattern
        this.drawFloorPattern();
        
        // Draw walls
        this.drawWalls(world);
        
        // Draw bricks
        this.drawBricks(world);
        
        // Draw powerups
        this.drawPowerups(world);
        
        // Draw player
        if (world.player) {
            this.drawTank(world.player, '#00AA00');
        }
        
        // Draw enemies
        const enemies = world.getEntitiesWith('enemy', 'position');
        enemies.forEach(enemy => {
            this.drawTank(enemy, '#AA0000');
        });
        
        // Draw projectiles
        this.drawProjectiles(world);
        
        // Draw debug info if needed
        // this.drawDebugInfo(world);
    }
    
    drawFloorPattern() {
        this.ctx.fillStyle = '#222222';
        for (let y = 0; y < MAZE_HEIGHT; y++) {
            for (let x = 0; x < MAZE_WIDTH; x++) {
                if ((x + y) % 2 === 0) {
                    this.ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                }
            }
        }
    }
    
    drawWalls(world) {
        const walls = world.getEntitiesWith('wall', 'position');
        this.ctx.fillStyle = '#444444';
        this.ctx.strokeStyle = '#666666';
        this.ctx.lineWidth = 1;
        
        walls.forEach(wall => {
            const pos = wall.getComponent('position');
            this.ctx.fillRect(pos.x - 16, pos.y - 16, 32, 32);
            this.ctx.strokeRect(pos.x - 16, pos.y - 16, 32, 32);
        });
    }
    
    drawBricks(world) {
        const bricks = world.getEntitiesWith('brick', 'position');
        this.ctx.fillStyle = '#8B4513';
        this.ctx.strokeStyle = '#CD853F';
        this.ctx.lineWidth = 1;
        
        bricks.forEach(brick => {
            const pos = brick.getComponent('position');
            this.ctx.fillRect(pos.x - 16, pos.y - 16, 32, 32);
            this.ctx.strokeRect(pos.x - 16, pos.y - 16, 32, 32);
        });
    }
    
    drawPowerups(world) {
        const powerups = world.getEntitiesWith('powerup', 'position');
        
        powerups.forEach(powerup => {
            const pos = powerup.getComponent('position');
            const comp = powerup.getComponent('powerup');
            
            // Pulsing effect
            const pulse = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
            const radius = 12 * pulse;
            
            this.ctx.fillStyle = comp.type === 'health' ? '#00FF00' : '#FF0000';
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Symbol
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(comp.type === 'health' ? '+' : 'A', pos.x, pos.y + 4);
        });
    }
    
    drawProjectiles(world) {
        const projectiles = world.getEntitiesWith('projectile', 'position');
        
        projectiles.forEach(proj => {
            const pos = proj.getComponent('position');
            const projComp = proj.getComponent('projectile');
            const isPlayer = proj.hasComponent('playerProjectile');
            
            // Base color
            let color = isPlayer ? '#FFFF00' : '#FF4444';
            
            // Warning effect for TTL
            if (projComp.warningStarted) {
                const timeAlive = Date.now() - projComp.spawnTime;
                const timeLeft = projComp.timeToLive - timeAlive;
                const warningIntensity = Math.sin(timeLeft * 0.01) * 0.5 + 0.5;
                
                if (isPlayer) {
                    color = warningIntensity > 0.5 ? '#FFFF00' : '#FF8800';
                } else {
                    color = warningIntensity > 0.5 ? '#FF4444' : '#FF8888';
                }
            }
            
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Glow effect
            this.ctx.shadowColor = color;
            this.ctx.shadowBlur = 10;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
            
            // Trail effect for fast projectiles
            const vel = proj.getComponent('velocity');
            const speed = Math.sqrt(vel.vx * vel.vx + vel.vy * vel.vy);
            if (speed > 200) {
                const trailLength = Math.min(speed * 0.1, 20);
                const angle = Math.atan2(vel.vy, vel.vx);
                
                this.ctx.strokeStyle = color;
                this.ctx.lineWidth = 2;
                this.ctx.globalAlpha = 0.3;
                this.ctx.beginPath();
                this.ctx.moveTo(pos.x, pos.y);
                this.ctx.lineTo(
                    pos.x - Math.cos(angle) * trailLength,
                    pos.y - Math.sin(angle) * trailLength
                );
                this.ctx.stroke();
                this.ctx.globalAlpha = 1;
            }
        });
    }
    
    drawTank(tank, color) {
        const pos = tank.getComponent('position');
        const health = tank.getComponent('health');
        
        this.ctx.save();
        this.ctx.translate(pos.x, pos.y);
        
        // Draw tank body
        this.ctx.rotate(pos.rotation);
        this.ctx.fillStyle = color;
        this.ctx.fillRect(-15, -10, 30, 20);
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(-15, -10, 30, 20);
        
        this.ctx.restore();
        
        // Draw turret
        this.ctx.save();
        this.ctx.translate(pos.x, pos.y);
        
        if (tank.hasComponent('player')) {
            const player = tank.getComponent('player');
            this.ctx.rotate(player.turretRotation);
        } else {
            this.ctx.rotate(pos.rotation);
        }
        
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, -3, 20, 6);
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(0, -3, 20, 6);
        
        this.ctx.restore();
        
        // Draw health bar if damaged
        if (health && health.current < health.max) {
            const barWidth = 30;
            const barHeight = 4;
            
            this.ctx.fillStyle = '#FF0000';
            this.ctx.fillRect(pos.x - barWidth/2, pos.y - 25, barWidth, barHeight);
            
            this.ctx.fillStyle = '#00FF00';
            const healthPercent = health.current / health.max;
            this.ctx.fillRect(pos.x - barWidth/2, pos.y - 25, barWidth * healthPercent, barHeight);
        }
        
        // Draw state indicator for enemies
        if (tank.hasComponent('ai')) {
            const ai = tank.getComponent('ai');
            this.ctx.fillStyle = this.getStateColor(ai.state);
            this.ctx.beginPath();
            this.ctx.arc(pos.x + 20, pos.y - 20, 3, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    getStateColor(state) {
        switch (state) {
            case 'patrol': return '#00FF00';
            case 'chase': return '#FFFF00';
            case 'attack': return '#FF0000';
            default: return '#FFFFFF';
        }
    }
    
    drawDebugInfo(world) {
        // Draw pool statistics
        const stats = world.getPoolStats();
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'left';
        
        let y = 20;
        this.ctx.fillText('Pool Stats:', 10, y);
        y += 15;
        
        for (const [poolName, poolStats] of Object.entries(stats)) {
            this.ctx.fillText(`${poolName}: ${poolStats.active}/${poolStats.pooled}`, 10, y);
            y += 15;
        }
        
        // Draw entity count
        this.ctx.fillText(`Total Entities: ${world.entities.length}`, 10, y);
    }
}
