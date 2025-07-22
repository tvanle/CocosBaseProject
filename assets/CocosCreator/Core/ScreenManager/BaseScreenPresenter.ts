import { IScreenPresenter, ScreenStatus, ScreenType } from './IScreenPresenter';
import { IScreenView } from './IScreenView';

/**
 * Base class for screen presenters with MVP pattern
 */
export abstract class BaseScreenPresenter<TView extends IScreenView, TModel = any> implements IScreenPresenter {
    public view: TView | null = null;
    public model: TModel | null = null;
    public status: ScreenStatus = ScreenStatus.None;
    public screenType: ScreenType = ScreenType.Screen;
    public screenId: string = '';
    /**
     * Set the view for this presenter
     */
    async setView(view: IScreenView): Promise<void> {
        this.view = view as TView;
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
        // Override in child classes to setup event listeners
    }

    /**
     * Called to bind model data to view - override in child classes
     */
    protected async bindData(): Promise<void> {
        // Override in child classes to update UI with model data
    }

    /**
     * Called when screen is opened
     */
    onOpened(): void {
        // Can be overridden by child classes
    }

    /**
     * Called when screen is closed
     */
    onClosed(): void {
        // Can be overridden by child classes
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