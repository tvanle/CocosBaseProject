import { Vec3, Quat } from 'cc';
import { IEntityComponent, Entity } from '../EntityManager';

export class Transform implements IEntityComponent {
    entity!: Entity;
    
    // Cache values
    private _position = new Vec3();
    private _rotation = new Quat();
    private _scale = new Vec3(1, 1, 1);
    
    // Position
    get position(): Vec3 {
        return this._position;
    }
    
    set position(value: Vec3) {
        this._position.set(value);
        this.entity.node.setPosition(value);
    }
    
    // Rotation
    get rotation(): Quat {
        return this._rotation;
    }
    
    set rotation(value: Quat) {
        this._rotation.set(value);
        this.entity.node.setRotation(value);
    }
    
    // Scale
    get scale(): Vec3 {
        return this._scale;
    }
    
    set scale(value: Vec3) {
        this._scale.set(value);
        this.entity.node.setScale(value);
    }
    
    // Helper methods
    setPosition(x: number, y: number, z: number = 0): void {
        this._position.set(x, y, z);
        this.entity.node.setPosition(x, y, z);
    }
    
    translate(delta: Vec3): void {
        Vec3.add(this._position, this._position, delta);
        this.entity.node.setPosition(this._position);
    }
    
    lookAt(target: Vec3): void {
        this.entity.node.lookAt(target);
        this.entity.node.getRotation(this._rotation);
    }
    
    // Lifecycle
    onAttach(entity: Entity): void {
        // Sync with node
        entity.node.getPosition(this._position);
        entity.node.getRotation(this._rotation);
        entity.node.getScale(this._scale);
    }
}