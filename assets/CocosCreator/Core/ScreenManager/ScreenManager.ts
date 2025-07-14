import { Node, Canvas } from 'cc';
import { IScreenManager } from './IScreenManager';
import { IScreenPresenter, ScreenStatus } from './IScreenPresenter';
import { AssetManager } from '../AssetManager/AssetManager';
import { ScreenPresenterFactory } from './ScreenPresenterFactory';

/**
 * Screen Manager implementation using Singleton pattern
 * Based on Unity's ScreenManager architecture
 */
export class ScreenManager implements IScreenManager {
    private static _instance: ScreenManager;
    private _activeScreens: IScreenPresenter[] = [];
    private _loadedScreens: Map<string, IScreenPresenter> = new Map();
    private _rootCanvas: Canvas | null = null;
    private _overlayCanvas: Canvas | null = null;
    private _assetManager: AssetManager;
    private _presenterFactory: ScreenPresenterFactory;

    public static get instance(): ScreenManager {
        if (!this._instance) {
            this._instance = new ScreenManager();
        }
        return this._instance;
    }

    private constructor() {
        this._assetManager = AssetManager.instance;
        this._presenterFactory = ScreenPresenterFactory.instance;
    }

    /**
     * Initialize the screen manager with canvas references
     */
    public initialize(rootCanvas: Canvas, overlayCanvas: Canvas): void {
        this._rootCanvas = rootCanvas;
        this._overlayCanvas = overlayCanvas;
    }

    public get currentActiveScreen(): IScreenPresenter | null {
        return this._activeScreens.length > 0 ? this._activeScreens[this._activeScreens.length - 1] : null;
    }

    public get rootCanvas(): Canvas | null {
        return this._rootCanvas;
    }

    public get overlayCanvas(): Canvas | null {
        return this._overlayCanvas;
    }

    /**
     * Open screen by screen ID
     * Similar to Unity's OpenScreen<T>
     */
    public async openScreen<T extends IScreenPresenter>(screenId: string, data?: any): Promise<T> {
        try {
            // Check if screen is already loaded
            let screenPresenter = this._loadedScreens.get(screenId) as T;

            if (!screenPresenter) {
                // Create new screen presenter instance
                screenPresenter = await this.createScreenPresenter<T>(screenId);
                this._loadedScreens.set(screenId, screenPresenter);
            }

            // Handle previous screen based on isClosePrevious flag
            if (this.currentActiveScreen && screenPresenter.isClosePrevious) {
                await this.closeCurrentScreen();
            } else if (this.currentActiveScreen) {
                // Hide current screen
                this.currentActiveScreen.onHidden();
            }

            // Add to active screens
            this._activeScreens.push(screenPresenter);

            // Open the screen
            await screenPresenter.openAsync(data);
            screenPresenter.onOpened();

            return screenPresenter;
        } catch (error) {
            console.error(`Failed to open screen: ${screenId}`, error);
            throw error;
        }
    }

    /**
     * Close current screen
     * Similar to Unity's CloseCurrentScreen
     */
    public async closeCurrentScreen(): Promise<void> {
        if (this.currentActiveScreen) {
            await this.closeScreen(this.currentActiveScreen);
        }
    }

    /**
     * Close a specific screen
     */
    public async closeScreen(screen: IScreenPresenter): Promise<void> {
        const index = this._activeScreens.indexOf(screen);
        if (index === -1) {
            console.warn(`Screen ${screen.screenId} is not active`);
            return;
        }

        // Remove from active screens
        this._activeScreens.splice(index, 1);

        // Close the screen
        await screen.closeAsync();
        screen.onClosed();

        // Show previous screen if exists and if this wasn't an overlay
        if (!this.isOverlayScreen(screen) && this._activeScreens.length > 0) {
            const previousScreen = this.currentActiveScreen;
            if (previousScreen) {
                previousScreen.onShown();
            }
        }
    }

    /**
     * Close all screens
     * Similar to Unity's CloseAllScreens
     */
    public async closeAllScreens(): Promise<void> {
        const closePromises: Promise<void>[] = [];

        for (const screen of this._activeScreens) {
            closePromises.push(screen.closeAsync());
        }

        await Promise.all(closePromises);

        // Clean up active screens list
        for (const screen of this._activeScreens) {
            screen.onClosed();
        }

        this._activeScreens = [];
    }

    /**
     * Close all overlay screens
     * Similar to Unity's CloseAllOverlayScreens
     */
    public async closeAllOverlayScreens(): Promise<void> {
        const overlayScreens = this._activeScreens.filter(screen => 
            this.isOverlayScreen(screen)
        );

        const closePromises: Promise<void>[] = [];
        for (const screen of overlayScreens) {
            closePromises.push(screen.closeAsync());
            const index = this._activeScreens.indexOf(screen);
            if (index !== -1) {
                this._activeScreens.splice(index, 1);
            }
        }

        await Promise.all(closePromises);

        for (const screen of overlayScreens) {
            screen.onClosed();
        }
    }

    /**
     * Get screen by screen ID
     */
    public getScreen<T extends IScreenPresenter>(screenId: string): T | null {
        return this._loadedScreens.get(screenId) as T || null;
    }

    /**
     * Check if screen is currently active
     */
    public isScreenActive(screenId: string): boolean {
        return this._activeScreens.some(screen => screen.screenId === screenId);
    }

    /**
     * Clean up all screens and resources
     */
    public cleanup(): void {
        // Close all screens first
        this.closeAllScreens();

        // Dispose all loaded screens
        for (const [id, screen] of this._loadedScreens) {
            screen.dispose();
        }

        this._loadedScreens.clear();
        this._activeScreens = [];
    }

    /**
     * Create screen presenter instance
     * Uses factory pattern to create instances based on screen ID
     */
    private async createScreenPresenter<T extends IScreenPresenter>(screenId: string): Promise<T> {
        try {
            // Use factory to create presenter instance
            const presenter = this._presenterFactory.createPresenter<T>(screenId);
            if (!presenter) {
                throw new Error(`No presenter registered for screen ID: ${screenId}`);
            }

            // Load the screen prefab/asset
            const screenNode = await this._assetManager.loadComponent<Node>(screenId);
            
            // Set up the presenter
            presenter.screenId = screenId;
            presenter.view = screenNode;
            
            // Set parent based on screen type
            const parentCanvas = this.isOverlayScreen(presenter) ? this._overlayCanvas : this._rootCanvas;
            if (parentCanvas) {
                screenNode.setParent(parentCanvas.node);
            }

            // Initialize the presenter
            await presenter.initialize();
            
            return presenter as T;
        } catch (error) {
            console.error(`Failed to create screen presenter: ${screenId}`, error);
            throw error;
        }
    }

    /**
     * Check if screen is an overlay/popup screen
     * Checks if the presenter has isOverlay property or uses naming convention
     */
    private isOverlayScreen(screen: IScreenPresenter): boolean {
        // Check if presenter has isOverlay property
        if ('isOverlay' in screen && (screen as any).isOverlay) {
            return true;
        }

        // Fallback to naming convention
        return screen.screenId.toLowerCase().includes('popup') || 
               screen.screenId.toLowerCase().includes('overlay') ||
               screen.screenId.toLowerCase().includes('dialog') ||
               screen.screenId.toLowerCase().includes('modal');
    }
}
