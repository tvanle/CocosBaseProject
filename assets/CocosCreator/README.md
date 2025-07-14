# Cocos Creator Asset & Screen Management System

Hệ thống quản lý Asset và Screen cho Cocos Creator được xây dựng dựa trên kiến trúc Unity GameFoundation. Hệ thống này thay thế Dependency Injection bằng Singleton pattern và sử dụng Resources.load thay vì Addressable.

## Cấu trúc thư mục

```
CocosCreator/
├── Core/
│   ├── AssetManager/
│   │   ├── IAssetManager.ts      # Interface cho Asset Management
│   │   └── AssetManager.ts       # Implementation sử dụng Singleton
│   ├── ScreenManager/
│   │   ├── IScreenPresenter.ts   # Interface cho Screen Presenter
│   │   ├── IScreenManager.ts     # Interface cho Screen Manager
│   │   ├── ScreenManager.ts      # Implementation Screen Manager
│   │   └── BaseScreenPresenter.ts # Base class cho Screen Presenter
│   └── index.ts                  # Core exports
```

## Asset Manager

### Cách sử dụng

```typescript
import { AssetManager } from './Core/AssetManager/AssetManager';

// Lấy instance singleton
const assetManager = AssetManager.instance;

// Load asset bất đồng bộ
const sprite = await assetManager.loadAsync<SpriteFrame>('icon_coin');

// Load asset đồng bộ (từ cache)
const cachedSprite = assetManager.load<SpriteFrame>('icon_coin');

// Load và instantiate prefab
const uiNode = await assetManager.loadComponent<Node>('HomeScreen');

// Preload nhiều asset
await assetManager.preloadAsync(['icon_coin', 'icon_gem', 'HomeScreen']);

// Release asset
assetManager.release('icon_coin');

// Release tất cả
assetManager.releaseAll();
```

### Đường dẫn mặc định

Hệ thống sẽ tự động tìm asset theo thứ tự:
1. `prefab/UI/${id}` - Đường dẫn mặc định cho UI prefab
2. `${id}` - Đường dẫn trực tiếp

## Screen Manager

### Cách sử dụng

```typescript
import { ScreenManager } from './Core/ScreenManager/ScreenManager';
import { BaseScreenPresenter } from './Core/ScreenManager/BaseScreenPresenter';

// Lấy instance singleton
const screenManager = ScreenManager.instance;

// Khởi tạo với canvas
screenManager.initialize(rootCanvas, overlayCanvas);

// Mở screen
await screenManager.openScreen('HomeScreen');

// Mở screen với data
await screenManager.openScreen('ShopScreen', { itemId: 'coin_pack_1' });

// Đóng screen hiện tại
await screenManager.closeCurrentScreen();

// Đóng tất cả screen
await screenManager.closeAllScreens();

// Đóng tất cả overlay/popup
await screenManager.closeAllOverlayScreens();
```

### Tạo Screen Presenter

```typescript
import { BaseScreenPresenter } from './Core/ScreenManager/BaseScreenPresenter';
import { Node, Button, Label } from 'cc';

export class HomeScreenPresenter extends BaseScreenPresenter {
    private playButton: Button | null = null;
    private titleLabel: Label | null = null;

    protected async onInitialize(): Promise<void> {
        // Tìm và bind UI components
        this.playButton = this.view?.getChildByName('PlayButton')?.getComponent(Button) || null;
        this.titleLabel = this.view?.getChildByName('Title')?.getComponent(Label) || null;

        // Bind events
        if (this.playButton) {
            this.playButton.node.on('click', this.onPlayClicked, this);
        }
    }

    protected async onBindData(data?: any): Promise<void> {
        if (data && this.titleLabel) {
            this.titleLabel.string = data.title || 'Home';
        }
    }

    private onPlayClicked(): void {
        // Mở gameplay screen
        ScreenManager.instance.openScreen('GameplayScreen');
    }

    protected onDispose(): void {
        // Cleanup
        if (this.playButton) {
            this.playButton.node.off('click', this.onPlayClicked, this);
        }
    }
}
```

## Screen Presenter Factory

### Đăng ký Screen Presenters

```typescript
import { ScreenRegistry } from './Core/ScreenManager/ScreenPresenterFactory';
import { HomeScreenPresenter } from './Examples/HomeScreenPresenter';

// Method 1: Register với class
ScreenRegistry.registerScreen('HomeScreen', HomeScreenPresenter);

// Method 2: Register với factory function
ScreenRegistry.registerScreenWithFactory('HomeScreen', () => new HomeScreenPresenter());

// Method 3: Auto-register với decorator
@RegisterScreen('HomeScreen')
export class HomeScreenPresenter extends BaseScreenPresenter {
    // Implementation
}
```

### Factory Pattern Usage

```typescript
// Factory tự động tạo presenter instance khi openScreen
await ScreenManager.instance.openScreen('HomeScreen');

// Kiểm tra registration
const factory = ScreenPresenterFactory.instance;
if (factory.isPresenterRegistered('HomeScreen')) {
    console.log('HomeScreen is registered');
}
```

## Ví dụ thực tế

### GameplayScreen với Timer và Score

```typescript
export class GameplayScreenPresenter extends BaseScreenPresenter {
    public screenId = 'GameplayScreen';
    private currentScore: number = 0;
    private gameTimer: any = null;

    protected async onInitialize(): Promise<void> {
        // Setup UI và bind events
        await this.setupGameplayUI();
    }

    protected async onViewOpened(): Promise<void> {
        // Start game timer
        this.startGameTimer();
    }

    public addScore(points: number): void {
        this.currentScore += points;
        this.updateScoreDisplay();
    }
}
```

### Popup với Animation

```typescript
export class PausePopupPresenter extends BaseScreenPresenter {
    public screenId = 'PausePopup';
    public isOverlay = true; // Không đóng screen phía dưới

    protected async onViewOpened(): Promise<void> {
        await this.playPopupAnimation();
    }

    private async playPopupAnimation(): Promise<void> {
        // Scale từ 0 đến 1 với bounce effect
        // tween(this.view).to(0.3, { scale: cc.v3(1, 1, 1) }).start();
    }
}
```

## Tích hợp vào Cocos Creator Project

### Setup cơ bản

```typescript
// GameManager.ts - Main scene script
@ccclass('GameManager')
export class GameManager extends Component {
    @property(Canvas) rootCanvas: Canvas = null!;
    @property(Canvas) overlayCanvas: Canvas = null!;

    async start() {
        // Initialize hệ thống
        await GameApplication.instance.initialize(this.rootCanvas, this.overlayCanvas);
    }
}
```

### Navigation Helpers

```typescript
// Helper functions cho navigation dễ dàng
export class NavigationHelper {
    static async gotoHome(): Promise<void> {
        await ScreenManager.instance.openScreen('HomeScreen');
    }

    static async startGameplay(levelData?: any): Promise<void> {
        await ScreenManager.instance.openScreen('GameplayScreen', { levelData });
    }

    static async showConfirmDialog(title: string, message: string): Promise<void> {
        await ScreenManager.instance.openScreen('ConfirmPopup', { title, message });
    }
}
```

## So sánh với Unity GameFoundation

### Asset Management

| Unity (GameFoundation) | Cocos Creator |
|------------------------|---------------|
| `IGameAssets.LoadAssetAsync<T>()` | `AssetManager.instance.loadAsync<T>()` |
| `IGameAssets.ForceLoadAsset<T>()` | `AssetManager.instance.load<T>()` |
| `IAssetsManager.LoadComponent<T>()` | `AssetManager.instance.loadComponent<T>()` |
| `Resources.Load()` | `resources.load()` |
| Dependency Injection | Singleton Pattern |

### Screen Management

| Unity (GameFoundation) | Cocos Creator |
|------------------------|---------------|
| `IScreenManager.OpenScreen<T>()` | `ScreenManager.instance.openScreen<T>()` |
| `IScreenManager.CloseCurrentScreen()` | `ScreenManager.instance.closeCurrentScreen()` |
| `BaseScreenPresenter<T>` | `BaseScreenPresenter` |
| Zenject DI Container | Singleton Pattern |

## Lưu ý

1. **Singleton Pattern**: Thay vì sử dụng DI như Unity, hệ thống này sử dụng Singleton để đơn giản hóa.

2. **Resources Loading**: Mặc định sử dụng `resources.load()` với đường dẫn `prefab/UI/${id}`.

3. **Component Architecture**: Screens phải extend từ `BaseScreenPresenter` và attach vào prefab root node.

4. **Canvas Management**: Cần khởi tạo ScreenManager với rootCanvas và overlayCanvas.

5. **Lifecycle**: Screen có đầy đủ lifecycle: Initialize → BindData → Open → Show/Hide → Close → Dispose.

## Ví dụ tích hợp

```typescript
// Game.ts - Main game script
import { AssetManager } from './Core/AssetManager/AssetManager';
import { ScreenManager } from './Core/ScreenManager/ScreenManager';

export class Game {
    async start() {
        // Khởi tạo managers
        const screenManager = ScreenManager.instance;
        screenManager.initialize(this.rootCanvas, this.overlayCanvas);

        // Preload UI assets
        const assetManager = AssetManager.instance;
        await assetManager.preloadAsync([
            'HomeScreen',
            'GameplayScreen',
            'ShopScreen'
        ]);

        // Mở home screen
        await screenManager.openScreen('HomeScreen');
    }
}
```

Hệ thống này cung cấp một cách tiếp cận quen thuộc cho những developer đã làm việc với Unity GameFoundation, nhưng được tối ưu hóa cho Cocos Creator với TypeScript.
