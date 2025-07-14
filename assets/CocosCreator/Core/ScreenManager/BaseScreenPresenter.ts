import { Node, Component } from 'cc';
import { IScreenPresenter, ScreenStatus } from './IScreenPresenter';

/**
 * Base Screen Presenter class
 * Similar to Unity's BaseScreenPresenter<T>
 */
export abstract class BaseScreenPresenter extends Component implements IScreenPresenter {
    public view: Node | null = null;
    public isClosePrevious: boolean = false;
    public screenId: string = '';
    
    protected _status: ScreenStatus = ScreenStatus.None;
    protected _data: any = null;

    public get status(): ScreenStatus {
        return this._status;
    }

    /**
     * Initialize the presenter
     * Override this method in derived classes
     */
    public async initialize(): Promise<void> {
        this.view = this.node;
        this._status = ScreenStatus.Loading;
        
        // Perform any initialization logic
        await this.onInitialize();
        
        this._status = ScreenStatus.Closed;
    }

    /**
     * Bind data to the view
     * Override this method in derived classes
     */
    public async bindData(data?: any): Promise<void> {
        this._data = data;
        await this.onBindData(data);
    }

    /**
     * Open the screen
     */
    public async openAsync(data?: any): Promise<void> {
        if (this._status === ScreenStatus.Opened) {
            return;
        }

        await this.bindData(data);
        
        // Show the view
        if (this.view) {
            this.view.active = true;
        }

        this._status = ScreenStatus.Opened;
        await this.onViewOpened();
    }

    /**
     * Close the screen
     */
    public async closeAsync(): Promise<void> {
        if (this._status === ScreenStatus.Closed) {
            return;
        }

        await this.onViewClosing();

        // Hide the view
        if (this.view) {
            this.view.active = false;
        }

        this._status = ScreenStatus.Closed;
        await this.onViewClosed();
    }

    /**
     * Called when the screen is opened
     */
    public onOpened(): void {
        // Override in derived classes
    }

    /**
     * Called when the screen is closed
     */
    public onClosed(): void {
        // Override in derived classes
    }

    /**
     * Called when the screen is hidden
     */
    public onHidden(): void {
        if (this.view) {
            this.view.active = false;
        }
        this._status = ScreenStatus.Hidden;
    }

    /**
     * Called when the screen is shown again
     */
    public onShown(): void {
        if (this.view) {
            this.view.active = true;
        }
        this._status = ScreenStatus.Opened;
    }

    /**
     * Dispose the presenter
     */
    public dispose(): void {
        this.onDispose();
        
        if (this.view && this.view.isValid) {
            this.view.destroy();
        }
        
        this.view = null;
        this._data = null;
        this._status = ScreenStatus.None;
    }

    // Protected virtual methods to override in derived classes

    /**
     * Called during initialization
     * Override this method in derived classes for custom initialization
     */
    protected async onInitialize(): Promise<void> {
        // Override in derived classes
    }

    /**
     * Called when binding data
     * Override this method in derived classes
     */
    protected async onBindData(data?: any): Promise<void> {
        // Override in derived classes
    }

    /**
     * Called when the view is opened
     * Override this method in derived classes
     */
    protected async onViewOpened(): Promise<void> {
        // Override in derived classes
    }

    /**
     * Called before the view is closed
     * Override this method in derived classes
     */
    protected async onViewClosing(): Promise<void> {
        // Override in derived classes
    }

    /**
     * Called after the view is closed
     * Override this method in derived classes
     */
    protected async onViewClosed(): Promise<void> {
        // Override in derived classes
    }

    /**
     * Called when disposing
     * Override this method in derived classes for cleanup
     */
    protected onDispose(): void {
        // Override in derived classes
    }
}
