import { Component } from 'cc';

/**
 * Abstract base class for all screen views
 */
export abstract class ScreenView extends Component {
    /**
     * Called when the screen should open
     */
    abstract open(): Promise<void>;

    /**
     * Called when the screen should close
     */
    abstract close(): Promise<void>;

    /**
     * Hide the view
     */
    hide(): void {
        this.node.active = false;
    }

    /**
     * Show the view
     */
    show(): void {
        this.node.active = true;
    }

    /**
     * Destroy the view
     */
    destroySelf(): void {
        this.node.destroy();
    }
}