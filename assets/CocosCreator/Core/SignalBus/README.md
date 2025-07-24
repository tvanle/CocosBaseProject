# SignalBus System for Cocos Creator

TypeScript port của Unity C# SignalBus (Zenject/Extenject) cho Cocos Creator. Hệ thống messaging type-safe và decoupled sử dụng singleton pattern.

## 📋 Tổng quan

SignalBus là một pattern messaging mạnh mẽ cho phép các component giao tiếp với nhau mà không cần reference trực tiếp. Điều này giúp giảm coupling và tăng tính module của code.

### ✨ Tính năng chính

- **Type-safe**: Đảm bảo type safety với TypeScript
- **Decoupled**: Components không cần biết về nhau
- **Singleton**: Truy cập global thông qua SignalBus.instance
- **Flexible**: Hỗ trợ signals với 0-5 parameters
- **Memory-safe**: Tự động cleanup với subscription tokens
- **Debug-friendly**: Built-in debug methods

## 🚀 Cách sử dụng

### 1. Khởi tạo cơ bản

```typescript
import { SignalHelper } from './SignalBus';

// Khởi tạo tất cả signals (thường ở Game Manager)
SignalHelper.initializeSignals();
```

### 2. Tạo custom signals

```typescript
import { Signal, Signal1, Signal2 } from './SignalBus';

// Signal không parameter
@ccclass('MyCustomSignal')
export class MyCustomSignal extends Signal {}

// Signal với 1 parameter
@ccclass('PlayerHealthSignal')
export class PlayerHealthSignal extends Signal1<number> {}

// Signal với 2 parameters
@ccclass('ItemPickupSignal')
export class ItemPickupSignal extends Signal2<string, number> {} // itemType, amount
```

### 3. Subscribe và Unsubscribe

```typescript
import { SignalBus, ISubscriptionToken } from './SignalBus';
import { GameStartedSignal, ScoreChangedSignal } from './GameSignals';

export class MyComponent extends Component {
    private subscriptions: ISubscriptionToken[] = [];
    
    protected onLoad(): void {
        // Method 1: Sử dụng SignalBus trực tiếp
        this.subscriptions.push(
            SignalBus.instance.subscribe(GameStartedSignal, this.onGameStarted.bind(this))
        );
        
        this.subscriptions.push(
            SignalBus.instance.subscribe(ScoreChangedSignal, this.onScoreChanged.bind(this))
        );
        
        // Method 2: Sử dụng SignalHelper (tiện lợi hơn)
        this.subscriptions.push(
            SignalHelper.onLevelCompleted(this.onLevelCompleted.bind(this))
        );
    }
    
    protected onDestroy(): void {
        // Cleanup subscriptions
        this.subscriptions.forEach(sub => sub.unsubscribe());
        this.subscriptions = [];
    }
    
    private onGameStarted(): void {
        console.log('Game started!');
    }
    
    private onScoreChanged(newScore: number): void {
        console.log('Score:', newScore);
    }
    
    private onLevelCompleted(): void {
        console.log('Level completed!');
    }
}
```

### 4. Fire signals

```typescript
// Method 1: Sử dụng SignalHelper (khuyến nghị)
SignalHelper.fireGameStarted();
SignalHelper.fireScoreChanged(100);
SignalHelper.firePlayerMove({ x: 10, y: 5 });

// Method 2: Sử dụng SignalBus trực tiếp
SignalBus.instance.fire(GameStartedSignal);
SignalBus.instance.fire(ScoreChangedSignal, 100);
SignalBus.instance.fire(PlayerMoveSignal, { x: 10, y: 5 });
```

## 📚 API Reference

### SignalBus (Singleton)

```typescript
// Khởi tạo
SignalBus.instance

// Declare signals
signalBus.declareSignal(MySignalClass);

// Subscribe
const token = signalBus.subscribe(MySignalClass, callback);

// Unsubscribe
signalBus.unsubscribe(MySignalClass, callback);
token.unsubscribe(); // hoặc dùng token

// Fire signals
signalBus.fire(NoParamSignal);
signalBus.fire(OneParamSignal, param);
signalBus.fire(TwoParamSignal, param1, param2);

// Utilities
signalBus.hasSubscribers(MySignalClass);
signalBus.clearSignal(MySignalClass);
signalBus.clearAllSignals();
signalBus.debugSignals();
```

### SignalHelper (Convenience)

```typescript
// Initialization
SignalHelper.initializeSignals();

// Common game events
SignalHelper.fireGameStarted();
SignalHelper.fireLevelCompleted();
SignalHelper.fireScoreChanged(100);

// Subscriptions
SignalHelper.onGameStarted(() => {});
SignalHelper.onScoreChanged((score) => {});

// Debug
SignalHelper.debugSignals();
SignalHelper.clearAllSignals();
```

## 🎮 Game Signals có sẵn

### No Parameters
- `GameStartedSignal`
- `GamePausedSignal`
- `GameOverSignal`
- `LevelCompletedSignal`
- `LevelFailedSignal`
- `RedirectToStoreSignal`

### One Parameter
- `ScoreChangedSignal(number)`
- `HealthChangedSignal(number)`
- `AudioPlaySignal(string)`
- `LevelLoadedSignal(number)`
- `PlayerMoveSignal({x, y})`

### Two Parameters
- `DamageDealtSignal(number, string)`
- `ItemCollectedSignal(string, number)`
- `UIButtonClickedSignal(string, any)`
- `GridCellSelectedSignal(number, number)`

### Three Parameters
- `ShapeCompletedSignal(number, number, boolean)`
- `TutorialStepSignal(number, string, any)`

## 💡 Best Practices

### 1. Initialization
```typescript
// Trong Game Manager hoặc entry point
protected onLoad(): void {
    SignalHelper.initializeSignals();
}
```

### 2. Component Lifecycle
```typescript
export class GameComponent extends Component {
    private subscriptions: ISubscriptionToken[] = [];
    
    protected onLoad(): void {
        this.setupSignals();
    }
    
    protected onDestroy(): void {
        this.cleanupSignals();
    }
    
    private setupSignals(): void {
        this.subscriptions.push(
            SignalHelper.onGameStarted(this.onGameStarted.bind(this))
        );
    }
    
    private cleanupSignals(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
        this.subscriptions = [];
    }
}
```

### 3. Error Handling
```typescript
private onSignalReceived(data: any): void {
    try {
        // Process signal data
    } catch (error) {
        console.error('Error processing signal:', error);
    }
}
```

### 4. Performance
```typescript
// Chỉ subscribe khi cần
if (this.needsScoreUpdates) {
    this.subscriptions.push(
        SignalHelper.onScoreChanged(this.updateScoreDisplay.bind(this))
    );
}

// Unsubscribe sớm khi không cần
private disableScoreUpdates(): void {
    // Tìm và unsubscribe specific subscription
    const scoreSubIndex = this.subscriptions.findIndex(/* find score subscription */);
    if (scoreSubIndex !== -1) {
        this.subscriptions[scoreSubIndex].unsubscribe();
        this.subscriptions.splice(scoreSubIndex, 1);
    }
}
```

## 🔧 Migration từ EventManager

Nếu project đang dùng EventManager, có thể migrate dần:

```typescript
// EventManager cũ
EventManager.instance.subscribe(EventKeyTypes.LEVEL_COMPLETED, this.onLevelCompleted);
EventManager.instance.fire(EventKeyTypes.LEVEL_COMPLETED);

// SignalBus mới
SignalHelper.onLevelCompleted(this.onLevelCompleted.bind(this));
SignalHelper.fireLevelCompleted();
```

## 🐛 Debug và Troubleshooting

```typescript
// Xem tất cả signals và subscribers
SignalHelper.debugSignals();

// Check signal có subscribers không
if (SignalBus.instance.hasSubscribers(MySignal)) {
    console.log('Signal has active subscribers');
}

// Clear tất cả để test
SignalHelper.clearAllSignals();
```

## 📝 Ví dụ hoàn chỉnh

Xem `SignalBusExample.ts` để có ví dụ chi tiết về cách sử dụng trong thực tế.

## 🔄 So sánh với Unity C#

| Unity C# | TypeScript Cocos |
|----------|------------------|
| `SignalBus.Subscribe<T>()` | `SignalBus.instance.subscribe(TSignal, callback)` |
| `SignalBus.Fire<T>()` | `SignalBus.instance.fire(TSignal, ...args)` |
| `[Inject] SignalBus signalBus` | `SignalBus.instance` |
| `DeclareSignal<T>()` | `signalBus.declareSignal(TSignal)` |

Hệ thống này cung cấp tất cả tính năng của Unity SignalBus với cú pháp TypeScript sạch đẹp và type-safe!
