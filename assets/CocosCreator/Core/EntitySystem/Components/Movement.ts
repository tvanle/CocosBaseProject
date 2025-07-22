import { Vec3 } from 'cc';
import { IEntityComponent, Entity } from '../EntityManager';
import { Transform } from './Transform';

export class Movement implements IEntityComponent {
    entity!: Entity;
    
    // Movement properties
    speed: number = 5;
    acceleration: number = 10;
    maxSpeed: number = 10;
    friction: number = 5;
    
    // State
    private velocity = new Vec3();
    private targetVelocity = new Vec3();
    private transform: Transform | null = null;
    
    // Input
    private inputDirection = new Vec3();
    
    // Set movement input
    setInput(x: number, y: number, z: number = 0): void {
        this.inputDirection.set(x, y, z);
        
        // Normalize if magnitude > 1
        const magnitude = this.inputDirection.length();
        if (magnitude > 1) {
            this.inputDirection.normalize();
        }
    }
    
    // Move towards target
    moveTowards(target: Vec3, stopDistance: number = 0.1): boolean {
        if (!this.transform) return false;
        
        const direction = new Vec3();
        Vec3.subtract(direction, target, this.transform.position);
        
        const distance = direction.length();
        if (distance <= stopDistance) {
            this.setInput(0, 0, 0);
            return true; // Reached target
        }
        
        direction.normalize();
        this.setInput(direction.x, direction.y, direction.z);
        return false; // Still moving
    }
    
    // Apply force
    applyForce(force: Vec3): void {
        Vec3.add(this.velocity, this.velocity, force);
    }
    
    // Get current velocity
    getVelocity(): Vec3 {
        return this.velocity.clone();
    }
    
    // Stop movement
    stop(): void {
        this.velocity.set(0, 0, 0);
        this.targetVelocity.set(0, 0, 0);
        this.inputDirection.set(0, 0, 0);
    }
    
    // Lifecycle
    onAttach(entity: Entity): void {
        this.transform = entity.getComponent(Transform);
        if (!this.transform) {
            this.transform = entity.addComponent(Transform);
        }
    }
    
    update(dt: number): void {
        if (!this.transform) return;
        
        // Calculate target velocity from input
        Vec3.multiplyScalar(this.targetVelocity, this.inputDirection, this.speed);
        
        // Accelerate towards target velocity
        const diff = new Vec3();
        Vec3.subtract(diff, this.targetVelocity, this.velocity);
        
        const accelRate = this.inputDirection.length() > 0 ? this.acceleration : this.friction;
        const maxDelta = accelRate * dt;
        
        if (diff.length() > maxDelta) {
            diff.normalize();
            Vec3.multiplyScalar(diff, diff, maxDelta);
        }
        
        Vec3.add(this.velocity, this.velocity, diff);
        
        // Clamp to max speed
        if (this.velocity.length() > this.maxSpeed) {
            this.velocity.normalize();
            Vec3.multiplyScalar(this.velocity, this.velocity, this.maxSpeed);
        }
        
        // Apply velocity
        if (this.velocity.length() > 0.001) {
            const movement = new Vec3();
            Vec3.multiplyScalar(movement, this.velocity, dt);
            this.transform.translate(movement);
        }
    }
}