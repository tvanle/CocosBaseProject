import { Node } from 'cc';
import { ComponentManager, ComponentConstructor } from './ComponentManager';
import { TagManager } from './TagManager';
import { IEntityComponent } from './IEntityComponent';

/**
 * Entity - A container for components and tags
 */
export class Entity {
    public readonly id: number;
    public readonly node: Node;
    public active: boolean = true;
    public name: string;
    
    private _components: ComponentManager;
    private _tags: TagManager;
    private _manager: any; // EntityManager reference
    
    constructor(id: number, node: Node, manager: any) {
        this.id = id;
        this.node = node;
        this.name = `Entity_${id}`;
        this._manager = manager;
        this._components = new ComponentManager(this);
        this._tags = new TagManager();
    }
    
    // ===== Component Management =====
    
    /**
     * Add component shorthand
     */
    add<T extends IEntityComponent>(ComponentClass: ComponentConstructor<T>, data?: Partial<T>): T {
        const component = this._components.add(ComponentClass, data);
        this._manager.trackComponent(ComponentClass.name, this);
        return component;
    }
    
    /**
     * Get component shorthand
     */
    get<T extends IEntityComponent>(ComponentClass: ComponentConstructor<T>): T | null {
        return this._components.get(ComponentClass);
    }
    
    /**
     * Remove component shorthand
     */
    remove<T extends IEntityComponent>(ComponentClass: ComponentConstructor<T>): boolean {
        const removed = this._components.remove(ComponentClass);
        if (removed) {
            this._manager.untrackComponent(ComponentClass.name, this);
        }
        return removed;
    }
    
    /**
     * Check if has component
     */
    has<T extends IEntityComponent>(ComponentClass: ComponentConstructor<T>): boolean {
        return this._components.has(ComponentClass);
    }
    
    /**
     * Get component manager for advanced usage
     */
    get components(): ComponentManager {
        return this._components;
    }
    
    // ===== Tag Management =====
    
    /**
     * Add tag shorthand
     */
    tag(tag: string): Entity {
        if (this._tags.add(tag)) {
            this._manager.trackTag(tag, this);
        }
        return this;
    }
    
    /**
     * Remove tag shorthand
     */
    untag(tag: string): Entity {
        if (this._tags.remove(tag)) {
            this._manager.untrackTag(tag, this);
        }
        return this;
    }
    
    /**
     * Check if has tag
     */
    hasTag(tag: string): boolean {
        return this._tags.has(tag);
    }
    
    /**
     * Get tag manager for advanced usage
     */
    get tags(): TagManager {
        return this._tags;
    }
    
    // ===== Lifecycle =====
    
    /**
     * Update entity and all components
     */
    update(dt: number): void {
        if (!this.active) return;
        this._components.update(dt);
    }
    
    /**
     * Enable entity
     */
    enable(): void {
        this.active = true;
        this.node.active = true;
    }
    
    /**
     * Disable entity
     */
    disable(): void {
        this.active = false;
        this.node.active = false;
    }
    
    /**
     * Destroy entity
     */
    destroy(): void {
        // Clear components
        this._components.clear();
        
        // Clear tags
        const allTags = this._tags.getAll();
        allTags.forEach(tag => {
            this._manager.untrackTag(tag, this);
        });
        this._tags.clear();
        
        // Remove from manager
        this._manager.destroyEntity(this);
    }
    
    // ===== Utilities =====
    
    /**
     * Clone this entity (creates new entity with same components/tags)
     */
    async clone(parent?: Node): Promise<Entity> {
        const cloned = await this._manager.createEntity(this.node['_archetype'], parent);
        
        // Clone components
        for (const component of this._components.getAll()) {
            const ComponentClass = component.constructor as ComponentConstructor;
            const data = { ...component };
            delete data.entity;
            cloned.add(ComponentClass, data);
        }
        
        // Clone tags
        cloned.tags.addMultiple(...this._tags.getAll());
        
        return cloned;
    }
    
    /**
     * Get debug info
     */
    getDebugInfo(): string {
        return `Entity[${this.id}] "${this.name}" - Components: [${this._components.getNames().join(', ')}], Tags: [${this._tags.getAll().join(', ')}]`;
    }
    
    /**
     * Chain-friendly component operations
     */
    with<T extends IEntityComponent>(ComponentClass: ComponentConstructor<T>, data?: Partial<T>): Entity {
        this.add(ComponentClass, data);
        return this;
    }
    
    without<T extends IEntityComponent>(ComponentClass: ComponentConstructor<T>): Entity {
        this.remove(ComponentClass);
        return this;
    }
}