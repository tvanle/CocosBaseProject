import { _decorator, Component, Node, Vec3 } from 'cc';
import {Entities, Entity, IEntityComponent} from '../EntityManager';
import { Transform, Health, Movement } from '../Components';
import {MovementSystem} from "db://assets/CocosCreator/Core/EntitySystem";

const { ccclass, property } = _decorator;

// Custom component for player
class PlayerComponent implements IEntityComponent {
    entity!: Entity;

    score: number = 0;
    level: number = 1;

    addScore(points: number): void {
        this.score += points;
        console.log(`Player score: ${this.score}`);
    }
}

@ccclass('PlayerController')
export class PlayerController extends Component {
    @property
    playerSpeed: number = 10;

    @property
    playerHealth: number = 100;

    private playerEntity: Entity | null = null;

    async start() {
        // Register player archetype
        Entities.registerArchetype('player', 'prefabs/Player');

        // Create player entity
        this.playerEntity = await Entities.create('player', this.node);

        // Add components
        const transform = this.playerEntity.addComponent(Transform);
        transform.setPosition(0, 0, 0);

        const health = this.playerEntity.addComponent(Health, {
            maxHealth: this.playerHealth,
            onDeath: () => this.onPlayerDeath()
        });

        const movement = this.playerEntity.addComponent(Movement, {
            speed: this.playerSpeed
        });

        const playerComp = this.playerEntity.addComponent(PlayerComponent);

        // Add tags
        this.playerEntity.addTag('player');
        this.playerEntity.addTag('friendly');

        // Set as controlled entity for movement system
        const movementSystem = this.getComponent(MovementSystem);
        movementSystem?.setControlledEntity(this.playerEntity.id);
    }

    private onPlayerDeath(): void {
        console.log('Player died!');

        // Respawn after 3 seconds
        this.scheduleOnce(() => {
            const health = this.playerEntity?.getComponent(Health);
            health?.reset();

            const transform = this.playerEntity?.getComponent(Transform);
            transform?.setPosition(0, 0, 0);
        }, 3);
    }

    // Example: Damage all enemies
    damageAllEnemies(damage: number): void {
        // Query entities with enemy tag but not dead
        Entities.query()
            .withTags('enemy')
            .withoutTags('dead')
            .forEach(entity => {
                const health = entity.getComponent(Health);
                health?.takeDamage(damage);
            });
    }

    // Example: Get nearest enemy
    getNearestEnemy(): Entity | null {
        const playerTransform = this.playerEntity?.getComponent(Transform);
        if (!playerTransform) return null;

        const enemies = Entities.query()
            .withTags('enemy')
            .withoutTags('dead')
            .execute();

        let nearest: Entity | null = null;
        let nearestDistance = Infinity;

        for (const enemy of enemies) {
            const enemyTransform = enemy.getComponent(Transform);
            if (enemyTransform) {
                const distance = Vec3.distance(playerTransform.position, enemyTransform.position);
                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearest = enemy;
                }
            }
        }

        return nearest;
    }
}