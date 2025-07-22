import { _decorator, Component, Node, Vec3, randomRange } from 'cc';
import {Entities, Entity, IEntityComponent} from '../EntityManager';
import { Transform, Health, Movement } from '../Components';
import { Pool } from '../../ObjectPool/ObjectPoolManager';

const { ccclass, property } = _decorator;

// Enemy AI component
class EnemyAI implements IEntityComponent {
    entity!: Entity;

    targetTag: string = 'player';
    attackRange: number = 2;
    attackDamage: number = 10;
    attackCooldown: number = 1;

    private lastAttackTime: number = 0;
    private target: Entity | null = null;

    update(dt: number): void {
        // Find target
        if (!this.target || !this.target.active) {
            const targets = Entities.withTag(this.targetTag);
            this.target = targets.length > 0 ? targets[0] : null;
        }

        if (!this.target) return;

        // Get components
        const transform = this.entity.getComponent(Transform);
        const movement = this.entity.getComponent(Movement);
        const targetTransform = this.target.getComponent(Transform);

        if (!transform || !movement || !targetTransform) return;

        // Calculate distance to target
        const distance = Vec3.distance(transform.position, targetTransform.position);

        if (distance <= this.attackRange) {
            // Attack if in range
            movement.stop();
            this.tryAttack();
        } else {
            // Move towards target
            movement.moveTowards(targetTransform.position, this.attackRange * 0.8);
        }
    }

    private tryAttack(): void {
        const currentTime = Date.now() / 1000;
        if (currentTime - this.lastAttackTime < this.attackCooldown) return;

        this.lastAttackTime = currentTime;

        // Deal damage to target
        const targetHealth = this.target?.getComponent(Health);
        targetHealth?.takeDamage(this.attackDamage);

        console.log(`Enemy attacks for ${this.attackDamage} damage!`);
    }
}

@ccclass('EnemySpawner')
export class EnemySpawner extends Component {
    @property
    enemyPrefabPath: string = 'prefabs/Enemy';

    @property
    spawnInterval: number = 2;

    @property
    maxEnemies: number = 10;

    @property
    spawnRadius: number = 20;

    private spawnTimer: number = 0;

    async start() {
        // Register enemy archetype
        Entities.registerArchetype('enemy', this.enemyPrefabPath);

        // Pre-warm enemy pool
        await Pool.preWarm(this.enemyPrefabPath, this.maxEnemies);
    }

    protected update(dt: number): void {
        this.spawnTimer += dt;

        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;
            this.trySpawnEnemy();
        }
    }

    private async trySpawnEnemy(): Promise<void> {
        // Check enemy count
        const enemies = Entities.query()
            .withTags('enemy')
            .withoutTags('dead')
            .count();

        if (enemies >= this.maxEnemies) return;

        // Spawn enemy
        const enemy = await Entities.create('enemy', this.node);

        // Setup components
        const transform = enemy.addComponent(Transform);
        const spawnPos = this.getRandomSpawnPosition();
        transform.setPosition(spawnPos.x, spawnPos.y, spawnPos.z);

        const health = enemy.addComponent(Health, {
            maxHealth: 50,
            onDeath: () => this.onEnemyDeath(enemy)
        });

        const movement = enemy.addComponent(Movement, {
            speed: 3,
            maxSpeed: 5
        });

        const ai = enemy.addComponent(EnemyAI, {
            attackDamage: 10,
            attackRange: 2
        });

        // Add tags
        enemy.addTag('enemy');
        enemy.addTag('hostile');
    }

    private getRandomSpawnPosition(): Vec3 {
        const angle = randomRange(0, Math.PI * 2);
        const distance = randomRange(this.spawnRadius * 0.8, this.spawnRadius);

        return new Vec3(
            Math.cos(angle) * distance,
            Math.sin(angle) * distance,
            0
        );
    }

    private onEnemyDeath(enemy: Entity): void {
        console.log('Enemy died!');

        // Recycle after 1 second
        this.scheduleOnce(() => {
            enemy.destroy();
        }, 1);
    }

    // Clear all enemies
    clearAllEnemies(): void {
        Entities.query()
            .withTags('enemy')
            .forEach(enemy => enemy.destroy());
    }
}