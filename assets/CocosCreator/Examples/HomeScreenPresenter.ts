import { BaseScreenPresenter } from '../Core/ScreenManager/BaseScreenPresenter';
import { ScreenManager } from '../Core/ScreenManager/ScreenManager';
import { AssetManager } from '../Core/AssetManager/AssetManager';

/**
 * Home Screen Presenter Example
 * Tương tự như HomeScreenPresenter trong Unity project
 */
export class HomeScreenPresenter extends BaseScreenPresenter {
    // UI References - tương tự như SerializeField trong Unity
    private playButton: any = null; // Button component
    private shopButton: any = null; // Button component
    private settingsButton: any = null; // Button component
    private titleLabel: any = null; // Label component
    private coinLabel: any = null; // Label component
    private coinIcon: any = null; // Sprite component

    // Screen configuration
    public screenId = 'HomeScreen';
    public isClosePrevious = true;

    /**
     * Initialize UI components và event bindings
     * Tương tự OnViewReady trong Unity
     */
    protected async onInitialize(): Promise<void> {
        await this.setupUIComponents();
        await this.bindEvents();
        await this.preloadAssets();
    }

    /**
     * Bind data vào UI
     * Tương tự BindData trong Unity
     */
    protected async onBindData(data?: any): Promise<void> {
        await this.updateCoinDisplay();
        await this.updateTitle(data?.title);
    }

    /**
     * Called when view is opened
     * Tương tự OnViewOpened trong Unity
     */
    protected async onViewOpened(): Promise<void> {
        console.log('Home Screen opened');
        // Có thể thêm animation entrance
        await this.playOpenAnimation();
    }

    /**
     * Setup UI component references
     * Tương tự cách assign SerializeField trong Unity
     */
    private async setupUIComponents(): Promise<void> {
        if (!this.view) return;

        // Find UI components by path hoặc name
        // Tương tự GetComponent trong Unity
        this.playButton = this.view.getChildByName('PlayButton')?.getComponent('Button');
        this.shopButton = this.view.getChildByName('ShopButton')?.getComponent('Button');
        this.settingsButton = this.view.getChildByName('SettingsButton')?.getComponent('Button');
        this.titleLabel = this.view.getChildByName('TitleLabel')?.getComponent('Label');
        this.coinLabel = this.view.getChildByPath('TopBar/CoinLabel')?.getComponent('Label');
        this.coinIcon = this.view.getChildByPath('TopBar/CoinIcon')?.getComponent('Sprite');

        console.log('UI components setup completed');
    }

    /**
     * Bind button events
     * Tương tự OnClick events trong Unity
     */
    private async bindEvents(): Promise<void> {
        if (this.playButton) {
            this.playButton.node.on('click', this.onPlayClicked, this);
        }

        if (this.shopButton) {
            this.shopButton.node.on('click', this.onShopClicked, this);
        }

        if (this.settingsButton) {
            this.settingsButton.node.on('click', this.onSettingsClicked, this);
        }

        console.log('Events bound successfully');
    }

    /**
     * Preload assets for performance
     * Tương tự PreloadAsync trong Unity
     */
    private async preloadAssets(): Promise<void> {
        const assetManager = AssetManager.instance;
        
        // Preload các screen có thể được mở từ Home
        await assetManager.preloadAsync([
            'GameplayScreen',
            'ShopScreen',
            'SettingsScreen'
        ]);

        // Preload common sprites
        await assetManager.preloadAsync([
            'icon_coin',
            'icon_gem',
            'btn_play_normal',
            'btn_play_pressed'
        ]);

        console.log('Assets preloaded');
    }

    /**
     * Update coin display
     * Tương tự currency display trong Unity project
     */
    private async updateCoinDisplay(): Promise<void> {
        if (this.coinLabel) {
            // Lấy coin amount từ game data (có thể từ local storage hoặc game state)
            const coinAmount = this.getCoinAmount();
            this.coinLabel.string = coinAmount.toLocaleString();
        }

        if (this.coinIcon) {
            // Load coin sprite
            const coinSprite = await AssetManager.instance.loadSprite('icon_coin');
            if (coinSprite) {
                this.coinIcon.spriteFrame = coinSprite;
            }
        }
    }

    /**
     * Update title text
     */
    private async updateTitle(title?: string): Promise<void> {
        if (this.titleLabel) {
            this.titleLabel.string = title || 'Screw 3D';
        }
    }

    /**
     * Play opening animation
     * Tương tự UI animation trong Unity
     */
    private async playOpenAnimation(): Promise<void> {
        // Placeholder for entrance animation
        // Có thể sử dụng Cocos Creator's Tween system
        console.log('Playing open animation');
    }

    // Event Handlers - tương tự Unity's OnClick methods

    /**
     * Handle play button click
     * Tương tự OnClickPlay trong Unity
     */
    private async onPlayClicked(): Promise<void> {
        console.log('Play button clicked');
        
        // Có thể thêm audio feedback
        // AudioManager.instance.playSound('button_click');

        // Chuyển sang gameplay screen
        await ScreenManager.instance.openScreen('GameplayScreen');
    }

    /**
     * Handle shop button click
     * Tương tự OnClickShop trong Unity
     */
    private async onShopClicked(): Promise<void> {
        console.log('Shop button clicked');
        
        // Mở shop screen without closing home (overlay)
        await ScreenManager.instance.openScreen('ShopScreen');
    }

    /**
     * Handle settings button click
     * Tương tự OnClickSettings trong Unity
     */
    private async onSettingsClicked(): Promise<void> {
        console.log('Settings button clicked');
        
        // Mở settings popup
        await ScreenManager.instance.openScreen('SettingsPopup');
    }

    /**
     * Get current coin amount
     * Tương tự currency service trong Unity
     */
    private getCoinAmount(): number {
        // Placeholder - trong thực tế sẽ lấy từ game state hoặc local storage
        // return GameDataManager.instance.getCurrency('coin');
        return 1000;
    }

    /**
     * Cleanup when screen is disposed
     * Tương tự Dispose trong Unity
     */
    protected onDispose(): void {
        // Unbind events để tránh memory leak
        if (this.playButton) {
            this.playButton.node.off('click', this.onPlayClicked, this);
        }

        if (this.shopButton) {
            this.shopButton.node.off('click', this.onShopClicked, this);
        }

        if (this.settingsButton) {
            this.settingsButton.node.off('click', this.onSettingsClicked, this);
        }

        console.log('Home Screen disposed');
    }
}
