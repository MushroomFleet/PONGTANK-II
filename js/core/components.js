// Component Definitions for PONGTANK-II

// Basic transform and physics components
export const Position = (x, y, rotation = 0) => ({ x, y, rotation });
export const Velocity = (vx, vy, angular = 0) => ({ vx, vy, angular });
export const Collision = (radius, type) => ({ radius, type });

// Entity state components
export const Health = (current, max) => ({ current, max });
export const Weapon = (ammo, maxAmmo, cooldown) => ({ ammo, maxAmmo, cooldown, lastFired: 0 });

// Enhanced projectile component with time-to-live
export const Projectile = (bounces = 0, maxBounces = 5, timeToLive = 6000) => ({ 
    bounces, 
    maxBounces, 
    timeToLive,
    spawnTime: Date.now(),
    warningStarted: false
});

// AI and behavior components
export const AI = (state, target, lastSeen, fireRate) => ({ 
    state, 
    target, 
    lastSeen, 
    fireRate, 
    lastFired: 0,
    patrolTarget: null,
    stateTimer: 0
});

export const Powerup = (type, value, duration = 0) => ({ type, value, duration });

// Entity type markers
export const Player = () => ({ turretRotation: 0 });
export const Enemy = () => ({});
export const Wall = () => ({});
export const Brick = () => ({});

// Rendering components
export const Sprite = (color, size) => ({ color, size });
export const Particle = (lifeTime, color, size) => ({ 
    lifeTime, 
    maxLifeTime: lifeTime, 
    color, 
    size 
});

// Pool management component
export const Pooled = (poolName) => ({ poolName, inUse: false });
