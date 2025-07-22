import { IEntityComponent } from './IEntityComponent';
import { Entity } from './Entity';

export type ComponentConstructor<T extends IEntityComponent = IEntityComponent> = new() => T;

/**
 * Manages components for an entity
 */
export class ComponentManager {
    private components = new Map<string, IEntityComponent>();
    private entity: Entity;
    
    constructor(entity: Entity) {
        this.entity = entity;
    }
    
    /**
     * Add a component to the entity
     */
    add<T extends IEntityComponent>(
        ComponentClass: ComponentConstructor<T>, 
        data?: Partial<T>
    ): T {
        const name = ComponentClass.name;
        
        // Check if already exists
        const existing = this.components.get(name) as T;
        if (existing) {
            console.warn(`Component ${name} already exists on entity ${this.entity.id}`);
            return existing;
        }
        
        // Create new component
        const component = new ComponentClass();
        component.entity = this.entity;
        component.enabled = true;
        
        // Apply initial data
        if (data) {
            Object.assign(component, data);
        }
        
        // Store component
        this.components.set(name, component);
        
        // Lifecycle callbacks
        component.onAttach?.(this.entity);
        component.onEnable?.();
        
        return component;
    }
    
    /**
     * Get a component
     */
    get<T extends IEntityComponent>(ComponentClass: ComponentConstructor<T>): T | null {
        return this.components.get(ComponentClass.name) as T || null;
    }
    
    /**
     * Remove a component
     */
    remove<T extends IEntityComponent>(ComponentClass: ComponentConstructor<T>): boolean {
        const name = ComponentClass.name;
        const component = this.components.get(name);
        
        if (!component) return false;
        
        // Lifecycle callbacks
        component.onDisable?.();
        component.onDetach?.();
        
        // Remove from map
        this.components.delete(name);
        
        return true;
    }
    
    /**
     * Check if has component
     */
    has<T extends IEntityComponent>(ComponentClass: ComponentConstructor<T>): boolean {
        return this.components.has(ComponentClass.name);
    }
    
    /**
     * Get all components
     */
    getAll(): IEntityComponent[] {
        return Array.from(this.components.values());
    }
    
    /**
     * Get all component names
     */
    getNames(): string[] {
        return Array.from(this.components.keys());
    }
    
    /**
     * Enable/disable a component
     */
    setEnabled<T extends IEntityComponent>(ComponentClass: ComponentConstructor<T>, enabled: boolean): void {
        const component = this.get(ComponentClass);
        if (component && component.enabled !== enabled) {
            component.enabled = enabled;
            if (enabled) {
                component.onEnable?.();
            } else {
                component.onDisable?.();
            }
        }
    }
    
    /**
     * Update all components
     */
    update(dt: number): void {
        for (const component of this.components.values()) {
            if (component.enabled !== false) {
                component.update?.(dt);
            }
        }
    }
    
    /**
     * Clear all components
     */
    clear(): void {
        // Call lifecycle for all components
        for (const component of this.components.values()) {
            component.onDisable?.();
            component.onDetach?.();
        }
        
        // Clear map
        this.components.clear();
    }
}