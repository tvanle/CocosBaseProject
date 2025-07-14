# Cocos Creator Integration Guide

Hướng dẫn tích hợp hệ thống Asset Management và Screen Management vào Cocos Creator project thực tế.

## Bước 1: Cấu trúc thư mục trong Cocos Creator

```
assets/
├── scripts/
│   ├── Core/                    # Copy từ CocosCreator/Core
│   │   ├── AssetManager/
│   │   ├── ScreenManager/
│   │   └── index.ts
│   ├── Screens/                 # Screen presenters của game
│   │   ├── HomeScreenPresenter.ts
│   │   ├── GameplayScreenPresenter.ts
│   │   ├── ShopScreenPresenter.ts
│   │   └── PopupPresenters.ts
│   ├── Game/                    # Game logic
│   │   ├── GameApplication.ts
│   │   ├── GameManager.ts
│   │   └── NavigationHelper.ts
│   └── main.ts                  # Entry point
├── resources/
│   └── prefab/
│       └── UI/                  # UI prefabs
│           ├── HomeScreen.prefab
│           ├── GameplayScreen.prefab
│           ├── ShopScreen.prefab
│           ├── PausePopup.prefab
│           └── ConfirmPopup.prefab
└── scene/
    └── main.scene              # Main scene
```

## Bước 2: Tạo Main Scene Setup

### 2.1 Main Scene Structure

```
Main Scene
├── Canvas (Canvas component)
│   ├── RootCanvas (Canvas component) - For normal screens
│   └── OverlayCanvas (Canvas component) - For popups/overlays
└── GameManager (Node with GameManager script)
```

### 2.2 Canvas Setup

**RootCanvas:**
- RenderMode: Screen Space-Overlay
- Order in Layer: 0
- Size: Design Resolution (1920x1080 hoặc theo thiết kế)

**OverlayCanvas:**
- RenderMode: Screen Space-Overlay
- Order in Layer: 10
- Size: Same as RootCanvas

## Bước 3: GameManager Script

Tạo script `GameManager.ts` trong main scene:

```typescript
import { _decorator, Component, Canvas } from 'cc';
import { GameApplication } from './Game/GameApplication';

const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    @property(Canvas)
    rootCanvas: Canvas = null!;

    @property(Canvas)
    overlayCanvas: Canvas = null!;

    async start() {
        // Initialize game application
        try {
            await GameApplication.instance.initialize(this.rootCanvas, this.overlayCanvas);
            console.log('Game started successfully');
        } catch (error) {
            console.error('Failed to start game:', error);
        }
    }

    onDestroy() {
        // Cleanup when game closes
        GameApplication.instance.cleanup();
    }
}
```

## Bước 4: Tạo UI Prefabs

### 4.1 Screen Prefab Structure

Mỗi screen prefab nên có cấu trúc:

```
ScreenPrefab (Node)
├── Background (Sprite)
├── Header (Node)
│   ├── Title (Label)
│   └── BackButton (Button)
├── Content (Node)
│   └── [Specific UI elements]
└── Footer (Node)
    └── [Bottom buttons]
```

### 4.2 Popup Prefab Structure

```
PopupPrefab (Node)
├── BackgroundDimmer (Sprite) - Semi-transparent background
└── PopupContent (Node)
    ├── Background (Sprite)
    ├── Header (Node)
    ├── Content (Node)
    └── ButtonContainer (Node)
```

## Bước 5: Screen Presenter Implementation

### 5.1 Cơ bản Screen Presenter

```typescript
import { BaseScreenPresenter } from '../Core/ScreenManager/BaseScreenPresenter';
import { Button, Label, Node } from 'cc';

export class HomeScreenPresenter extends BaseScreenPresenter {
    // UI references
    private playButton: Button | null = null;
    private titleLabel: Label | null = null;

    public screenId = 'HomeScreen';
    public isClosePrevious = true;

    protected async onInitialize(): Promise<void> {
        // Find UI components
        this.playButton = this.view?.getChildByPath('Content/PlayButton')?.getComponent(Button) || null;
        this.titleLabel = this.view?.getChildByPath('Header/Title')?.getComponent(Label) || null;

        // Bind events
        if (this.playButton) {
            this.playButton.node.on('click', this.onPlayClicked, this);
        }
    }

    protected async onBindData(data?: any): Promise<void> {
        if (this.titleLabel) {
            this.titleLabel.string = data?.title || 'Home';
        }
    }

    private onPlayClicked(): void {
        NavigationHelper.startGameplay();
    }

    protected onDispose(): void {
        if (this.playButton) {
            this.playButton.node.off('click', this.onPlayClicked, this);
        }
    }
}
```

## Bước 6: Asset Organization

### 6.1 Naming Convention

**UI Prefabs:** Đặt trong `resources/prefab/UI/`
- `HomeScreen.prefab`
- `GameplayScreen.prefab`
- `ShopScreen.prefab`
- `PausePopup.prefab`

**Sprites:** Đặt trong `resources/sprites/`
- `ui/` - UI sprites
- `game/` - Game sprites
- `icons/` - Icon sprites

### 6.2 Asset Loading Best Practices

```typescript
// Good: Specific path loading
const sprite = await AssetManager.instance.loadAsync<SpriteFrame>('sprites/ui/button_normal');

// Good: Batch preloading
const uiAssets = ['icon_coin', 'icon_gem', 'button_normal'];
await AssetManager.instance.preloadAsync(uiAssets);

// Good: Release when done
AssetManager.instance.release('heavy_texture');
```

## Bước 7: Registration Setup

### 7.1 Screen Registration

Trong `GameApplication.ts`:

```typescript
private registerScreenPresenters(): void {
    const registry = ScreenRegistry;

    // Main screens
    registry.registerScreen('HomeScreen', HomeScreenPresenter);
    registry.registerScreen('GameplayScreen', GameplayScreenPresenter);
    registry.registerScreen('ShopScreen', ShopScreenPresenter);
    registry.registerScreen('SettingsScreen', SettingsScreenPresenter);

    // Popups
    registry.registerScreen('PausePopup', PausePopupPresenter);
    registry.registerScreen('ConfirmPopup', ConfirmPopupPresenter);
    registry.registerScreen('RewardPopup', RewardPopupPresenter);
}
```

### 7.2 Alternative: Decorator Registration

```typescript
import { RegisterScreen } from '../Core/ScreenManager/ScreenPresenterFactory';

@RegisterScreen('HomeScreen')
export class HomeScreenPresenter extends BaseScreenPresenter {
    // Implementation
}
```

## Bước 8: Navigation Examples

### 8.1 Basic Navigation

```typescript
// Open screen
await ScreenManager.instance.openScreen('GameplayScreen');

// Open with data
await ScreenManager.instance.openScreen('ShopScreen', { category: 'weapons' });

// Open popup
await ScreenManager.instance.openScreen('PausePopup', {
    onResume: () => console.log('Resumed'),
    onHome: () => NavigationHelper.gotoHome()
});
```

### 8.2 Using Navigation Helper

```typescript
// Simple navigation
await NavigationHelper.gotoHome();
await NavigationHelper.startGameplay({ levelId: 5 });
await NavigationHelper.openShop('weapons');

// Confirmation dialog
await NavigationHelper.showConfirmDialog(
    'Delete Save',
    'Are you sure you want to delete your save file?',
    () => this.deleteSave(),
    () => console.log('Cancelled')
);
```

## Bước 9: Performance Optimization

### 9.1 Asset Preloading Strategy

```typescript
// Level-based preloading
export class LevelPreloader {
    static async preloadLevel(levelId: number): Promise<void> {
        const levelAssets = this.getLevelAssets(levelId);
        await AssetManager.instance.preloadAsync(levelAssets);
    }

    static async unloadLevel(levelId: number): Promise<void> {
        const levelAssets = this.getLevelAssets(levelId);
        levelAssets.forEach(asset => AssetManager.instance.release(asset));
    }
}
```

### 9.2 Screen Caching

```typescript
// Keep frequently used screens in memory
export class ScreenCache {
    private static cachedScreens = ['HomeScreen', 'GameplayScreen'];

    static shouldKeepInCache(screenId: string): boolean {
        return this.cachedScreens.includes(screenId);
    }
}
```

## Bước 10: Debug và Testing

### 10.1 Debug Helpers

```typescript
// Add to GameManager for debugging
@property({ tooltip: 'Enable debug mode' })
debugMode: boolean = false;

start() {
    if (this.debugMode) {
        this.setupDebugCommands();
    }
}

private setupDebugCommands(): void {
    // Add global debug functions
    (window as any).openScreen = (screenId: string, data?: any) => {
        ScreenManager.instance.openScreen(screenId, data);
    };
    
    (window as any).preloadAsset = (assetId: string) => {
        AssetManager.instance.loadAsync(assetId);
    };
}
```

### 10.2 Error Handling

```typescript
// Wrap navigation calls with error handling
export class SafeNavigation {
    static async openScreen(screenId: string, data?: any): Promise<void> {
        try {
            await ScreenManager.instance.openScreen(screenId, data);
        } catch (error) {
            console.error(`Failed to open screen ${screenId}:`, error);
            // Fallback to home screen
            await ScreenManager.instance.openScreen('HomeScreen');
        }
    }
}
```

## Troubleshooting

### Common Issues:

1. **Screen not found:** Đảm bảo screen đã được registered trong factory
2. **Asset not loading:** Kiểm tra đường dẫn trong resources folder
3. **UI components null:** Kiểm tra naming và hierarchy trong prefab
4. **Memory leaks:** Đảm bảo dispose() được gọi và event listeners được remove

### Performance Tips:

1. Preload essential assets khi start game
2. Release unused assets khi chuyển scene
3. Cache frequently used screens
4. Use object pooling cho frequently created/destroyed objects
