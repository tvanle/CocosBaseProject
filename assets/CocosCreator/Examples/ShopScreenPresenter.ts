import { BaseScreenPresenter } from '../Core/ScreenManager/BaseScreenPresenter';
import { ScreenManager } from '../Core/ScreenManager/ScreenManager';
import { AssetManager } from '../Core/AssetManager/AssetManager';

/**
 * Shop Screen Presenter Example
 * Tương tự như ShopScreenPresenter trong Unity project
 */
export class ShopScreenPresenter extends BaseScreenPresenter {
    // UI References
    private closeButton: any = null;
    private coinPackContainer: any = null;
    private gemPackContainer: any = null;
    private scrollView: any = null;
    private tabButtons: any[] = [];

    // Data
    private currentTab: string = 'coins';
    private shopData: any = null;

    // Screen configuration
    public screenId = 'ShopScreen';
    public isClosePrevious = false; // Overlay screen

    /**
     * Initialize shop screen
     */
    protected async onInitialize(): Promise<void> {
        await this.setupUIComponents();
        await this.bindEvents();
        await this.loadShopData();
    }

    /**
     * Bind shop data
     */
    protected async onBindData(data?: any): Promise<void> {
        this.shopData = data || await this.getDefaultShopData();
        await this.refreshShopItems();
    }

    /**
     * Setup UI components
     */
    private async setupUIComponents(): Promise<void> {
        if (!this.view) return;

        this.closeButton = this.view.getChildByName('CloseButton')?.getComponent('Button');
        this.coinPackContainer = this.view.getChildByPath('Content/CoinPacks');
        this.gemPackContainer = this.view.getChildByPath('Content/GemPacks');
        this.scrollView = this.view.getChildByName('ScrollView')?.getComponent('ScrollView');

        // Setup tab buttons
        const tabContainer = this.view.getChildByName('TabContainer');
        if (tabContainer) {
            this.tabButtons = [];
            for (let i = 0; i < tabContainer.children.length; i++) {
                const tabButton = tabContainer.children[i].getComponent('Button');
                if (tabButton) {
                    this.tabButtons.push(tabButton);
                }
            }
        }
    }

    /**
     * Bind events
     */
    private async bindEvents(): Promise<void> {
        if (this.closeButton) {
            this.closeButton.node.on('click', this.onCloseClicked, this);
        }

        // Bind tab buttons
        this.tabButtons.forEach((button, index) => {
            button.node.on('click', () => this.onTabClicked(index), this);
        });
    }

    /**
     * Load shop data
     * Tương tự loading shop config trong Unity
     */
    private async loadShopData(): Promise<void> {
        // Có thể load từ remote config hoặc local data
        // this.shopData = await RemoteConfigManager.instance.getShopConfig();
        
        // Placeholder data
        this.shopData = await this.getDefaultShopData();
    }

    /**
     * Get default shop data
     */
    private async getDefaultShopData(): Promise<any> {
        return {
            coinPacks: [
                { id: 'coin_pack_1', amount: 1000, price: '$0.99', icon: 'icon_coin_pack_1' },
                { id: 'coin_pack_2', amount: 5000, price: '$4.99', icon: 'icon_coin_pack_2' },
                { id: 'coin_pack_3', amount: 10000, price: '$9.99', icon: 'icon_coin_pack_3' }
            ],
            gemPacks: [
                { id: 'gem_pack_1', amount: 100, price: '$1.99', icon: 'icon_gem_pack_1' },
                { id: 'gem_pack_2', amount: 500, price: '$9.99', icon: 'icon_gem_pack_2' }
            ]
        };
    }

    /**
     * Refresh shop items display
     * Tương tự RefreshUI trong Unity
     */
    private async refreshShopItems(): Promise<void> {
        if (this.currentTab === 'coins') {
            await this.displayCoinPacks();
        } else if (this.currentTab === 'gems') {
            await this.displayGemPacks();
        }
    }

    /**
     * Display coin packs
     */
    private async displayCoinPacks(): Promise<void> {
        if (!this.coinPackContainer || !this.shopData.coinPacks) return;

        // Clear existing items
        this.coinPackContainer.removeAllChildren();

        // Create coin pack items
        for (const pack of this.shopData.coinPacks) {
            const packItem = await this.createShopItem(pack);
            if (packItem) {
                this.coinPackContainer.addChild(packItem);
            }
        }
    }

    /**
     * Display gem packs
     */
    private async displayGemPacks(): Promise<void> {
        if (!this.gemPackContainer || !this.shopData.gemPacks) return;

        // Clear existing items
        this.gemPackContainer.removeAllChildren();

        // Create gem pack items
        for (const pack of this.shopData.gemPacks) {
            const packItem = await this.createShopItem(pack);
            if (packItem) {
                this.gemPackContainer.addChild(packItem);
            }
        }
    }

    /**
     * Create shop item from data
     * Tương tự instantiate shop item prefab trong Unity
     */
    private async createShopItem(itemData: any): Promise<any> {
        try {
            // Load shop item prefab
            const itemPrefab = await AssetManager.instance.loadComponent('ShopItemView');
            if (!itemPrefab) return null;

            // Setup item data
            const itemPresenter = itemPrefab.getComponent('ShopItemPresenter');
            if (itemPresenter) {
                await itemPresenter.setupData(itemData);
                
                // Bind purchase event
                itemPresenter.onPurchaseClicked = () => this.onItemPurchased(itemData);
            }

            return itemPrefab;
        } catch (error) {
            console.error('Failed to create shop item:', error);
            return null;
        }
    }

    /**
     * Handle tab click
     */
    private async onTabClicked(tabIndex: number): Promise<void> {
        const tabs = ['coins', 'gems'];
        this.currentTab = tabs[tabIndex] || 'coins';

        // Update tab button states
        this.updateTabButtons(tabIndex);

        // Refresh items
        await this.refreshShopItems();
    }

    /**
     * Update tab button visual states
     */
    private updateTabButtons(activeIndex: number): void {
        this.tabButtons.forEach((button, index) => {
            // Update visual state (có thể change sprite hoặc color)
            const isActive = index === activeIndex;
            // button.getComponent('Sprite').color = isActive ? Color.WHITE : Color.GRAY;
        });
    }

    /**
     * Handle item purchase
     * Tương tự IAP handling trong Unity
     */
    private async onItemPurchased(itemData: any): Promise<void> {
        console.log('Item purchased:', itemData);

        try {
            // Process purchase (IAP or virtual currency)
            const success = await this.processPurchase(itemData);
            
            if (success) {
                // Show success feedback
                await this.showPurchaseSuccess(itemData);
                
                // Update UI if needed
                await this.refreshShopItems();
            } else {
                // Show error feedback
                await this.showPurchaseError();
            }
        } catch (error) {
            console.error('Purchase failed:', error);
            await this.showPurchaseError();
        }
    }

    /**
     * Process purchase
     */
    private async processPurchase(itemData: any): Promise<boolean> {
        // Placeholder for IAP or virtual currency purchase
        // return await IAPManager.instance.purchaseProduct(itemData.id);
        
        // Mock successful purchase
        return new Promise(resolve => {
            setTimeout(() => resolve(true), 1000);
        });
    }

    /**
     * Show purchase success feedback
     */
    private async showPurchaseSuccess(itemData: any): Promise<void> {
        // Show success popup hoặc effect
        console.log(`Purchase successful: ${itemData.amount} coins!`);
        
        // Có thể mở reward popup
        // await ScreenManager.instance.openScreen('RewardPopup', {
        //     rewards: [{ type: 'coin', amount: itemData.amount }]
        // });
    }

    /**
     * Show purchase error feedback
     */
    private async showPurchaseError(): Promise<void> {
        console.log('Purchase failed. Please try again.');
        
        // Show error popup
        // await ScreenManager.instance.openScreen('ErrorPopup', {
        //     message: 'Purchase failed. Please try again.'
        // });
    }

    /**
     * Handle close button click
     */
    private async onCloseClicked(): Promise<void> {
        await ScreenManager.instance.closeCurrentScreen();
    }

    /**
     * Cleanup
     */
    protected onDispose(): void {
        // Unbind events
        if (this.closeButton) {
            this.closeButton.node.off('click', this.onCloseClicked, this);
        }

        this.tabButtons.forEach((button, index) => {
            button.node.off('click');
        });

        console.log('Shop Screen disposed');
    }
}
