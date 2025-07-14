/**
 * Game Application Setup Example
 * Ví dụ về cách tích hợp hệ thống vào Cocos Creator project thực tế
 */

import { AssetManager } from '../Core/AssetManager/AssetManager';
import { ScreenManager } from '../Core/ScreenManager/ScreenManager';
import { ScreenRegistry } from '../Core/ScreenManager/ScreenPresenterFactory';

// Import tất cả screen presenters
import { HomeScreenPresenter } from './HomeScreenPresenter';
import { GameplayScreenPresenter } from './GameplayScreenPresenter';
import { ShopScreenPresenter } from './ShopScreenPresenter';
import { PausePopupPresenter, ConfirmPopupPresenter } from './PopupScreenPresenters';

/**
 * Game Application Manager
 * Main entry point để khởi tạo và quản lý game
 */
export class GameApplication {
    private static _instance: GameApplication;
    private _rootCanvas: any = null; // Canvas component
    private _overlayCanvas: any = null; // Canvas component
    private _isInitialized: boolean = false;

    public static get instance(): GameApplication {
        if (!this._instance) {
            this._instance = new GameApplication();
        }
        return this._instance;
    }

    /**
     * Khởi tạo game application
     * Gọi method này trong main scene start()
     */
    public async initialize(rootCanvas: any, overlayCanvas: any): Promise<void> {
        if (this._isInitialized) {
            console.warn('GameApplication already initialized');
            return;
        }

        console.log('Initializing Game Application...');

        // Store canvas references
        this._rootCanvas = rootCanvas;
        this._overlayCanvas = overlayCanvas;

        // Initialize core systems
        await this.initializeCoreSystem();

        // Register all screen presenters
        this.registerScreenPresenters();

        // Preload essential assets
        await this.preloadEssentialAssets();

        // Open initial screen
        await this.openInitialScreen();

        this._isInitialized = true;
        console.log('Game Application initialized successfully');
    }

    /**
     * Khởi tạo các core system
     */
    private async initializeCoreSystem(): Promise<void> {
        // Initialize Screen Manager
        const screenManager = ScreenManager.instance;
        screenManager.initialize(this._rootCanvas, this._overlayCanvas);

        console.log('Core systems initialized');
    }

    /**
     * Đăng ký tất cả screen presenters
     */
    private registerScreenPresenters(): void {
        const registry = ScreenRegistry;

        // Register main screens
        registry.registerScreen('HomeScreen', HomeScreenPresenter);
        registry.registerScreen('GameplayScreen', GameplayScreenPresenter);
        registry.registerScreen('ShopScreen', ShopScreenPresenter);

        // Register popup screens
        registry.registerScreen('PausePopup', PausePopupPresenter);
        registry.registerScreen('ConfirmPopup', ConfirmPopupPresenter);

        // Register other screens as needed
        // registry.registerScreen('SettingsScreen', SettingsScreenPresenter);
        // registry.registerScreen('ProfileScreen', ProfileScreenPresenter);
        // registry.registerScreen('LeaderboardScreen', LeaderboardScreenPresenter);

        console.log('All screen presenters registered');
    }

    /**
     * Preload essential assets
     */
    private async preloadEssentialAssets(): Promise<void> {
        const assetManager = AssetManager.instance;

        const essentialAssets = [
            'HomeScreen',
            'icon_coin',
            'icon_gem',
            'button_normal',
            'button_pressed'
        ];

        try {
            await assetManager.preloadAsync(essentialAssets);
            console.log('Essential assets preloaded successfully');
        } catch (error) {
            console.error('Failed to preload essential assets:', error);
        }
    }

    /**
     * Mở screen đầu tiên
     */
    private async openInitialScreen(): Promise<void> {
        const screenManager = ScreenManager.instance;

        try {
            // Check if there's a saved game state
            const hasGameState = this.checkGameState();

            if (hasGameState) {
                // Resume game or go to home
                await screenManager.openScreen('HomeScreen');
            } else {
                // First time, might show splash screen or tutorial
                await screenManager.openScreen('HomeScreen');
            }
        } catch (error) {
            console.error('Failed to open initial screen:', error);
            // Fallback to home screen
            await screenManager.openScreen('HomeScreen');
        }
    }

    /**
     * Kiểm tra game state
     */
    private checkGameState(): boolean {
        // Check local storage, player data, etc.
        // Return true if game state exists
        return false;
    }

    /**
     * Cleanup khi game đóng
     */
    public async cleanup(): Promise<void> {
        if (!this._isInitialized) return;

        console.log('Cleaning up Game Application...');

        // Close all screens
        const screenManager = ScreenManager.instance;
        await screenManager.closeAllScreens();

        // Release all assets
        const assetManager = AssetManager.instance;
        assetManager.releaseAll();

        // Cleanup other systems
        this.cleanupOtherSystems();

        this._isInitialized = false;
        console.log('Game Application cleaned up');
    }

    private cleanupOtherSystems(): void {
        // Cleanup other game systems
        // Example: EventManager.cleanup(), AudioManager.cleanup(), etc.
    }

    /**
     * Get initialized status
     */
    public get isInitialized(): boolean {
        return this._isInitialized;
    }
}

/**
 * Screen Navigation Helper
 * Helper class để navigate giữa các screen một cách dễ dàng
 */
export class NavigationHelper {
    /**
     * Goto Home screen
     */
    public static async gotoHome(): Promise<void> {
        await ScreenManager.instance.openScreen('HomeScreen');
    }

    /**
     * Start gameplay với level data
     */
    public static async startGameplay(levelData?: any): Promise<void> {
        await ScreenManager.instance.openScreen('GameplayScreen', { levelData });
    }

    /**
     * Open shop với category cụ thể
     */
    public static async openShop(category?: string): Promise<void> {
        await ScreenManager.instance.openScreen('ShopScreen', { category });
    }

    /**
     * Show pause popup
     */
    public static async showPausePopup(callbacks?: any): Promise<void> {
        await ScreenManager.instance.openScreen('PausePopup', callbacks);
    }

    /**
     * Show confirmation dialog
     */
    public static async showConfirmDialog(
        title: string, 
        message: string, 
        onConfirm?: () => void, 
        onCancel?: () => void
    ): Promise<void> {
        await ScreenManager.instance.openScreen('ConfirmPopup', {
            title,
            message,
            onConfirm,
            onCancel
        });
    }

    /**
     * Close all popups
     */
    public static async closeAllPopups(): Promise<void> {
        await ScreenManager.instance.closeAllOverlayScreens();
    }
}

/**
 * Asset Preloader Helper
 * Helper để preload assets theo nhóm
 */
export class AssetPreloader {
    /**
     * Preload UI assets
     */
    public static async preloadUIAssets(): Promise<void> {
        const assets = [
            'HomeScreen',
            'GameplayScreen',
            'ShopScreen',
            'PausePopup',
            'ConfirmPopup'
        ];

        await AssetManager.instance.preloadAsync(assets);
    }

    /**
     * Preload game assets
     */
    public static async preloadGameAssets(): Promise<void> {
        const assets = [
            'game_background',
            'player_character',
            'enemy_sprites',
            'fx_explosion',
            'fx_coin_collect'
        ];

        await AssetManager.instance.preloadAsync(assets);
    }

    /**
     * Preload audio assets
     */
    public static async preloadAudioAssets(): Promise<void> {
        const assets = [
            'bgm_home',
            'bgm_gameplay',
            'sfx_button_click',
            'sfx_coin_collect',
            'sfx_explosion'
        ];

        await AssetManager.instance.preloadAsync(assets);
    }
}
