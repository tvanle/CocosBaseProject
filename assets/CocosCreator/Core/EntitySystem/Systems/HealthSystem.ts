import { _decorator, Component } from 'cc';
import {Entities, Entity} from '../EntityManager';
import { Health } from '../Components';

const { ccclass } = _decorator;

@ccclass('HealthSystem')
export class HealthSystem extends Component {
    // Health regeneration
    enableRegeneration: boolean = true;
    regenerationRate: number = 1; // HP per second
    regenerationDelay: number = 5; // Seconds after damage before regen starts

    // Track damage timers
    private lastDamageTime = new Map<number, number>();

    protected update(dt: number): void {
        if (!this.enableRegeneration) return;

        // Process all entities with health
        const entities = Entities.withComponent(Health);
        const currentTime = Date.now() / 1000;

        for (const entity of entities) {
            const health = entity.getComponent(Health);
            if (!health || !health.isAlive()) continue;

            // Check if can regenerate
            const lastDamage = this.lastDamageTime.get(entity.id) || 0;
            const timeSinceDamage = currentTime - lastDamage;

            if (timeSinceDamage >= this.regenerationDelay && health.currentHealth < health.maxHealth) {
                health.heal(this.regenerationRate * dt);
            }
        }
    }

    // Track when entity takes damage
    onEntityDamaged(entityId: number): void {
        this.lastDamageTime.set(entityId, Date.now() / 1000);
    }

    // Apply damage to entities with tag
    damageEntitiesWithTag(tag: string, damage: number): void {
        const entities = Entities.withTag(tag);
        for (const entity of entities) {
            const health = entity.getComponent(Health);
            if (health) {
                health.takeDamage(damage);
                this.onEntityDamaged(entity.id);
            }
        }
    }

    // Heal entities with tag
    healEntitiesWithTag(tag: string, amount: number): void {
        const entities = Entities.withTag(tag);
        for (const entity of entities) {
            const health = entity.getComponent(Health);
            health?.heal(amount);
        }
    }

    // Get all dead entities
    getDeadEntities(): Entity[] {
        return Entities.query()
            .withComponents(Health)
            .withTags('dead')
            .execute();
    }

    // Revive dead entities
    reviveDeadEntities(): void {
        const deadEntities = this.getDeadEntities();
        for (const entity of deadEntities) {
            const health = entity.getComponent(Health);
            health?.reset();
        }
    }
}