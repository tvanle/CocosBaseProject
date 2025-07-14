import { IScreenPresenter } from './IScreenPresenter';
import { BaseScreenPresenter } from './BaseScreenPresenter';

/**
 * Screen Presenter Factory
 * Factory pattern để tạo các screen presenter instances
 * Tương tự như Factory trong Unity DI system
 */
export class ScreenPresenterFactory {
    private static _instance: ScreenPresenterFactory;
    private _presenterRegistry: Map<string, () => IScreenPresenter> = new Map();

    public static get instance(): ScreenPresenterFactory {
        if (!this._instance) {
            this._instance = new ScreenPresenterFactory();
        }
        return this._instance;
    }

    private constructor() {
        this.registerDefaultPresenters();
    }

    /**
     * Register một screen presenter class với screen ID
     */
    public registerPresenter<T extends IScreenPresenter>(
        screenId: string, 
        presenterFactory: () => T
    ): void {
        this._presenterRegistry.set(screenId, presenterFactory);
    }

    /**
     * Tạo screen presenter instance từ screen ID
     */
    public createPresenter<T extends IScreenPresenter>(screenId: string): T | null {
        const factory = this._presenterRegistry.get(screenId);
        if (factory) {
            return factory() as T;
        }

        console.error(`No presenter registered for screen ID: ${screenId}`);
        return null;
    }

    /**
     * Kiểm tra xem screen ID đã được register chưa
     */
    public isPresenterRegistered(screenId: string): boolean {
        return this._presenterRegistry.has(screenId);
    }

    /**
     * Lấy danh sách tất cả registered screen IDs
     */
    public getRegisteredScreenIds(): string[] {
        return Array.from(this._presenterRegistry.keys());
    }

    /**
     * Unregister screen presenter
     */
    public unregisterPresenter(screenId: string): void {
        this._presenterRegistry.delete(screenId);
    }

    /**
     * Clear tất cả registered presenters
     */
    public clearAllPresenters(): void {
        this._presenterRegistry.clear();
        this.registerDefaultPresenters();
    }

    /**
     * Register default presenters (có thể override trong game cụ thể)
     */
    private registerDefaultPresenters(): void {
        // Register default/example presenters
        // Trong thực tế, các presenter sẽ được register trong game code

        // Example:
        // this.registerPresenter('HomeScreen', () => new HomeScreenPresenter());
        // this.registerPresenter('GameplayScreen', () => new GameplayScreenPresenter());
        // this.registerPresenter('ShopScreen', () => new ShopScreenPresenter());
        
        console.log('Default screen presenters registered');
    }
}

/**
 * Screen Registration Helper
 * Helper class để đăng ký screen một cách dễ dàng
 */
export class ScreenRegistry {
    /**
     * Đăng ký tất cả screen presenters cho game
     * Gọi method này khi khởi tạo game
     */
    public static registerAllScreens(): void {
        const factory = ScreenPresenterFactory.instance;

        // Import và register tất cả screen presenters ở đây
        // Trong thực tế, bạn sẽ import các presenter classes

        // Example registrations:
        /*
        import { HomeScreenPresenter } from '../Examples/HomeScreenPresenter';
        import { GameplayScreenPresenter } from '../Examples/GameplayScreenPresenter';
        import { ShopScreenPresenter } from '../Examples/ShopScreenPresenter';
        import { PausePopupPresenter, ConfirmPopupPresenter } from '../Examples/PopupScreenPresenters';

        factory.registerPresenter('HomeScreen', () => new HomeScreenPresenter());
        factory.registerPresenter('GameplayScreen', () => new GameplayScreenPresenter());
        factory.registerPresenter('ShopScreen', () => new ShopScreenPresenter());
        factory.registerPresenter('PausePopup', () => new PausePopupPresenter());
        factory.registerPresenter('ConfirmPopup', () => new ConfirmPopupPresenter());
        */

        console.log('All screen presenters registered');
    }

    /**
     * Đăng ký một screen presenter cụ thể
     */
    public static registerScreen<T extends IScreenPresenter>(
        screenId: string,
        presenterClass: new () => T
    ): void {
        const factory = ScreenPresenterFactory.instance;
        factory.registerPresenter(screenId, () => new presenterClass());
    }

    /**
     * Đăng ký screen với custom factory function
     */
    public static registerScreenWithFactory<T extends IScreenPresenter>(
        screenId: string,
        factoryFunction: () => T
    ): void {
        const factory = ScreenPresenterFactory.instance;
        factory.registerPresenter(screenId, factoryFunction);
    }
}

/**
 * Screen Registration Decorator (Optional)
 * Decorator để tự động đăng ký screen presenter
 */
export function RegisterScreen(screenId: string) {
    return function <T extends new (...args: any[]) => IScreenPresenter>(constructor: T) {
        // Auto-register khi class được define
        ScreenPresenterFactory.instance.registerPresenter(screenId, () => new constructor());
        return constructor;
    };
}

// Export types
export type PresenterFactory<T extends IScreenPresenter> = () => T;
export type PresenterConstructor<T extends IScreenPresenter> = new () => T;
