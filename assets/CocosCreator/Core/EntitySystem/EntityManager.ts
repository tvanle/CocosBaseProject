import { _decorator, Component, Node } from 'cc';
import { Pool } from '../ObjectPool/ObjectPoolManager';
import { Entity } from './Core/Entity';
import { IEntityComponent } from './Core/IEntityComponent';
import { ComponentConstructor } from './Core/ComponentManager';

const { ccclass } = _decorator;

// Re-export core types
export { Entity } from './Core';
export type { ComponentConstructor } from './Core/ComponentManager';

// Query builder for fluent API
export class EntityQuery {
    private manager: EntityManager;
    private componentFilters: string[] = [];
    private tagFilters: string[] = [];
    private excludeComponents: string[] = [];
    private excludeTags: string[] = [];

    constructor(manager: EntityManager) {
        this.manager = manager;
    }

    // Filter by components
    withComponents(...ComponentClasses: ComponentConstructor[]): EntityQuery {
        this.componentFilters.push(...ComponentClasses.map(c => c.name));
        return this;
    }

    // Filter by tags
    withTags(...tags: string[]): EntityQuery {
        this.tagFilters.push(...tags);
        return this;
    }

    // Exclude components
    withoutComponents(...ComponentClasses: ComponentConstructor[]): EntityQuery {
        this.excludeComponents.push(...ComponentClasses.map(c => c.name));
        return this;
    }

    // Exclude tags
    withoutTags(...tags: string[]): EntityQuery {
        this.excludeTags.push(...tags);
        return this;
    }

    // Execute query
    execute(): Entity[] {
        let results = Array.from(this.manager.getAllEntities());

        // Filter by required components
        if (this.componentFilters.length > 0) {
            results = results.filter(entity => {
                // Check if entity has all required components by name
                const componentNames = entity.components.getNames();
                return this.componentFilters.every(comp => componentNames.indexOf(comp) !== -1);
            });
        }

        // Filter by required tags
        if (this.tagFilters.length > 0) {
            results = results.filter(entity =>
                this.tagFilters.every(tag => entity.hasTag(tag))
            );
        }

        // Filter by excluded components
        if (this.excludeComponents.length > 0) {
            results = results.filter(entity => {
                const componentNames = entity.components.getNames();
                return !this.excludeComponents.some(comp => componentNames.indexOf(comp) !== -1);
            });
        }

        // Filter by excluded tags
        if (this.excludeTags.length > 0) {
            results = results.filter(entity =>
                !this.excludeTags.some(tag => entity.hasTag(tag))
            );
        }

        return results.filter(e => e.active);
    }

    // Get first match
    first(): Entity | null {
        const results = this.execute();
        return results.length > 0 ? results[0] : null;
    }

    // Count matches
    count(): number {
        return this.execute().length;
    }

    // Execute action on all matches
    forEach(action: (entity: Entity) => void): void {
        this.execute().forEach(action);
    }
}

@ccclass('EntityManager')
export class EntityManager extends Component {
    private static _instance: EntityManager | null = null;
    private nextEntityId = 0;
    private entities = new Map<number, Entity>();
    private componentIndex = new Map<string, Set<Entity>>();
    private tagIndex = new Map<string, Set<Entity>>();
    private entityPools = new Map<string, string>(); // archetype -> prefab path

    public static get instance(): EntityManager {
        if (!this._instance) {
            const node = new Node('EntityManager');
            this._instance = node.addComponent(EntityManager);
        }
        return this._instance;
    }

    protected onLoad(): void {
        if (EntityManager._instance && EntityManager._instance !== this) {
            this.destroy();
            return;
        }
        EntityManager._instance = this;
    }

    protected onDestroy(): void {
        if (EntityManager._instance === this) {
            EntityManager._instance = null;
        }
        this.destroyAllEntities();
    }

    // Register entity archetype with prefab
    registerArchetype(archetype: string, prefabPath: string): void {
        this.entityPools.set(archetype, prefabPath);
    }

    // Create entity from archetype
    async createEntity(archetype?: string, parent?: Node): Promise<Entity> {
        let node: Node;

        if (archetype && this.entityPools.has(archetype)) {
            // Use object pool
            const prefabPath = this.entityPools.get(archetype)!;
            node = await Pool.spawn<Node>(prefabPath, parent) || new Node();
        } else {
            // Create new node
            node = new Node('Entity_' + this.nextEntityId);
            if (parent) {
                parent.addChild(node);
            }
        }

        // Create entity
        const entity = new Entity(this.nextEntityId++, node, this);
        this.entities.set(entity.id, entity);

        // Store archetype info for recycling
        if (archetype) {
            node['_archetype'] = archetype;
        }

        return entity;
    }

    // Create multiple entities
    async createEntities(archetype: string, count: number, parent?: Node): Promise<Entity[]> {
        const entities: Entity[] = [];
        for (let i = 0; i < count; i++) {
            entities.push(await this.createEntity(archetype, parent));
        }
        return entities;
    }

    // Destroy entity
    destroyEntity(entity: Entity): void {
        // Remove from all component indexes
        const componentNames = entity.components.getNames();
        for (const componentName of componentNames) {
            this.componentIndex.get(componentName)?.delete(entity);
        }

        // Remove from all tag indexes
        const tags = entity.tags.getAll();
        for (const tag of tags) {
            this.tagIndex.get(tag)?.delete(entity);
        }

        // Remove from entities map
        this.entities.delete(entity.id);

        // Recycle node if from pool
        const archetype = entity.node['_archetype'];
        if (archetype && this.entityPools.has(archetype)) {
            Pool.recycle(entity.node);
        } else {
            entity.node.destroy();
        }
    }

    // Destroy all entities
    destroyAllEntities(): void {
        const allEntities = Array.from(this.entities.values());
        allEntities.forEach(entity => entity.destroy());
    }

    // Get entity by ID
    getEntity(id: number): Entity | null {
        return this.entities.get(id) || null;
    }

    // Get all entities
    getAllEntities(): Entity[] {
        return Array.from(this.entities.values());
    }

    // Query builder
    query(): EntityQuery {
        return new EntityQuery(this);
    }

    // Quick queries
    getEntitiesWithComponent<T extends IEntityComponent>(ComponentClass: ComponentConstructor<T>): Entity[] {
        const componentName = ComponentClass.name;
        return Array.from(this.componentIndex.get(componentName) || []).filter(e => e.active);
    }

    getEntitiesWithTag(tag: string): Entity[] {
        return Array.from(this.tagIndex.get(tag) || []).filter(e => e.active);
    }

    // Component tracking
    trackComponent(componentName: string, entity: Entity): void {
        if (!this.componentIndex.has(componentName)) {
            this.componentIndex.set(componentName, new Set());
        }
        this.componentIndex.get(componentName)!.add(entity);
    }

    untrackComponent(componentName: string, entity: Entity): void {
        this.componentIndex.get(componentName)?.delete(entity);
    }

    // Tag tracking
    trackTag(tag: string, entity: Entity): void {
        if (!this.tagIndex.has(tag)) {
            this.tagIndex.set(tag, new Set());
        }
        this.tagIndex.get(tag)!.add(entity);
    }

    untrackTag(tag: string, entity: Entity): void {
        this.tagIndex.get(tag)?.delete(entity);
    }

    // Update all entities
    update(dt: number): void {
        for (const entity of this.entities.values()) {
            entity.update(dt);
        }
    }
}

// Global helper
export const Entities = {
    // Get manager instance
    get manager(): EntityManager {
        return EntityManager.instance;
    },

    // Create entity
    async create(archetype?: string, parent?: Node): Promise<Entity> {
        return EntityManager.instance.createEntity(archetype, parent);
    },

    // Create multiple
    async createMultiple(archetype: string, count: number, parent?: Node): Promise<Entity[]> {
        return EntityManager.instance.createEntities(archetype, count, parent);
    },

    // Query
    query(): EntityQuery {
        return EntityManager.instance.query();
    },

    // Register archetype
    registerArchetype(archetype: string, prefabPath: string): void {
        EntityManager.instance.registerArchetype(archetype, prefabPath);
    },

    // Quick queries
    withComponent<T extends IEntityComponent>(ComponentClass: ComponentConstructor<T>): Entity[] {
        return EntityManager.instance.getEntitiesWithComponent(ComponentClass);
    },

    withTag(tag: string): Entity[] {
        return EntityManager.instance.getEntitiesWithTag(tag);
    }
};