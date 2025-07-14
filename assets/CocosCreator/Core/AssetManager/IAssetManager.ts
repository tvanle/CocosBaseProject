import { Asset, Node } from 'cc';

export interface IAssetManager {
    /**
     * Load a single asset by key
     * @param key The key/path of the asset to load
     * @returns Promise that resolves to the loaded asset
     */
    loadAsync<T extends Asset>(key: string): Promise<T>;

    /**
     * Load a single asset synchronously (from cache or resources)
     * @param key The key/path of the asset to load
     * @returns The loaded asset or null if not found
     */
    load<T extends Asset>(key: string): T | null;

    /**
     * Load a component by key and return instantiated prefab
     * @param key The key/path of the prefab to load
     * @returns Promise that resolves to instantiated component
     */
    loadComponent<T extends Node>(key: string): Promise<T>;

    /**
     * Preload assets by keys
     * @param keys Array of asset keys to preload
     * @returns Promise that resolves when all assets are preloaded
     */
    preloadAsync(keys: string[]): Promise<void>;

    /**
     * Release asset by key
     * @param key The key of the asset to release
     */
    release(key: string): void;

    /**
     * Release all assets
     */
    releaseAll(): void;

    /**
     * Check if asset is loaded
     * @param key The key of the asset to check
     * @returns True if asset is loaded
     */
    isLoaded(key: string): boolean;
}