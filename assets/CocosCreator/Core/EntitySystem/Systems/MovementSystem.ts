import { _decorator, Component, input, Input, EventKeyboard, KeyCode, Vec3 } from 'cc';
import { Entities } from '../EntityManager';
import { Movement, Transform } from '../Components';

const { ccclass } = _decorator;

@ccclass('MovementSystem')
export class MovementSystem extends Component {
    // Input state
    private inputVector = new Vec3();
    private controlledEntity: number | null = null;

    protected onLoad(): void {
        // Register input events
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    protected onDestroy(): void {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    // Set entity to control
    setControlledEntity(entityId: number): void {
        this.controlledEntity = entityId;
    }

    // Input handlers
    private onKeyDown(event: EventKeyboard): void {
        switch(event.keyCode) {
            case KeyCode.KEY_W:
            case KeyCode.ARROW_UP:
                this.inputVector.y = 1;
                break;
            case KeyCode.KEY_S:
            case KeyCode.ARROW_DOWN:
                this.inputVector.y = -1;
                break;
            case KeyCode.KEY_A:
            case KeyCode.ARROW_LEFT:
                this.inputVector.x = -1;
                break;
            case KeyCode.KEY_D:
            case KeyCode.ARROW_RIGHT:
                this.inputVector.x = 1;
                break;
        }
    }

    private onKeyUp(event: EventKeyboard): void {
        switch(event.keyCode) {
            case KeyCode.KEY_W:
            case KeyCode.ARROW_UP:
                if (this.inputVector.y > 0) this.inputVector.y = 0;
                break;
            case KeyCode.KEY_S:
            case KeyCode.ARROW_DOWN:
                if (this.inputVector.y < 0) this.inputVector.y = 0;
                break;
            case KeyCode.KEY_A:
            case KeyCode.ARROW_LEFT:
                if (this.inputVector.x < 0) this.inputVector.x = 0;
                break;
            case KeyCode.KEY_D:
            case KeyCode.ARROW_RIGHT:
                if (this.inputVector.x > 0) this.inputVector.x = 0;
                break;
        }
    }

    protected update(dt: number): void {
        // Apply input to controlled entity
        if (this.controlledEntity !== null) {
            const entity = Entities.manager.getEntity(this.controlledEntity);
            if (entity) {
                const movement = entity.getComponent(Movement);
                if (movement) {
                    movement.setInput(this.inputVector.x, this.inputVector.y);
                }
            }
        }

        // Update all entities with movement
        const entities = Entities.withComponent(Movement);
        for (const entity of entities) {
            const movement = entity.getComponent(Movement);
            movement?.update(dt);
        }
    }
}