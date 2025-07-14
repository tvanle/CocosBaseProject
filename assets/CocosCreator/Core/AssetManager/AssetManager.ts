import { Asset, instantiate, Node, Prefab, resources, SpriteFrame } from 'cc';

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

export class AssetManager implements IAssetManager {
    private static _instance: AssetManager;
    private _loadedAssets: Map<string, Asset> = new Map();
    private _loadingPromises: Map<string, Promise<any>> = new Map();

    public static get instance(): AssetManager {
        if (!this._instance) {
            this._instance = new AssetManager();
        }
        return this._instance;
    }

    private constructor() {}

    /**
     * Load asset asynchronously
     * Similar to Unity's LoadAssetAsync<T>
     */
    public async loadAsync<T extends Asset>(key: string): Promise<T> {
        // Check if asset is already loaded
        if (this._loadedAssets.has(key)) {
            return this._loadedAssets.get(key) as T;
        }

        // Check if asset is currently loading
        if (this._loadingPromises.has(key)) {
            return this._loadingPromises.get(key) as Promise<T>;
        }

        // Start loading asset
        const loadPromise = new Promise<T>((resolve, reject) => {
            // Try to load from resources first (similar to Resources.Load)
            const resourcePath = `prefab/UI/${key}`;

            resources.load(resourcePath, (err: Error | null, asset: Asset) => {
                if (err) {
                    // If not found in resources, try direct path
                    resources.load(key, (err2: Error | null, asset2: Asset) => {
                        if (err2) {
                            console.error(`Failed to load asset: ${key}`, err2);
                            reject(err2);
                        } else {
                            this._loadedAssets.set(key, asset2);
                            resolve(asset2 as T);
                        }
                    });
                } else {
                    this._loadedAssets.set(key, asset);
                    resolve(asset as T);
                }
            });
        });

        this._loadingPromises.set(key, loadPromise);

        try {
            const result = await loadPromise;
            this._loadingPromises.delete(key);
            return result;
        } catch (error) {
            this._loadingPromises.delete(key);
            throw error;
        }
    }

    /**
     * Load asset synchronously from cache or resources
     * Similar to Unity's ForceLoadAsset<T>
     */
    public load<T extends Asset>(key: string): T | null {
        // Check cache first
        if (this._loadedAssets.has(key)) {
            return this._loadedAssets.get(key) as T;
        }

        // Try to load synchronously from resources
        try {
            const resourcePath = `prefab/UI/${key}`;
            let asset = resources.get(resourcePath) as T;

            if (!asset) {
                asset = resources.get(key) as T;
            }

            if (asset) {
                this._loadedAssets.set(key, asset);
                return asset;
            }
        } catch (error) {
            console.warn(`Failed to load asset synchronously: ${key}`, error);
        }

        return null;
    }

    /**
     * Load component and instantiate prefab
     * Similar to Unity's LoadComponent<T> with Instantiate
     */
    public async loadComponent<T extends Node>(key: string): Promise<T> {
        const prefab = await this.loadAsync<Prefab>(key);
        if (!prefab) {
            throw new Error(`Failed to load prefab: ${key}`);
        }

        const instance = instantiate(prefab);
        return instance as T;
    }

    /**
     * Preload multiple assets
     * Similar to Unity's PreloadAsync
     */
    public async preloadAsync(keys: string[]): Promise<void> {
        const promises = keys.map(key => this.loadAsync(key));
        await Promise.all(promises);
    }

    /**
     * Release asset by key
     * Similar to Unity's ReleaseAsset
     */
    public release(key: string): void {
        if (this._loadedAssets.has(key)) {
            const asset = this._loadedAssets.get(key);
            if (asset) {
                asset.destroy();
            }
            this._loadedAssets.delete(key);
        }
    }

    /**
     * Release all loaded assets
     */
    public releaseAll(): void {
        for (const [key, asset] of this._loadedAssets) {
            if (asset && asset.isValid) {
                asset.destroy();
            }
        }
        this._loadedAssets.clear();
        this._loadingPromises.clear();
    }

    /**
     * Check if asset is loaded
     */
    public isLoaded(key: string): boolean {
        return this._loadedAssets.has(key);
    }

    /**
     * Load sprite by name
     * Helper method for common sprite loading
     */
    public async loadSprite(spriteName: string): Promise<SpriteFrame | null> {
        try {
            return await this.loadAsync<SpriteFrame>(spriteName);
        } catch (error) {
            console.error(`Failed to load sprite: ${spriteName}`, error);
            return null;
        }
    }

    /**
     * Load sprite synchronously
     */
    public getSprite(spriteName: string): SpriteFrame | null {
        return this.load<SpriteFrame>(spriteName);
    }
}