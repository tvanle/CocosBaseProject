import { Constructor, instantiate, Prefab, Node } from 'cc';
import { AssetManager } from '../AssetManager';
import { ScreenPresenter } from './ScreenPresenter';
import { ScreenView } from './ScreenView';
import { RootUI } from './RootUI';
import { ScreenTransition, TransitionType } from './ScreenTransition';

interface OpenScreenOptions {
    model?: any;
    transition?: TransitionType;
    duration?: number;
}

export class ScreenManager {
    private static _instance: ScreenManager = new ScreenManager();

    static get instance(): ScreenManager {
        return this._instance;
    }

    private registeredScreens = new Map<Constructor<ScreenPresenter>, { path?: string; isPopup: boolean }>();
    private loadedScreens = new Map<Constructor<ScreenPresenter>, ScreenPresenter>();
    private currentScreen: ScreenPresenter | null = null;

    // Lazy initialization of root nodes
    private _screenRoot: Node | null = null;
    private _popupRoot: Node | null = null;

    private get screenRoot(): Node {
        if (!this._screenRoot) {
            this._screenRoot = RootUI.instance.screens;
        }
        return this._screenRoot;
    }

    private get popupRoot(): Node {
        if (!this._popupRoot) {
            this._popupRoot = RootUI.instance.popups;
        }
        return this._popupRoot;
    }

    /**
     * Register a screen class with decorator
     */
    registerScreen<T extends ScreenPresenter>(
        constructor: Constructor<T>,
        path?: string,
        isPopup: boolean = false
    ): void {
        this.registeredScreens.set(constructor, { path, isPopup });
    }

    /**
     * Open a screen - simplified API
     */
    async openScreen<T extends ScreenPresenter>(
        type: Constructor<T>,
        options: OpenScreenOptions = {}
    ): Promise<T> {
        const screen = await this.getOrCreateScreen(type) as T;

        // Set model if provided
        if (options.model) {
            screen.setModel(options.model);
        }

        // Set ViewSiblingIndex to push view to the end if no current screen
        const screenInfo = this.registeredScreens.get(type);
        if (!screenInfo?.isPopup && !this.currentScreen && screen.view) {
            screen.view.node.setSiblingIndex(-1); // Push to end
        }

        // Handle transition if specified
        if (options.transition && screen.view) {
            const transition = new ScreenTransition();
            transition.type = options.transition;
            transition.duration = options.duration || 0.3;
            await transition.show(screen.view.node);
        }

        await screen.openAsync();

        // Set as current screen if not popup
        if (!screenInfo?.isPopup) {
            this.currentScreen = screen;
        }

        return screen;
    }

    /**
     * Close a screen - simplified API
     */
    async closeScreen<T extends ScreenPresenter>(
        type: Constructor<T>,
        transition?: TransitionType
    ): Promise<void> {
        const screen = this.loadedScreens.get(type);
        if (!screen) return;

        // Handle transition if specified
        if (transition && screen.view) {
            const screenTransition = new ScreenTransition();
            screenTransition.type = transition;
            screenTransition.duration = 0.3;
            await screenTransition.hide(screen.view.node);
        }

        await screen.closeAsync();

        // Clear current screen if this was it
        if (this.currentScreen === screen) {
            this.currentScreen = null;
        }

        // Always dispose for better memory management
        screen.dispose();
        this.loadedScreens.delete(type);
    }

    /**
     * Check if a screen is currently open
     */
    isScreenOpen<T extends ScreenPresenter>(type: Constructor<T>): boolean {
        const screen = this.loadedScreens.get(type);
        return screen?.status === 3; // ScreenStatus.Opened
    }

    /**
     * Get the current active screen
     */
    getCurrentScreen(): ScreenPresenter | null {
        return this.currentScreen;
    }

    /**
     * Get or create screen instance - optimized
     */
    private async getOrCreateScreen<T extends ScreenPresenter>(type: Constructor<T>): Promise<T> {
        // Return existing if already loaded
        const existing = this.loadedScreens.get(type);
        if (existing) {
            return existing as T;
        }

        // Get registration info
        const screenInfo = this.registeredScreens.get(type);
        if (!screenInfo) {
            throw new Error(`Screen ${type.name} is not registered. Use @Screen or @Popup decorator.`);
        }

        // Create presenter instance
        const presenter = new type();

        // Load prefab with caching
        const prefabPath = screenInfo.path;
        const prefab = await AssetManager.instance.loadAsync<Prefab>(prefabPath);
        const node = instantiate(prefab);

        // Set parent based on type
        const parentNode = screenInfo.isPopup ? this.popupRoot : this.screenRoot;
        node.setParent(parentNode, false);

        // Simple setView - just pass the node, let presenter handle view finding
        await presenter.setView(node.getComponent(ScreenView));

        // Cache the screen
        this.loadedScreens.set(type, presenter);

        return presenter as T;
    }

    /**
     * Dispose all screens and clear cache
     */
    dispose(): void {
        for (const [, screen] of this.loadedScreens) {
            screen.dispose();
        }
        this.loadedScreens.clear();
        this.currentScreen = null;
    }
}