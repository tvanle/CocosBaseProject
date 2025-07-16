# CocosTask - UniTask for Cocos Creator

CocosTask là một thư viện async/await cho Cocos Creator được thiết kế theo mô hình UniTask của Unity. Nó cung cấp một cách tiện lợi để xử lý các tác vụ bất đồng bộ như delay, animation, và các operations khác.

## 📁 Cấu trúc File

```
CocosTask/
├── CancellationToken.ts     # Hệ thống hủy operations
├── CocosTask.ts            # Core class chính
├── CocosTaskDelay.ts       # Delay operations (ms, frames)
├── CocosTaskWait.ts        # Wait operations (conditions)
├── CocosTaskAnimation.ts   # Animation operations
├── CocosTaskUtility.ts     # Utility operations (retry, timeout)
├── CocosTaskExample.ts     # File demo đầy đủ
└── index.ts               # Export và namespace
```

## 🚀 Cài đặt và Import

```typescript
// Import toàn bộ
import { CocosTask, CancellationTokenSource } from './CocosCreator/Core/CocosTask';

// Hoặc import từng module
import { 
    CocosTask, 
    CocosTaskDelay, 
    CocosTaskAnimation,
    CancellationTokenSource 
} from './CocosCreator/Core/CocosTask';
```

## 💡 Cách sử dụng cơ bản

### 1. Delay Operations

```typescript
import { CocosTask, CancellationTokenSource } from './CocosCreator/Core/CocosTask';

export class MyComponent extends Component {
    private cancellationTokenSource = new CancellationTokenSource();

    async start() {
        const token = this.cancellationTokenSource.token;

        // Delay 1 giây
        await CocosTask.delay(1000, token);
        console.log('Đã delay 1 giây');

        // Delay theo frames
        await CocosTask.DelayFrame(60, this, token);
        console.log('Đã delay 60 frames');

        // Chờ frame tiếp theo
        await CocosTask.NextFrame(this, token);
        console.log('Frame tiếp theo');
    }

    onDestroy() {
        // Hủy tất cả operations khi component bị destroy
        this.cancellationTokenSource.dispose();
    }
}
```

### 2. Animation Operations

```typescript
async animateNode() {
    const token = this.cancellationTokenSource.token;

    // Di chuyển node
    await CocosTask.ToPosition(this.node, new Vec3(100, 0, 0), 1.0, token);
    
    // Scale node
    await CocosTask.ToScale(this.node, new Vec3(1.5, 1.5, 1.5), 0.5, token);
    
    // Fade out
    await CocosTask.FadeOut(this.node, 1.0, token);
    
    // Fade in
    await CocosTask.FadeIn(this.node, 1.0, token);
    
    // Animation song song
    await CocosTask.whenAll([
        CocosTask.ToPosition(this.node, new Vec3(0, 0, 0), 1.0, token),
        CocosTask.ToScale(this.node, new Vec3(1, 1, 1), 1.0, token)
    ]);
}
```

### 3. Wait Operations

```typescript
async waitExample() {
    const token = this.cancellationTokenSource.token;
    
    // Chờ cho đến khi điều kiện đúng
    await CocosTask.WaitUntil(() => this.someCondition(), this, token);
    
    // Chờ trong khi điều kiện còn đúng
    await CocosTask.WaitWhile(() => this.isLoading, this, token);
    
    // Chờ node active
    await CocosTask.WaitForActive(this.someNode, this, token);
}

private someCondition(): boolean {
    return this.node.position.x > 100;
}
```

### 4. Utility Operations

```typescript
async utilityExample() {
    const token = this.cancellationTokenSource.token;
    
    // Retry với exponential backoff
    await CocosTask.Retry(
        () => this.unreliableOperation(),
        maxAttempts: 3,
        baseDelayMs: 1000,
        token
    );
    
    // Timeout operation
    try {
        await CocosTask.WithTimeout(
            CocosTask.delay(5000, token),
            timeoutMs: 2000
        );
    } catch (error) {
        console.log('Operation timed out');
    }
    
    // Repeat operation
    const results = await CocosTask.Repeat(
        () => this.generateData(),
        count: 5,
        token
    );
    
    // Run tasks in sequence
    await CocosTask.Sequence([
        CocosTask.delay(500, token),
        CocosTask.ToPosition(this.node, new Vec3(100, 0, 0), 1.0, token),
        CocosTask.delay(500, token)
    ], token);
}
```

## 🎯 Sử dụng Namespace Syntax (giống UniTask)

CocosTask cung cấp namespace syntax giống Unity UniTask:

```typescript
// Thay vì
await CocosTaskDelay.delay(1000, token);
await CocosTaskAnimation.fadeOut(this.node, 1.0, token);

// Có thể viết
await CocosTask.Delay(1000, token);
await CocosTask.FadeOut(this.node, 1.0, token);
```

## 🛡️ Cancellation Token

Cancellation Token giúp hủy operations một cách an toàn:

```typescript
export class MyComponent extends Component {
    private cancellationTokenSource = new CancellationTokenSource();
    
    async longRunningOperation() {
        const token = this.cancellationTokenSource.token;
        
        try {
            // Operations có thể bị hủy
            await CocosTask.delay(5000, token);
            await CocosTask.ToPosition(this.node, targetPos, 2.0, token);
        } catch (error) {
            if (error.message === 'OperationCanceledException') {
                console.log('Operation was cancelled');
            }
        }
    }
    
    cancelOperations() {
        // Hủy tất cả operations
        this.cancellationTokenSource.cancel();
    }
    
    onDestroy() {
        // Luôn dispose khi component bị destroy
        this.cancellationTokenSource.dispose();
    }
}
```

## 📋 API Reference

### Core Methods

- `CocosTask.delay(ms, token?)` - Delay theo milliseconds
- `CocosTask.DelayFrame(frames, component, token?)` - Delay theo frames
- `CocosTask.NextFrame(component, token?)` - Chờ frame tiếp theo
- `CocosTask.whenAll(tasks[])` - Chờ tất cả tasks hoàn thành
- `CocosTask.whenAny(tasks[])` - Chờ task đầu tiên hoàn thành

### Animation Methods

- `CocosTask.ToPosition(node, targetPos, duration, token?)`
- `CocosTask.ToScale(node, targetScale, duration, token?)`
- `CocosTask.ToRotation(node, targetRotation, duration, token?)`
- `CocosTask.FadeIn(node, duration, token?)`
- `CocosTask.FadeOut(node, duration, token?)`
- `CocosTask.MoveBy(node, offset, duration, token?)`
- `CocosTask.ScaleBy(node, multiplier, duration, token?)`

### Wait Methods

- `CocosTask.WaitUntil(predicate, component, token?)`
- `CocosTask.WaitWhile(predicate, component, token?)`
- `CocosTask.WaitForActive(node, component, token?)`
- `CocosTask.WaitForInactive(node, component, token?)`

### Utility Methods

- `CocosTask.Retry(taskFactory, maxAttempts, baseDelayMs?, token?)`
- `CocosTask.WithTimeout(task, timeoutMs)`
- `CocosTask.Repeat(taskFactory, count, token?)`
- `CocosTask.Sequence(tasks[], token?)`
- `CocosTask.Periodic(taskFactory, intervalMs, component, token?)`

## 🎬 Example Workflow

```typescript
async performComplexWorkflow() {
    const token = this.cancellationTokenSource.token;
    
    try {
        // Step 1: Fade in và move
        await CocosTask.whenAll([
            CocosTask.FadeIn(this.node, 0.5, token),
            CocosTask.ToPosition(this.node, new Vec3(100, 0, 0), 0.8, token)
        ]);
        
        // Step 2: Wait for condition with timeout
        try {
            await CocosTask.WithTimeout(
                CocosTask.WaitUntil(() => this.isReady(), this, token),
                3000 // 3 seconds timeout
            );
        } catch (error) {
            console.log('Timeout, continuing anyway...');
        }
        
        // Step 3: Sequence animations
        await CocosTask.Sequence([
            CocosTask.ToScale(this.node, new Vec3(1.2, 1.2, 1.2), 0.3, token),
            CocosTask.Delay(200, token),
            CocosTask.ToScale(this.node, new Vec3(1, 1, 1), 0.3, token)
        ], token);
        
        console.log('Workflow completed!');
        
    } catch (error) {
        if (error.message === 'OperationCanceledException') {
            console.log('Workflow cancelled');
        } else {
            console.error('Workflow failed:', error);
        }
    }
}
```

## ⚠️ Lưu ý quan trọng

1. **Luôn dispose CancellationTokenSource trong onDestroy()** để tránh memory leak
2. **Sử dụng try/catch** để xử lý OperationCanceledException
3. **Truyền component vào các method cần frame-based operations** (DelayFrame, WaitUntil, etc.)
4. **Không sử dụng finally()** - đã bị loại bỏ để tương thích với TypeScript cũ hơn

## 🔧 Troubleshooting

### Lỗi "Property 'finally' does not exist"
- Đã được sửa trong phiên bản này bằng cách loại bỏ method finally()

### Lỗi "Cannot find module"
- Đảm bảo đường dẫn import đúng: `'./CocosCreator/Core/CocosTask'`

### Operations không bị hủy
- Đảm bảo truyền CancellationToken vào tất cả operations
- Gọi dispose() trong onDestroy()

## 📝 License

MIT License - Tự do sử dụng trong dự án của bạn.