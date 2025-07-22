import {Node} from 'cc';
import {IScreenView} from "db://assets/CocosCreator/Core/ScreenManager/IScreenView";

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
     * View associated with the screen
     */
    setView(view: IScreenView): Promise<void>;
    /**
     * Set model for the screen presenter
     */
    setModel(model: any): void;
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

export interface IScreenPresenterWithModel<TModel = any> extends IScreenPresenter {}