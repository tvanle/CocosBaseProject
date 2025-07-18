import {Node} from 'cc';

/**
 * Screen status enum
 */
export enum ScreenStatus {
    None = 0,
    Loading = 1,
    Closed = 2,
    Opened = 3,
    Destroyed = 5
}

/**
 * Screen type enum
 */
export enum ScreenType {
    Screen = 0,
    Popup = 1
}

/**
 * Base interface for screen presenters
 */
export interface IScreenPresenter {
    /**
     * Screen identifier for tracking
     */
    screenId: string;

    /**
     * Screen type (Screen or Popup)
     */
    screenType: ScreenType;

    /**
     * Current status of the screen
     */
    status: ScreenStatus;
    /**
     * Open the screen
     */
    openAsync(): Promise<void>;

    /**
     * Close the screen
     */
    closeAsync(): Promise<void>;

    /**
     * Called when the screen is opened
     */
    onOpened(): void;

    /**
     * Called when the screen is closed
     */
    onClosed(): void;

    /**
     * Dispose the screen and clean up resources
     */
    dispose(): void;
}