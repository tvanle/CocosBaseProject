import { Constructor, instantiate, Prefab, Node } from 'cc';
import { AssetManager } from '../AssetManager/AssetManager';
import { IScreenPresenter } from './IScreenPresenter';
import { RootUI } from './RootUI';
import { ScreenTransition, TransitionType } from './ScreenTransition';

interface OpenScreenOptions {
    model?: any;
    transition?: TransitionType;
    duration?: number;
    keepInMemory?: boolean;
}

interface CloseScreenOptions {
    transition?: TransitionType;
    duration?: number;
    keepInMemory?: boolean;
}

export class ScreenManager {
    private static _instance: ScreenManager = new ScreenManager();

    static get instance(): ScreenManager {
        return this._instance;
    }

    private registeredScreens: Map<Constructor<IScreenPresenter>, { path?: string; isPopup: boolean }> = new Map();
    private loadedScreens: Map<Constructor<IScreenPresenter>, IScreenPresenter> = new Map();
    private currentScreen: IScreenPresenter | null = null;
    private screenRoot: Node;
    private popupRoot: Node;
    private hiddenRoot: Node;

    init() {
        this.screenRoot = RootUI.instance.screens;
        this.popupRoot = RootUI.instance.popups;
        this.hiddenRoot = RootUI.instance.hiddens;
    }

    /**
     * Register a screen class with decorator
     */
    registerScreen<T extends IScreenPresenter>(
        constructor: Constructor<T>,
        path?: string,
        isPopup: boolean = false
    ): void {
        this.registeredScreens.set(constructor, { path, isPopup });
    }

    /**
     * Open a screen with options
     */
    async openScreen<T extends IScreenPresenter>(
        type: Constructor<T>,
        options: OpenScreenOptions = {}
    ): Promise<T> {
        const screen = await this.getOrCreateScreen(type) as T;

        // Set model if provided
        if (options.model) {
            screen.setModel(options.model);
        }

        // Handle transition
        if (options.transition !== undefined || options.duration !== undefined) {
            const transition = new ScreenTransition();
            transition.type = options.transition || TransitionType.Fade;
            transition.duration = options.duration || 0.3;

            // Fix: cast screen to any to access view property
            const screenWithView = screen as any;
            if (screenWithView.view) {
                await transition.show(screenWithView.view.node);
            }
        }

        await screen.openAsync();

        // Set as current screen if not popup
        const screenInfo = this.registeredScreens.get(type);
        if (!screenInfo?.isPopup) {
            this.currentScreen = screen;
        }

        return screen;
    }

    /**
     * Open screen with model (shorthand)
     */
    async openScreenWithModel<T extends IScreenPresenter, M extends any>(
        type: Constructor<T>,
        model: M,
        options: Omit<OpenScreenOptions, 'model'> = {}
    ): Promise<T> {
        return this.openScreen(type, { ...options, model });
    }

    /**
     * Close a screen
     */
    async closeScreen<T extends IScreenPresenter>(
        type: Constructor<T>,
        options: CloseScreenOptions = {}
    ): Promise<void> {
        const screen = this.loadedScreens.get(type);
        if (!screen) return;

        // Handle transition
        if (options.transition !== undefined || options.duration !== undefined) {
            const transition = new ScreenTransition();
            transition.type = options.transition || TransitionType.Fade;
            transition.duration = options.duration || 0.3;

            // Fix: cast screen to any to access view property
            const screenWithView = screen as any;
            if (screenWithView.view) {
                await transition.hide(screenWithView.view.node);
            }
        }

        await screen.closeAsync();

        // Clear current screen if this was it
        if (this.currentScreen === screen) {
            this.currentScreen = null;
        }

        // Remove from memory if not keeping
        if (!options.keepInMemory) {
            screen.dispose();
            this.loadedScreens.delete(type);
        }
    }

    /**
     * Check if a screen is currently open
     */
    isScreenOpen<T extends IScreenPresenter>(type: Constructor<T>): boolean {
        const screen = this.loadedScreens.get(type);
        return screen ? screen.status === 3 /* ScreenStatus.Opened */ : false;
    }

    /**
     * Get the current active screen
     */
    getCurrentScreen(): IScreenPresenter | null {
        return this.currentScreen;
    }

    /**
     * Close all screens
     */
    async closeAll(): Promise<void> {
        const closePromises: Promise<void>[] = [];

        for (const [type] of this.loadedScreens) {
            closePromises.push(this.closeScreen(type));
        }

        await Promise.all(closePromises);
    }

    /**
     * Get or create screen instance
     */
    private async getOrCreateScreen<T extends IScreenPresenter>(type: Constructor<T>): Promise<T> {
        // Return existing if already loaded
        if (this.loadedScreens.has(type)) {
            return this.loadedScreens.get(type) as T;
        }

        // Get registration info
        const screenInfo = this.registeredScreens.get(type);
        if (!screenInfo) {
            throw new Error(`Screen ${type.name} is not registered. Use @Screen or @Popup decorator.`);
        }

        // Create presenter instance
        const presenter = new type();

        // Load prefab
        const presenterWithViewName = presenter as any;
        const prefabPath = screenInfo.path || presenterWithViewName.viewName || type.name;
        const prefab = await AssetManager.instance.loadAsync<Prefab>(prefabPath);
        const node = instantiate(prefab);

        // Set parent based on type
        const parentNode = screenInfo.isPopup ? this.popupRoot : this.screenRoot;
        node.setParent(parentNode, false);

        // Set view
        const viewComponent = node.getComponent(presenterWithViewName.viewName);
        if (!viewComponent) {
            throw new Error(`View component ${presenterWithViewName.viewName} not found on ${prefabPath}`);
        }

        await presenter.setView(viewComponent as any);

        // Cache the screen
        this.loadedScreens.set(type, presenter);

        return presenter as T;
    }
}