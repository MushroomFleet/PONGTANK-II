// Entity Component System - Entity class
export class Entity {
    constructor() {
        this.id = Math.random().toString(36).substr(2, 9);
        this.components = new Map();
        this.active = true;
    }
    
    addComponent(type, data) {
        this.components.set(type, data);
        return this;
    }
    
    getComponent(type) {
        return this.components.get(type);
    }
    
    hasComponent(type) {
        return this.components.has(type);
    }
    
    removeComponent(type) {
        this.components.delete(type);
    }
    
    hasComponents(types) {
        return types.every(type => this.hasComponent(type));
    }
}
