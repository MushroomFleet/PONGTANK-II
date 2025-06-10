// Object Pooling System for PONGTANK-II
// Reduces garbage collection by reusing objects

export class ObjectPool {
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
    
    releaseAll() {
        while (this.active.length > 0) {
            this.release(this.active[0]);
        }
    }
    
    getActiveCount() {
        return this.active.length;
    }
    
    getPoolSize() {
        return this.pool.length;
    }
}

// Pool Manager - manages multiple pools
export class PoolManager {
    constructor() {
        this.pools = new Map();
    }
    
    createPool(name, createFn, resetFn, initialSize = 50) {
        this.pools.set(name, new ObjectPool(createFn, resetFn, initialSize));
    }
    
    acquire(poolName) {
        const pool = this.pools.get(poolName);
        if (!pool) {
            throw new Error(`Pool '${poolName}' does not exist`);
        }
        return pool.acquire();
    }
    
    release(poolName, obj) {
        const pool = this.pools.get(poolName);
        if (pool) {
            pool.release(obj);
        }
    }
    
    getPool(name) {
        return this.pools.get(name);
    }
    
    getStats() {
        const stats = {};
        for (const [name, pool] of this.pools) {
            stats[name] = {
                active: pool.getActiveCount(),
                pooled: pool.getPoolSize()
            };
        }
        return stats;
    }
}
