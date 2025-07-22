import { IEntityComponent, Entity } from '../EntityManager';

export class Health implements IEntityComponent {
    entity!: Entity;
    
    maxHealth: number = 100;
    currentHealth: number = 100;
    
    // Events
    onDamage?: (damage: number) => void;
    onHeal?: (amount: number) => void;
    onDeath?: () => void;
    
    // Take damage
    takeDamage(damage: number): void {
        if (this.currentHealth <= 0) return;
        
        this.currentHealth = Math.max(0, this.currentHealth - damage);
        this.onDamage?.(damage);
        
        if (this.currentHealth <= 0) {
            this.onDeath?.();
            this.entity.addTag('dead');
        }
    }
    
    // Heal
    heal(amount: number): void {
        if (this.currentHealth <= 0) return;
        
        const oldHealth = this.currentHealth;
        this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
        const actualHeal = this.currentHealth - oldHealth;
        
        if (actualHeal > 0) {
            this.onHeal?.(actualHeal);
        }
    }
    
    // Reset health
    reset(): void {
        this.currentHealth = this.maxHealth;
        this.entity.removeTag('dead');
    }
    
    // Check if alive
    isAlive(): boolean {
        return this.currentHealth > 0;
    }
    
    // Get health percentage
    getHealthPercentage(): number {
        return (this.currentHealth / this.maxHealth) * 100;
    }
    
    // Lifecycle
    onAttach(entity: Entity): void {
        this.currentHealth = this.maxHealth;
    }
}