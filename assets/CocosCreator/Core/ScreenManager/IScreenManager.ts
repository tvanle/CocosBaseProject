// IScreenManager.ts

import { Node } from 'cc';
import { IScreenPresenter, ScreenType } from './IScreenPresenter';

/**
 * Screen configuration
 */
export interface ScreenConfig {
    screenId: string;
    presenterClass: new() => IScreenPresenter;
    prefabPath: string;
    screenType: ScreenType;
}

/**
 * Interface for Screen Manager
 */
export interface IScreenManager {
    /**
     * Register a screen with its configuration
     */
    registerScreen(config: ScreenConfig): void;

    /**
     * Open a screen by ID
     */
    openScreen<T extends IScreenPresenter>(screenId: string, data?: any): Promise<T>;

    /**
     * Open a popup by ID
     */
    openPopup<T extends IScreenPresenter>(screenId: string, data?: any): Promise<T>;

    /**
     * Close current screen
     */
    closeCurrentScreen(): Promise<void>;

    /**
     * Close a specific screen by ID
     */
    closeScreen(screenId: string): Promise<void>;

    /**
     * Close all popups
     */
    closeAllPopups(): Promise<void>;

    /**
     * Close all screens and popups
     */
    closeAll(): Promise<void>;

    /**
     * Get current active screen
     */
    getCurrentScreen(): IScreenPresenter | null;

    /**
     * Get all active popups
     */
    getActivePopups(): IScreenPresenter[];

    /**
     * Check if a screen is open
     */
    isScreenOpen(screenId: string): boolean;
}