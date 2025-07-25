# Entity Component System (ECS)

Hệ thống Entity Component System (ECS) cho Cocos Creator với Object Pool tích hợp, query mạnh mẽ và API dễ sử dụng.

## Tính năng

- ✅ **Clean Architecture**: Entity class được tách nhỏ thành ComponentManager và TagManager
- ✅ **Fluent API**: Chain methods cho code dễ đọc (entity.with().tag().with())
- ✅ **Object Pool Integration**: Tự động pool entities với archetypes
- ✅ **Powerful Queries**: Query entities theo components và tags
- ✅ **Type-safe**: Full TypeScript support với generics
- ✅ **Auto-indexing**: Tự động index components và tags cho query nhanh
- ✅ **Simple API**: Short method names (add, get, remove, has)

## Architecture

```
EntitySystem/
├── Core/               # Core classes
│   ├── Entity.ts       # Clean entity class
│   ├── ComponentManager.ts  # Component management
│   ├── TagManager.ts   # Tag management  
│   └── IEntityComponent.ts  # Component interface
├── EntityManager.ts    # Main manager & queries
├── Components/         # Reusable components
│   ├── Transform.ts    # Position, rotation, scale
│   ├── Health.ts       # Health và damage
│   └── Movement.ts     # Movement và physics
├── Systems/           # Update logic
│   ├── MovementSystem.ts  # Handle movement và input
│   └── HealthSystem.ts    # Health regeneration
└── Examples/          # Ví dụ sử dụng
    ├── PlayerController.ts
    └── EnemySpawner.ts
```

## Cách sử dụng

### 1. Tạo Entity

```typescript
import { Entities } from './EntitySystem';

// Tạo entity đơn giản
const entity = await Entities.create();

// Tạo từ archetype (với object pool)
Entities.registerArchetype('enemy', 'prefabs/Enemy');
const enemy = await Entities.create('enemy', parentNode);
```

### 2. Thêm Components

```typescript
import { Transform, Health, Movement } from './EntitySystem/Components';

// Add component - clean API
const transform = entity.add(Transform);
transform.setPosition(10, 20, 0);

// Add với initial data
const health = entity.add(Health, {
    maxHealth: 100,
    onDeath: () => console.log('Entity died!')
});

// Chain components với fluent API
entity
    .with(Transform)
    .with(Health, { maxHealth: 100 })
    .with(Movement, { speed: 5 })
    .tag('player')
    .tag('friendly');

// Get component
const movement = entity.get(Movement);

// Check component
if (entity.has(Health)) {
    // Has health component
}

// Remove component
entity.remove(Movement);
// Or chain style
entity.without(Movement);
```

### 3. Query Entities

```typescript
// Query by component
const enemies = Entities.withComponent(EnemyAI);

// Query by tag
const players = Entities.withTag('player');

// Complex queries
const aliveEnemies = Entities.query()
    .withComponents(Health, EnemyAI)
    .withTags('enemy')
    .withoutTags('dead')
    .execute();

// Query với action
Entities.query()
    .withComponents(Health)
    .withTags('enemy')
    .forEach(entity => {
        const health = entity.get(Health);
        health?.takeDamage(10);
    });

// First match
const player = Entities.query()
    .withTags('player')
    .first();

// Count  
const enemyCount = Entities.query()
    .withTags('enemy')
    .withoutTags('dead')
    .count();
```

### 4. Tạo Custom Components

```typescript
import { IEntityComponent, Entity } from './EntitySystem';

export class Weapon implements IEntityComponent {
    entity!: Entity;
    
    damage: number = 10;
    fireRate: number = 0.5;
    ammo: number = 30;
    
    private lastFireTime: number = 0;
    
    canFire(): boolean {
        const currentTime = Date.now() / 1000;
        return currentTime - this.lastFireTime >= this.fireRate && this.ammo > 0;
    }
    
    fire(): boolean {
        if (!this.canFire()) return false;
        
        this.ammo--;
        this.lastFireTime = Date.now() / 1000;
        
        // Fire logic here
        console.log(`Fire! Ammo: ${this.ammo}`);
        return true;
    }
    
    reload(): void {
        this.ammo = 30;
    }
    
    // Lifecycle hooks (optional)
    onAttach?(entity: Entity): void {
        console.log('Weapon attached');
    }
    
    onDetach?(): void {
        console.log('Weapon detached');
    }
    
    update?(dt: number): void {
        // Auto-reload when empty
        if (this.ammo <= 0) {
            this.reload();
        }
    }
}
```

### 5. Tạo Systems

```typescript
import { _decorator, Component } from 'cc';
import { Entities } from '../EntityManager';
import { Weapon } from '../Components/Weapon';

@ccclass('WeaponSystem')
export class WeaponSystem extends Component {
    protected update(dt: number): void {
        // Update all entities with weapons
        const armed = Entities.withComponent(Weapon);
        
        for (const entity of armed) {
            const weapon = entity.getComponent(Weapon);
            weapon?.update?.(dt);
        }
    }
    
    // Fire all weapons with specific tag
    fireWeaponsWithTag(tag: string): void {
        Entities.query()
            .withComponents(Weapon)
            .withTags(tag)
            .forEach(entity => {
                const weapon = entity.getComponent(Weapon);
                weapon?.fire();
            });
    }
}
```

## Ví dụ thực tế

### Game Setup

```typescript
@ccclass('GameManager')
export class GameManager extends Component {
    async start() {
        // Register archetypes
        Entities.registerArchetype('player', 'prefabs/Player');
        Entities.registerArchetype('enemy', 'prefabs/Enemy');
        Entities.registerArchetype('bullet', 'prefabs/Bullet');
        
        // Pre-warm pools
        await Pool.preWarm('prefabs/Enemy', 20);
        await Pool.preWarm('prefabs/Bullet', 100);
        
        // Create player
        const player = await this.createPlayer();
        
        // Start spawning enemies
        this.schedule(this.spawnEnemy, 2);
    }
    
    async createPlayer(): Promise<Entity> {
        const player = await Entities.create('player', this.node);
        
        // Clean fluent API
        player
            .with(Transform)
            .with(Health, { maxHealth: 100 })
            .with(Movement, { speed: 10 })
            .with(Weapon, { damage: 25 })
            .tag('player')
            .tag('friendly');
        
        return player;
    }
    
    async spawnEnemy(): Promise<void> {
        const enemyCount = Entities.withTag('enemy').length;
        if (enemyCount >= 10) return;
        
        const enemy = await Entities.create('enemy', this.node);
        
        // Chain everything
        enemy
            .with(Transform)
            .with(Health, { maxHealth: 50 })
            .with(Movement, { speed: 3 })
            .with(EnemyAI)
            .tag('enemy')
            .tag('hostile');
    }
}
```

### Bullet System

```typescript
class Bullet implements IEntityComponent {
    entity!: Entity;
    
    damage: number = 10;
    speed: number = 20;
    lifeTime: number = 3;
    
    private age: number = 0;
    private direction = new Vec3();
    
    fire(from: Vec3, direction: Vec3): void {
        const transform = this.entity.getComponent(Transform);
        if (transform) {
            transform.position = from;
            this.direction = direction.normalize();
        }
    }
    
    update(dt: number): void {
        this.age += dt;
        
        // Auto destroy after lifetime
        if (this.age >= this.lifeTime) {
            this.entity.destroy();
            return;
        }
        
        // Move bullet
        const transform = this.entity.getComponent(Transform);
        if (transform) {
            const movement = new Vec3();
            Vec3.multiplyScalar(movement, this.direction, this.speed * dt);
            transform.translate(movement);
        }
        
        // Check collision with enemies
        const enemies = Entities.query()
            .withComponents(Health, Transform)
            .withTags('enemy')
            .execute();
        
        for (const enemy of enemies) {
            const enemyTransform = enemy.getComponent(Transform);
            const distance = Vec3.distance(transform.position, enemyTransform.position);
            
            if (distance < 1) { // Hit!
                const health = enemy.getComponent(Health);
                health?.takeDamage(this.damage);
                this.entity.destroy();
                break;
            }
        }
    }
}
```

## Component Lifecycle

```
1. Entity created
2. addComponent() called
3. component.entity = entity
4. Apply initial data
5. component.onAttach?.(entity)
6. Component active

...

1. removeComponent() or entity.destroy()
2. component.onDetach?.()
3. Remove from entity
4. Clear references
```

## Best Practices

### ✅ Nên làm:

```typescript
// 1. Sử dụng archetypes cho entities hay tạo
Entities.registerArchetype('enemy', 'prefabs/Enemy');

// 2. Query cụ thể thay vì loop tất cả
const targets = Entities.query()
    .withComponents(Health, Transform)
    .withTags('enemy')
    .withoutTags('dead')
    .execute();

// 3. Reuse components cho các entities tương tự
class SharedBehavior implements IEntityComponent { }

// 4. Sử dụng tags để group entities
entity.addTag('collectible');
entity.addTag('powerup');

// 5. Clean up khi không dùng
entity.destroy(); // Tự động recycle nếu từ pool
```

### ❌ Không nên:

```typescript
// 1. Tạo quá nhiều components nhỏ
entity.addComponent(PositionX); // BAD
entity.addComponent(PositionY); // BAD
entity.addComponent(Transform); // GOOD - combines position, rotation, scale

// 2. Update thủ công trong mỗi component
// BAD - Mỗi component tự update
class MyComponent {
    update() { /* logic */ }
}

// GOOD - System update components
class MySystem {
    update() {
        Entities.withComponent(MyComponent).forEach(...);
    }
}

// 3. Store entity references lâu dài
this.enemyList.push(entity); // May become invalid

// 4. Query trong hot loops
update() {
    // BAD - Query mỗi frame
    const enemies = Entities.withTag('enemy');
}
```

## Performance Tips

1. **Use Object Pools**: Register archetypes cho entities thường xuyên spawn/destroy
2. **Batch Queries**: Query một lần và cache results khi có thể
3. **Component Granularity**: Balance giữa flexibility và performance
4. **System Order**: Update systems theo thứ tự hợp lý (input → movement → collision → render)
5. **Tag Wisely**: Dùng tags cho queries thường xuyên

## API Reference

### Entities Namespace

- `create(archetype?, parent?)` - Tạo entity mới
- `createMultiple(archetype, count, parent?)` - Tạo nhiều entities
- `query()` - Tạo query builder
- `registerArchetype(name, prefabPath)` - Đăng ký archetype
- `withComponent(ComponentClass)` - Get entities với component
- `withTag(tag)` - Get entities với tag

### Entity Methods

**Component Management:**
- `add(ComponentClass, data?)` - Thêm component
- `get(ComponentClass)` - Lấy component
- `remove(ComponentClass)` - Xóa component
- `has(ComponentClass)` - Kiểm tra component
- `with(ComponentClass, data?)` - Chain-friendly add
- `without(ComponentClass)` - Chain-friendly remove
- `components` - Access ComponentManager

**Tag Management:**
- `tag(tag)` - Thêm tag (chainable)
- `untag(tag)` - Xóa tag (chainable)
- `hasTag(tag)` - Kiểm tra tag
- `tags` - Access TagManager for advanced usage

**Lifecycle:**
- `enable()` - Enable entity
- `disable()` - Disable entity
- `destroy()` - Hủy entity (auto recycle nếu từ pool)
- `clone(parent?)` - Clone entity với components/tags

**Utilities:**
- `getDebugInfo()` - Get debug string
- `update(dt)` - Update all components

### Query Methods

- `withComponents(...ComponentClasses)` - Filter by components
- `withTags(...tags)` - Filter by tags
- `withoutComponents(...ComponentClasses)` - Exclude components
- `withoutTags(...tags)` - Exclude tags
- `execute()` - Get results array
- `first()` - Get first match
- `count()` - Count matches
- `forEach(action)` - Execute action on matches