import { BaseScreenPresenter } from '../Core/ScreenManager/BaseScreenPresenter';
import { ScreenManager } from '../Core/ScreenManager/ScreenManager';

/**
 * Pause Popup Example - Overlay Screen
 * Ví dụ về popup overlay (không đóng screen phía dưới)
 */
export class PausePopupPresenter extends BaseScreenPresenter {
    // UI References
    private resumeButton: any = null;
    private homeButton: any = null;
    private settingsButton: any = null;
    private restartButton: any = null;
    private backgroundDimmer: any = null;

    // Callback functions passed from parent screen
    private onResumeCallback: (() => void) | null = null;
    private onHomeCallback: (() => void) | null = null;

    // Screen configuration - ĐÂY LÀ ĐIỂM QUAN TRỌNG
    public screenId = 'PausePopup';
    public isClosePrevious = false; // Không đóng screen phía dưới
    public isOverlay = true; // Đây là overlay popup

    protected async onInitialize(): Promise<void> {
        await this.setupUIComponents();
        await this.bindEvents();
        await this.setupOverlayBehavior();
    }

    protected async onBindData(data?: any): Promise<void> {
        // Receive callbacks from parent screen
        this.onResumeCallback = data?.onResume || null;
        this.onHomeCallback = data?.onHome || null;
    }

    protected async onViewOpened(): Promise<void> {
        console.log('Pause Popup opened');
        await this.playPopupAnimation();
    }

    protected async onViewClosed(): Promise<void> {
        console.log('Pause Popup closed');
        await this.playCloseAnimation();
    }

    private async setupUIComponents(): Promise<void> {
        if (!this.view) return;

        // Find popup content container
        const popupContent = this.view.getChildByName('PopupContent');
        this.backgroundDimmer = this.view.getChildByName('BackgroundDimmer');

        if (popupContent) {
            this.resumeButton = popupContent.getChildByName('ResumeButton')?.getComponent('Button');
            this.homeButton = popupContent.getChildByName('HomeButton')?.getComponent('Button');
            this.settingsButton = popupContent.getChildByName('SettingsButton')?.getComponent('Button');
            this.restartButton = popupContent.getChildByName('RestartButton')?.getComponent('Button');
        }
    }

    private async bindEvents(): Promise<void> {
        // Resume button
        if (this.resumeButton) {
            this.resumeButton.node.on('click', this.onResumeClicked, this);
        }

        // Home button
        if (this.homeButton) {
            this.homeButton.node.on('click', this.onHomeClicked, this);
        }

        // Settings button
        if (this.settingsButton) {
            this.settingsButton.node.on('click', this.onSettingsClicked, this);
        }

        // Restart button
        if (this.restartButton) {
            this.restartButton.node.on('click', this.onRestartClicked, this);
        }

        // Background dimmer (close popup when tapped)
        if (this.backgroundDimmer) {
            this.backgroundDimmer.on('click', this.onBackgroundClicked, this);
        }
    }

    private async setupOverlayBehavior(): Promise<void> {
        // Setup overlay-specific behavior
        if (this.backgroundDimmer) {
            // Set semi-transparent background
            const background = this.backgroundDimmer.getComponent('Sprite');
            if (background) {
                // Make background semi-transparent
                background.color = { r: 0, g: 0, b: 0, a: 128 }; // 50% opacity
            }
        }

        // Make popup appear on top layer
        if (this.view) {
            this.view.setSiblingIndex(999); // Move to top
        }
    }

    private async playPopupAnimation(): Promise<void> {
        // Entrance animation - scale from 0 to 1
        if (!this.view) return;

        const popupContent = this.view.getChildByName('PopupContent');
        if (popupContent) {
            // Initial state
            popupContent.setScale(0, 0);
            
            // Animate to full size
            // Example using Cocos Tween (pseudo-code)
            // tween(popupContent)
            //     .to(0.3, { scale: cc.v3(1, 1, 1) }, { easing: 'bounceOut' })
            //     .start();
            
            // For demo, just set scale directly
            popupContent.setScale(1, 1);
        }

        // Fade in background
        if (this.backgroundDimmer) {
            // Animate opacity from 0 to target
            // tween(this.backgroundDimmer).to(0.2, { opacity: 128 }).start();
        }
    }

    private async playCloseAnimation(): Promise<void> {
        // Exit animation - scale down and fade out
        if (!this.view) return;

        const popupContent = this.view.getChildByName('PopupContent');
        if (popupContent) {
            // Animate scale down
            // tween(popupContent).to(0.2, { scale: cc.v3(0, 0, 0) }).start();
            popupContent.setScale(0, 0);
        }

        // Fade out background
        if (this.backgroundDimmer) {
            // tween(this.backgroundDimmer).to(0.2, { opacity: 0 }).start();
        }
    }

    // Event Handlers
    private async onResumeClicked(): Promise<void> {
        console.log('Resume clicked');
        
        // Close popup first
        await ScreenManager.instance.closeScreen(this);
        
        // Call resume callback
        if (this.onResumeCallback) {
            this.onResumeCallback();
        }
    }

    private async onHomeClicked(): Promise<void> {
        console.log('Home clicked from pause popup');
        
        // Close popup first
        await ScreenManager.instance.closeScreen(this);
        
        // Call home callback or directly navigate
        if (this.onHomeCallback) {
            this.onHomeCallback();
        } else {
            await ScreenManager.instance.openScreen('HomeScreen');
        }
    }

    private async onSettingsClicked(): Promise<void> {
        console.log('Settings clicked');
        
        // Open settings popup on top of pause popup
        await ScreenManager.instance.openScreen('SettingsPopup', {
            onBack: () => {
                // Settings closed, pause popup is still active
                console.log('Back to pause popup');
            }
        });
    }

    private async onRestartClicked(): Promise<void> {
        console.log('Restart clicked');
        
        // Show confirmation popup
        await ScreenManager.instance.openScreen('ConfirmPopup', {
            title: 'Restart Level',
            message: 'Are you sure you want to restart? Current progress will be lost.',
            onConfirm: async () => {
                // Close all popups and restart gameplay
                await ScreenManager.instance.closeAllOverlayScreens();
                await ScreenManager.instance.openScreen('GameplayScreen');
            },
            onCancel: () => {
                // Do nothing, stay in pause popup
            }
        });
    }

    private async onBackgroundClicked(): Promise<void> {
        // Close popup when background is tapped
        await this.onResumeClicked();
    }

    protected onDispose(): void {
        // Remove event listeners
        if (this.resumeButton) {
            this.resumeButton.node.off('click', this.onResumeClicked, this);
        }
        if (this.homeButton) {
            this.homeButton.node.off('click', this.onHomeClicked, this);
        }
        if (this.settingsButton) {
            this.settingsButton.node.off('click', this.onSettingsClicked, this);
        }
        if (this.restartButton) {
            this.restartButton.node.off('click', this.onRestartClicked, this);
        }
        if (this.backgroundDimmer) {
            this.backgroundDimmer.off('click', this.onBackgroundClicked, this);
        }

        // Clear callbacks
        this.onResumeCallback = null;
        this.onHomeCallback = null;
    }
}

/**
 * Confirm Popup Example - Generic confirmation dialog
 */
export class ConfirmPopupPresenter extends BaseScreenPresenter {
    private titleLabel: any = null;
    private messageLabel: any = null;
    private confirmButton: any = null;
    private cancelButton: any = null;
    
    private onConfirmCallback: (() => void) | null = null;
    private onCancelCallback: (() => void) | null = null;

    public screenId = 'ConfirmPopup';
    public isClosePrevious = false;
    public isOverlay = true;

    protected async onInitialize(): Promise<void> {
        await this.setupUIComponents();
        await this.bindEvents();
    }

    protected async onBindData(data?: any): Promise<void> {
        // Set title and message
        if (this.titleLabel && data?.title) {
            this.titleLabel.string = data.title;
        }
        if (this.messageLabel && data?.message) {
            this.messageLabel.string = data.message;
        }

        // Store callbacks
        this.onConfirmCallback = data?.onConfirm || null;
        this.onCancelCallback = data?.onCancel || null;
    }

    private async setupUIComponents(): Promise<void> {
        if (!this.view) return;

        const popupContent = this.view.getChildByName('PopupContent');
        if (popupContent) {
            this.titleLabel = popupContent.getChildByName('TitleLabel')?.getComponent('Label');
            this.messageLabel = popupContent.getChildByName('MessageLabel')?.getComponent('Label');
            
            const buttonContainer = popupContent.getChildByName('ButtonContainer');
            if (buttonContainer) {
                this.confirmButton = buttonContainer.getChildByName('ConfirmButton')?.getComponent('Button');
                this.cancelButton = buttonContainer.getChildByName('CancelButton')?.getComponent('Button');
            }
        }
    }

    private async bindEvents(): Promise<void> {
        if (this.confirmButton) {
            this.confirmButton.node.on('click', this.onConfirmClicked, this);
        }
        if (this.cancelButton) {
            this.cancelButton.node.on('click', this.onCancelClicked, this);
        }
    }

    private async onConfirmClicked(): Promise<void> {
        // Close popup
        await ScreenManager.instance.closeScreen(this);
        
        // Execute callback
        if (this.onConfirmCallback) {
            this.onConfirmCallback();
        }
    }

    private async onCancelClicked(): Promise<void> {
        // Close popup
        await ScreenManager.instance.closeScreen(this);
        
        // Execute callback
        if (this.onCancelCallback) {
            this.onCancelCallback();
        }
    }

    protected onDispose(): void {
        if (this.confirmButton) {
            this.confirmButton.node.off('click', this.onConfirmClicked, this);
        }
        if (this.cancelButton) {
            this.cancelButton.node.off('click', this.onCancelClicked, this);
        }

        this.onConfirmCallback = null;
        this.onCancelCallback = null;
    }
}
