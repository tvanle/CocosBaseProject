import { Node, instantiate, resources, Prefab } from 'cc';
import { ScreenType } from './IScreenPresenter';

type ScreenConfig = {
    screenId: string;
    screenType: ScreenType;
    prefabPath: string;
    presenterClass: any;
};

/**
 * Screen Manager - quản lý toàn bộ screens và popups
 */
export class ScreenManager {
    private static _instance: ScreenManager | null = null;
    static get instance() {
        if (!this._instance) this._instance = new ScreenManager();
        return this._instance;
    }

    private _screenConfigs = new Map<string, ScreenConfig>();
    private _screens = new Map<string, any>();
    private _popups = new Map<string, any>();
    private _currentScreen: any = null;
    private _screenContainer: Node | null = null;
    private _popupContainer: Node | null = null;

    // Thêm map để tra cứu nhanh screenId từ class
    private _presenterClassToScreenId = new Map<any, string>();

    /**
     * Initialize screen manager với containers
     */
    initialize(screenContainer: Node, popupContainer: Node) {
        this._screenContainer = screenContainer;
        this._popupContainer = popupContainer;
    }

    /**
     * Register a screen with its configuration
     */
    registerScreen(config: ScreenConfig) {
        this._screenConfigs.set(config.screenId, config);
        this._presenterClassToScreenId.set(config.presenterClass, config.screenId);
    }

    /**
     * Open a screen by ID - screen mới sẽ đóng screen cũ
     */
    async openScreen(screenId: string, data?: any) {
        const config = this._screenConfigs.get(screenId);
        if (!config || config.screenType !== ScreenType.Screen) return;

        // Đóng screen hiện tại nếu có
        if (this._currentScreen) await this.closeCurrentScreen();

        // Tạo và mở screen mới
        const presenter = await this._createPresenter(config, data);
        this._currentScreen = presenter;
        this._screens.set(screenId, presenter);
        return presenter;
    }

    /**
     * Open a popup by ID - popup đè lên screen hiện tại
     */
    async openPopup(screenId: string, data?: any) {
        const config = this._screenConfigs.get(screenId);
        if (!config || config.screenType !== ScreenType.Popup) return;

        // Hide current screen nếu có
        if (this._currentScreen) this._currentScreen.hide();

        // Tạo và mở popup
        const presenter = await this._createPresenter(config, data);
        this._popups.set(screenId, presenter);
        return presenter;
    }

    /**
     * Close current screen
     */
    async closeCurrentScreen() {
        if (this._currentScreen) {
            await this._currentScreen.closeAsync();
            this._screens.delete(this._currentScreen.screenId);
            this._currentScreen.dispose();
            this._currentScreen = null;
        }
    }

    /**
     * Close a specific popup by ID
     */
    async closePopup(screenId: string) {
        const presenter = this._popups.get(screenId);
        if (presenter) {
            await presenter.closeAsync();
            this._popups.delete(screenId);
            presenter.dispose();
            // Show lại current screen nếu không còn popup nào
            if (this._popups.size === 0 && this._currentScreen) this._currentScreen.show();
        }
    }

    /**
     * Close all popups
     */
    async closeAllPopups() {
        for (const id of Array.from(this._popups.keys())) {
            await this.closePopup(id);
        }
    }

    /**
     * Close all screens and popups
     */
    async closeAll() {
        await this.closeAllPopups();
        await this.closeCurrentScreen();
    }

    /**
     * Get current active screen
     */
    getCurrentScreen() {
        return this._currentScreen;
    }

    /**
     * Get all active popups
     */
    getActivePopups() {
        return Array.from(this._popups.values());
    }

    /**
     * Check if a screen is open
     */
    isScreenOpen(screenId: string) {
        return this._screens.has(screenId) || this._popups.has(screenId);
    }

    /**
     * Tạo presenter instance và load view từ prefab
     */
    private async _createPresenter(config: ScreenConfig, data?: any) {
        // Tạo instance presenter
        const presenter = new config.presenterClass();
        presenter.screenId = config.screenId;
        presenter.screenType = config.screenType;

        // Load prefab và tạo view
        const prefab = await this._loadPrefab(config.prefabPath);
        const viewNode = instantiate(prefab);

        // Set parent container dựa trên loại screen
        const container = config.screenType === ScreenType.Screen ? this._screenContainer : this._popupContainer;
        if (container) container.addChild(viewNode);

        // Set view cho presenter
        presenter.view = viewNode;

        // Initialize presenter
        await presenter.initialize();

        // Open presenter với data
        await presenter.openAsync(data);

        return presenter;
    }

    /**
     * Load prefab từ resources
     */
    private async _loadPrefab(prefabPath: string): Promise<Prefab> {
        return new Promise((resolve, reject) => {
            resources.load(prefabPath, Prefab, (err, prefab) => {
                if (err) reject(err);
                else resolve(prefab);
            });
        });
    }
}