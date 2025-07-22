import { _decorator, Component, Node, Prefab, instantiate, NodePool, warn, error } from 'cc';
import { AssetManager } from '../AssetManager';
const { ccclass } = _decorator;

interface PoolInfo {
    nodePool: NodePool;
    prefab: Prefab;
    spawned: Set<Node>;
}

@ccclass('ObjectPoolManager')
export class ObjectPoolManager extends Component {
    private static _instance: ObjectPoolManager | null = null;
    private _pools = new Map<string, PoolInfo>();

    public static get Instance(): ObjectPoolManager {
        if (!this._instance) {
            const node = new Node('ObjectPoolManager');
            this._instance = node.addComponent(ObjectPoolManager);
        }
        return this._instance;
    }

    protected onLoad(): void {
        if (ObjectPoolManager._instance && ObjectPoolManager._instance !== this) {
            this.node.destroy();
            return;
        }
        ObjectPoolManager._instance = this;
    }

    protected onDestroy(): void {
        if (ObjectPoolManager._instance === this) {
            ObjectPoolManager._instance = null;
        }
        this.clearAll();
    }

    /**
     * Spawn object - automatically creates pool if needed
     * @param prefabPath Path to prefab in resources
     * @param parent Parent node (optional)
     */
    public async spawn<T extends Node>(prefabPath: string, parent?: Node): Promise<T | null> {
        let pool = this._pools.get(prefabPath);

        if (!pool) {
            // Auto-create pool
            const prefab = await AssetManager.instance.loadAsync<Prefab>(prefabPath);
            if (!prefab) {
                error(`Failed to load prefab: ${prefabPath}`);
                return null;
            }

            pool = {
                nodePool: new NodePool(),
                prefab: prefab,
                spawned: new Set<Node>()
            };
            this._pools.set(prefabPath, pool);
        }

        // Get or create node
        let node = pool.nodePool.get() || instantiate(pool.prefab);

        if (parent) {
            parent.addChild(node);
        }

        node.active = true;
        pool.spawned.add(node);

        return node as T;
    }

    /**
     * Spawn multiple objects at once
     */
    public async spawnMultiple<T extends Node>(
        prefabPath: string,
        count: number,
        parent?: Node
    ): Promise<T[]> {
        const nodes: T[] = [];
        for (let i = 0; i < count; i++) {
            const node = await this.spawn<T>(prefabPath, parent);
            if (node) nodes.push(node);
        }
        return nodes;
    }

    /**
     * Recycle object back to pool
     */
    public recycle(node: Node): boolean {
        if (!node || !node.isValid) return false;

        // Find which pool this node belongs to
        for (const [path, pool] of this._pools) {
            if (pool.spawned.has(node)) {
                pool.spawned.delete(node);
                node.active = false;
                node.removeFromParent();
                pool.nodePool.put(node);
                return true;
            }
        }

        warn(`Node not found in any pool, destroying it`);
        node.destroy();
        return false;
    }

    /**
     * Recycle all spawned objects from a specific pool
     */
    public recycleAll(prefabPath: string): void {
        const pool = this._pools.get(prefabPath);
        if (!pool) return;

        const nodesToRecycle = Array.from(pool.spawned);
        nodesToRecycle.forEach(node => this.recycle(node));
    }

    /**
     * Pre-warm pool with objects
     */
    public async preWarm(prefabPath: string, count: number): Promise<void> {
        const nodes = await this.spawnMultiple(prefabPath, count);
        nodes.forEach(node => this.recycle(node));
    }

    /**
     * Get pool statistics
     */
    public getStats(prefabPath: string): { spawned: number; pooled: number } | null {
        const pool = this._pools.get(prefabPath);
        if (!pool) return null;

        return {
            spawned: pool.spawned.size,
            pooled: pool.nodePool.size()
        };
    }

    /**
     * Clear specific pool
     */
    public clear(prefabPath: string): void {
        const pool = this._pools.get(prefabPath);
        if (!pool) return;

        // Recycle all spawned objects first
        this.recycleAll(prefabPath);

        // Clear pool
        pool.nodePool.clear();
        this._pools.delete(prefabPath);
    }

    /**
     * Clear all pools
     */
    public clearAll(): void {
        for (const path of this._pools.keys()) {
            this.clear(path);
        }
    }

    /**
     * Check if object is from pool
     */
    public isPooled(node: Node): boolean {
        for (const pool of this._pools.values()) {
            if (pool.spawned.has(node)) return true;
        }
        return false;
    }
}

/**
 * Global helper functions for easy access
 */
export namespace Pool {
    /**
     * Spawn object from pool
     * @example
     * const enemy = await Pool.spawn<Enemy>("prefabs/Enemy", this.node);
     */
    export async function spawn<T extends Node>(prefabPath: string, parent?: Node): Promise<T | null> {
        return ObjectPoolManager.Instance.spawn<T>(prefabPath, parent);
    }

    /**
     * Spawn multiple objects
     * @example
     * const bullets = await Pool.spawnMultiple<Bullet>("prefabs/Bullet", 10, this.node);
     */
    export async function spawnMultiple<T extends Node>(
        prefabPath: string,
        count: number,
        parent?: Node
    ): Promise<T[]> {
        return ObjectPoolManager.Instance.spawnMultiple<T>(prefabPath, count, parent);
    }

    /**
     * Recycle object back to pool
     * @example
     * Pool.recycle(this.enemyNode);
     */
    export function recycle(node: Node): boolean {
        return ObjectPoolManager.Instance.recycle(node);
    }

    /**
     * Recycle all objects from specific pool
     * @example
     * Pool.recycleAll("prefabs/Enemy");
     */
    export function recycleAll(prefabPath: string): void {
        ObjectPoolManager.Instance.recycleAll(prefabPath);
    }

    /**
     * Pre-warm pool
     * @example
     * await Pool.preWarm("prefabs/Bullet", 50);
     */
    export async function preWarm(prefabPath: string, count: number): Promise<void> {
        return ObjectPoolManager.Instance.preWarm(prefabPath, count);
    }

    /**
     * Get pool statistics
     * @example
     * const stats = Pool.getStats("prefabs/Enemy");
     * console.log(`Spawned: ${stats.spawned}, Pooled: ${stats.pooled}`);
     */
    export function getStats(prefabPath: string): { spawned: number; pooled: number } | null {
        return ObjectPoolManager.Instance.getStats(prefabPath);
    }

    /**
     * Clear specific pool
     */
    export function clear(prefabPath: string): void {
        ObjectPoolManager.Instance.clear(prefabPath);
    }

    /**
     * Clear all pools
     */
    export function clearAll(): void {
        ObjectPoolManager.Instance.clearAll();
    }

    /**
     * Check if node is from pool
     */
    export function isPooled(node: Node): boolean {
        return ObjectPoolManager.Instance.isPooled(node);
    }
}