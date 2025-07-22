# Object Pool Manager

Hệ thống quản lý object pooling cho Cocos Creator để tối ưu hiệu suất bằng cách tái sử dụng objects thay vì tạo/hủy liên tục.

## Tính năng

- ✅ **Auto-creation**: Tự động tạo pool khi cần
- ✅ **Type-safe**: Full TypeScript support với generics
- ✅ **Memory efficient**: Tái sử dụng objects, giảm garbage collection
- ✅ **Statistics**: Theo dõi số lượng objects spawned/pooled
- ✅ **Pre-warming**: Khởi tạo trước objects cho performance tốt hơn
- ✅ **Easy API**: Pool namespace cho syntax đơn giản

## Cấu trúc

```
ObjectPool/
└── ObjectPoolManager.ts    # Singleton manager với Pool namespace
```

## Cách sử dụng

### 1. Spawn Objects

```typescript
import { Pool } from './ObjectPool';

// Spawn một object
const enemy = await Pool.spawn<Enemy>("prefabs/Enemy", this.node);
if (enemy) {
    enemy.setPosition(100, 200);
    enemy.getComponent(EnemyController)?.init();
}

// Spawn nhiều objects cùng lúc
const bullets = await Pool.spawnMultiple<Bullet>("prefabs/Bullet", 10, this.node);
bullets.forEach((bullet, index) => {
    bullet.setPosition(index * 50, 0);
});
```

### 2. Recycle Objects

```typescript
// Recycle một object
Pool.recycle(this.enemyNode);

// Recycle tất cả objects của một loại
Pool.recycleAll("prefabs/Enemy");

// Trong component, tự động recycle khi destroy
export class Enemy extends Component {
    onDestroy() {
        if (Pool.isPooled(this.node)) {
            Pool.recycle(this.node);
        }
    }
}
```

### 3. Pre-warming Pool

```typescript
// Pre-warm pools khi start game
export class GameManager extends Component {
    async start() {
        // Tạo sẵn 50 bullets trong pool
        await Pool.preWarm("prefabs/Bullet", 50);
        
        // Tạo sẵn 20 enemies
        await Pool.preWarm("prefabs/Enemy", 20);
        
        console.log("Pools pre-warmed!");
    }
}
```

### 4. Pool Statistics

```typescript
// Kiểm tra trạng thái pool
const stats = Pool.getStats("prefabs/Enemy");
if (stats) {
    console.log(`Enemies - Spawned: ${stats.spawned}, Pooled: ${stats.pooled}`);
}

// Kiểm tra object có từ pool không
if (Pool.isPooled(someNode)) {
    console.log("This node is from pool");
}
```

## Ví dụ thực tế

### Bullet System

```typescript
@ccclass('WeaponController')
export class WeaponController extends Component {
    @property
    bulletPrefabPath = "prefabs/Bullet";
    
    async start() {
        // Pre-warm bullet pool
        await Pool.preWarm(this.bulletPrefabPath, 100);
    }
    
    async shoot(direction: Vec3) {
        const bullet = await Pool.spawn<Node>(this.bulletPrefabPath, this.node);
        if (bullet) {
            bullet.setPosition(this.node.position);
            const bulletScript = bullet.getComponent(Bullet);
            bulletScript?.fire(direction);
        }
    }
}

@ccclass('Bullet')
export class Bullet extends Component {
    private moveSpeed = 500;
    
    fire(direction: Vec3) {
        // Bullet logic
        this.scheduleOnce(() => {
            Pool.recycle(this.node);
        }, 3); // Auto recycle after 3 seconds
    }
}
```

### Enemy Spawner

```typescript
@ccclass('EnemySpawner')
export class EnemySpawner extends Component {
    @property
    enemyPrefabPath = "prefabs/Enemy";
    
    @property
    maxEnemies = 10;
    
    private spawnedEnemies: Node[] = [];
    
    async start() {
        await Pool.preWarm(this.enemyPrefabPath, this.maxEnemies);
        this.startSpawning();
    }
    
    async spawnEnemy() {
        if (this.spawnedEnemies.length >= this.maxEnemies) return;
        
        const enemy = await Pool.spawn<Node>(this.enemyPrefabPath, this.node);
        if (enemy) {
            enemy.setPosition(this.getRandomPosition());
            this.spawnedEnemies.push(enemy);
            
            // Remove from tracking when destroyed
            enemy.on(Node.EventType.NODE_DESTROYED, () => {
                const index = this.spawnedEnemies.indexOf(enemy);
                if (index >= 0) {
                    this.spawnedEnemies.splice(index, 1);
                }
            });
        }
    }
    
    clearAllEnemies() {
        this.spawnedEnemies.forEach(enemy => Pool.recycle(enemy));
        this.spawnedEnemies = [];
    }
}
```

## Pool Lifecycle

```
1. Spawn Request
   ↓
2. Check if pool exists
   ↓
3. If not exists → Load prefab → Create pool
   ↓
4. Get from pool OR instantiate new
   ↓
5. Set parent, activate, track
   ↓
6. Return object
   
---

1. Recycle Request
   ↓
2. Find which pool owns the object
   ↓
3. Remove from spawned tracking
   ↓
4. Deactivate, remove from parent
   ↓
5. Put back to pool
```

## Best Practices

### ✅ Nên làm:

```typescript
// 1. Pre-warm pools quan trọng
await Pool.preWarm("prefabs/Bullet", 100);

// 2. Recycle objects khi không dùng
Pool.recycle(bulletNode);

// 3. Kiểm tra pool stats để debug
const stats = Pool.getStats("prefabs/Enemy");
console.log(`Pool status:`, stats);

// 4. Sử dụng Pool namespace cho syntax sạch
const enemy = await Pool.spawn<Enemy>("prefabs/Enemy");

// 5. Clear pools khi chuyển scene
Pool.clearAll();
```

### ❌ Không nên:

```typescript
// 1. Destroy objects từ pool trực tiếp
enemy.destroy(); // BAD - should use Pool.recycle()

// 2. Giữ reference đến recycled objects
this.bullets.push(bullet);
Pool.recycle(bullet); // bullet reference now invalid

// 3. Spawn quá nhiều objects cùng lúc
for (let i = 0; i < 1000; i++) {
    Pool.spawn("prefabs/Bullet"); // Có thể lag
}

// 4. Không pre-warm pools quan trọng
// Spawn lúc runtime sẽ có delay load prefab
```

## Performance Tips

1. **Pre-warm critical pools**: Pre-warm pools cho objects hay dùng
2. **Batch operations**: Sử dụng `spawnMultiple` thay vì spawn nhiều lần
3. **Monitor pool stats**: Theo dõi pool statistics để optimize size
4. **Clear unused pools**: Clear pools không dùng để giải phóng memory
5. **Avoid over-pooling**: Không pool objects ít dùng

## API Reference

### Pool Namespace

- `spawn<T>(prefabPath, parent?)` - Spawn object từ pool
- `spawnMultiple<T>(prefabPath, count, parent?)` - Spawn nhiều objects
- `recycle(node)` - Recycle object về pool
- `recycleAll(prefabPath)` - Recycle tất cả objects của một loại
- `preWarm(prefabPath, count)` - Pre-warm pool với số lượng objects
- `getStats(prefabPath)` - Lấy thống kê pool
- `clear(prefabPath)` - Clear pool cụ thể
- `clearAll()` - Clear tất cả pools
- `isPooled(node)` - Kiểm tra node có từ pool không

### ObjectPoolManager Instance

- `ObjectPoolManager.Instance` - Singleton instance
- Các method tương tự Pool namespace nhưng truy cập trực tiếp

## Memory Management

Object Pool giúp:
- **Giảm garbage collection**: Tái sử dụng objects thay vì tạo mới
- **Improve performance**: Không có delay instantiate prefab
- **Reduce memory fragmentation**: Objects được tái sử dụng từ pool
- **Better frame rate**: Ít allocations = ít GC spikes