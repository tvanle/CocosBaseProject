import { ScreenView } from './ScreenView';

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
 * Abstract base class for all screen presenters
 */
export abstract class ScreenPresenter<TView extends ScreenView = ScreenView, TModel = any> {
    public view: TView | null = null;
    public model: TModel | null = null;
    public status: ScreenStatus = ScreenStatus.None;
    public screenId: string = '';

    /**
     * Set the view for this presenter
     */
    async setView(view: TView): Promise<void> {
        this.view = view;
        this.screenId = this.constructor.name;
        this.onViewReady();
    }

    /**
     * Set model data for this presenter
     */
    setModel(model: TModel): void {
        this.model = model;
    }

    /**
     * Open the screen
     */
    async openAsync(): Promise<void> {
        if (this.status === ScreenStatus.Opened) return;

        this.status = ScreenStatus.Loading;
        await this.bindData();
        this.status = ScreenStatus.Opened;

        if (this.view) {
            await this.view.open();
        }

        this.onOpened();
    }

    /**
     * Close the screen
     */
    async closeAsync(): Promise<void> {
        if (this.status === ScreenStatus.Closed) return;

        this.status = ScreenStatus.Closed;

        if (this.view) {
            await this.view.close();
        }

        this.onClosed();
    }

    /**
     * Called when view is ready - override in child classes
     */
    protected onViewReady(): void {
        // Override in child classes
    }

    /**
     * Called to bind model data to view - override in child classes
     */
    protected async bindData(): Promise<void> {
        // Override in child classes
    }

    /**
     * Called when screen is opened
     */
    onOpened(): void {
        // Override in child classes
    }

    /**
     * Called when screen is closed
     */
    onClosed(): void {
        // Override in child classes
    }

    /**
     * Dispose the screen and clean up resources
     */
    dispose(): void {
        this.status = ScreenStatus.Destroyed;
        this.view = null;
        this.model = null;
    }
}