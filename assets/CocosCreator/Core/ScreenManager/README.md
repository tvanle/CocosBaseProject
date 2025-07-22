# Screen Manager System

Hệ thống quản lý màn hình đơn giản cho Cocos Creator với decorator pattern và API thống nhất.

## Tính năng

- ✅ **Simple API**: Chỉ sử dụng ScreenManager.instance
- ✅ **Auto-registration**: Tự động đăng ký qua @Screen decorator
- ✅ **Popup support**: Hỗ trợ popup với @Popup decorator
- ✅ **Transition effects**: Hiệu ứng chuyển màn hình đơn giản
- ✅ **MVP Pattern**: Tách biệt logic (Presenter) và UI (View)
- ✅ **Type-safe**: Full TypeScript support
- ✅ **Clean code**: Không có preload, không có navigator riêng

## Cấu trúc

```
ScreenManager/
├── ScreenManager.ts       # Class chính - tất cả logic trong này
├── ScreenDecorator.ts     # @Screen và @Popup decorators
├── BaseScreenPresenter.ts # Base class cho presenters
├── BaseView.ts           # Base class cho views
├── ScreenPresenter.ts   # Interface cho presenters
├── ScreenView.ts        # Interface cho views
├── ScreenTransition.ts   # Transition effects đơn giản
└── index.ts             # Export API
```

## Cách sử dụng

### 1. Tạo Screen Presenter

```typescript
import { BaseScreenPresenter, Screen } from './ScreenManager';

@Screen({ path: 'prefab/UI/MainMenu' })
export class MainMenuPresenter extends BaseScreenPresenter<MainMenuView> {
    viewName = 'MainMenuView';

    protected onViewReady(): void {
        this.view.playButton.on('click', () => this.onPlayClick());
    }

    protected async bindData(): Promise<void> {
        this.view.setTitle('Main Menu');
    }

    private async onPlayClick(): Promise<void> {
        await ScreenManager.instance.openScreen(GameplayPresenter, {
            model: { level: 1 }
        });
    }
}
```

### 2. Tạo Popup

```typescript
@Popup('prefab/UI/SettingsPopup')
export class SettingsPresenter extends BaseScreenPresenter<SettingsView> {
}
```

### 3. Screen với Model

```typescript
interface GameplayModel {
    level: number;
    score: number;
}

@Screen({ path: 'prefab/UI/GameplayView' })
export class GameplayPresenter extends BaseScreenPresenter<GameplayView, GameplayModel> {
    protected async bindData(): Promise<void> {
        this.view.setLevel(this.model.level);
        this.view.setScore(this.model.score);
    }

    updateScore(points: number): void {
        this.model.score += points;
        this.view.setScore(this.model.score);
    }
}
```
### 4. Custom View

```typescript
import { BaseView } from './ScreenManager';
import { _decorator, Label, Button } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('MainMenuView')
export class MainMenuView extends BaseView {
    @property(Label)
    titleLabel: Label = null;

    @property(Button)
    playButton: Button = null;

    setTitle(title: string): void {
        this.titleLabel.string = title;
    }
}
```

## Screen Lifecycle

```typescript
@Screen()
export class ExamplePresenter extends BaseScreenPresenter<ExampleView> {
    viewName = 'ExampleView';

    // 1. setModel() - nhận model data
    setModel(model: any): void {
        super.setModel(model);
    }

    // 2. setView() - view được gán
    async setView(view: IScreenView): Promise<void> {
        await super.setView(view);
    }

    // 3. onViewReady() - view sẵn sàng
    protected onViewReady(): void {
        // Setup event listeners
    }

    // 4. bindData() - bind model vào view
    protected async bindData(): Promise<void> {
        // Update UI với data
    }

    // 5. onOpened() - screen đã mở
    protected onOpened(): void {
        // Screen active
    }

    // 6. onClosed() - screen đã đóng
    protected onClosed(): void {
        // Cleanup
    }

    // 7. dispose() - giải phóng resources
    dispose(): void {
        // Final cleanup
    }
}
```

## Transition Types

```typescript
import { TransitionType } from './ScreenManager';

// Các loại transition
await ScreenManager.instance.openScreen(MyScreen, {
    transition: TransitionType.Fade,      // Fade in/out
    transition: TransitionType.SlideLeft,  // Slide từ phải sang
    transition: TransitionType.SlideRight, // Slide từ trái sang  
    transition: TransitionType.SlideUp,    // Slide từ dưới lên
    transition: TransitionType.SlideDown,  // Slide từ trên xuống
    transition: TransitionType.Scale,      // Scale effect
    transition: TransitionType.None,       // Không có effect
    duration: 0.3  // Thời gian transition (giây)
});
```

## API Chính

### 1. Mở Screen

```typescript
// Mở screen mới
await ScreenManager.instance.openScreen(MyScreen, {
    model: { data: 'value' },
    transition: TransitionType.Fade,
    duration: 0.5
});
```

### 2. Đóng Screen

```typescript
// Đóng screen
await ScreenManager.instance.closeScreen(MyScreen, {
    keepInMemory: true  // Giữ trong memory
});
```
### 4. Kiểm tra trạng thái

```typescript
// Kiểm tra screen có đang mở không
const isOpen = ScreenManager.instance.isScreenOpen(MyScreen);

// Lấy screen hiện tại
const current = ScreenManager.instance.getCurrentScreen();

```

## Best Practices

### ✅ Nên làm:
```typescript
// 1. Sử dụng decorators
@Screen({ path: 'prefab/UI/Game' })
export class GamePresenter extends BaseScreenPresenter<GameView> {}

// 4. Sử dụng ScreenManager API
await ScreenManager.instance.openScreen(NextScreen);
```

### ❌ Không nên:
```typescript
// 1. Mở nhiều screen không await
// BAD
ScreenManager.instance.openScreen(Screen1);  
ScreenManager.instance.openScreen(Screen2); // Conflict

// GOOD
await ScreenManager.instance.openScreen(Screen1);
await ScreenManager.instance.openScreen(Screen2);

// 2. Giữ reference đến closed screens
// BAD
class Manager {
    screens: IScreenPresenter[] = [];  // Memory leak
}

// 3. Bỏ qua lifecycle
// BAD
const screen = ScreenManager.instance.getCurrentScreen();
screen.view.node.active = false;  // Bỏ qua lifecycle
```

## Performance Tips

1. **Dispose properly**: Luôn cleanup trong dispose()
2. **Use popups**: Dùng popup cho UI tạm thời
3. **Keep in memory**: Dùng keepInMemory cho screen hay dùng
4. **Lazy load**: Chỉ load screen khi cần

## API Reference

### Decorators
- `@Screen(options?)` - Đăng ký screen
- `@Popup(path?)` - Đăng ký popup

### ScreenManager API
- `openScreen(presenter, options?)` - Mở screen
- `isScreenOpen(screen)` - Kiểm tra đang mở
- `getCurrentScreen()` - Screen hiện tại
- `registerScreen(class, path?, isPopup?)` - Đăng ký manual
- `closeAll()` - Đóng tất cả