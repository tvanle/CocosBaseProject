import { IScreenPresenter, ScreenStatus } from './IScreenPresenter';

/**
 * Interface for Screen Manager
 * Similar to Unity's IScreenManager
 */
export interface IScreenManager {
    /**
     * Currently active screen
     */
    currentActiveScreen: IScreenPresenter | null;

    /**
     * Root canvas for normal screens
     */
    rootCanvas: any; // Canvas or Node

    /**
     * Root canvas for overlay/popup screens
     */
    overlayCanvas: any; // Canvas or Node

    /**
     * Open a screen by type/id
     */
    openScreen<T extends IScreenPresenter>(screenId: string, data?: any): Promise<T>;

    /**
     * Close the current screen
     */
    closeCurrentScreen(): Promise<void>;

    /**
     * Close a specific screen
     */
    closeScreen(screen: IScreenPresenter): Promise<void>;

    /**
     * Close all screens
     */
    closeAllScreens(): Promise<void>;

    /**
     * Close all overlay screens
     */
    closeAllOverlayScreens(): Promise<void>;

    /**
     * Get screen by id
     */
    getScreen<T extends IScreenPresenter>(screenId: string): T | null;

    /**
     * Check if screen is active
     */
    isScreenActive(screenId: string): boolean;

    /**
     * Clean up all screens
     */
    cleanup(): void;
}
