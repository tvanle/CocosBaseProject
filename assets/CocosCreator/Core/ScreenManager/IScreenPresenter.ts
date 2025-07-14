import { Node } from 'cc';

/**
 * Base interface for screen presenters
 * Similar to Unity's IScreenPresenter
 */
export interface IScreenPresenter {
    /**
     * The view associated with this presenter
     */
    view: Node | null;

    /**
     * Whether this screen should close the previous screen when opened
     */
    isClosePrevious: boolean;

    /**
     * Screen identifier for tracking
     */
    screenId: string;

    /**
     * Initialize the presenter
     */
    initialize(): Promise<void>;

    /**
     * Bind data to the view
     */
    bindData(data?: any): Promise<void>;

    /**
     * Called when the screen is opened
     */
    onOpened(): void;

    /**
     * Called when the screen is closed
     */
    onClosed(): void;

    /**
     * Called when the screen is hidden (covered by another screen)
     */
    onHidden(): void;

    /**
     * Called when the screen is shown again (after being hidden)
     */
    onShown(): void;

    /**
     * Open the screen
     */
    openAsync(data?: any): Promise<void>;

    /**
     * Close the screen
     */
    closeAsync(): Promise<void>;

    /**
     * Dispose/cleanup the presenter
     */
    dispose(): void;
}

/**
 * Screen status enumeration
 * Similar to Unity's ScreenStatus
 */
export enum ScreenStatus {
    None = 0,
    Loading = 1,
    Opened = 2,
    Closed = 3,
    Hidden = 4
}

/**
 * Screen information attribute
 * Similar to Unity's ScreenInfoAttribute
 */
export interface ScreenInfo {
    screenId: string;
    prefabPath: string;
}
