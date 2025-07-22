import {_decorator, Component, UITransform} from 'cc';

const {ccclass, property} = _decorator;
import {UIOpacity} from 'cc';
import {Node} from 'cc';
import {ScreenView} from './ScreenView';
import {UIScreenTransition} from './UIScreenTransition';
import {BlockInputEvents} from 'cc';

@ccclass('BaseView')
export class BaseView extends Component implements ScreenView {
    @property(UIOpacity)
    private viewRoot: UIOpacity | null = null;

    @property(UIScreenTransition)
    private screenTransition: UIScreenTransition | null = null;

    @property(BlockInputEvents)
    private blockInputEvents: BlockInputEvents | null = null;

    public viewDidClose: (() => void) | null = null;
    public viewDidOpen: (() => void) | null = null;
    public viewDidDestroy: (() => void) | null = null;

    isReady: boolean = false;
    uiTransform: UITransform;

    onLoad() {
        this.viewRoot = this.getComponent(UIOpacity);
        this.uiTransform = this.getComponent(UITransform);
        this.screenTransition = this.getComponent(UIScreenTransition);
        this.blockInputEvents = this.getComponent(BlockInputEvents);

        this.updateOpacity(0);
        this.onLoadedEvent();
        this.isReady = true;
    }

    start() {
        this.startEvent();
    }

    onDestroy() {
        this.onDestroyEvent();
        this.viewDidDestroy?.();
    }

    protected onLoadedEvent() {
        // Có thể override trong class con
    }

    protected startEvent() {
        // Có thể override trong class con
    }

    protected onDestroyEvent() {
        // Có thể override trong class con
    }

    public async open(): Promise<void> {
        this.updateOpacity(255);
        if (this.screenTransition) {
            await this.screenTransition.playIntroAnim();
        }
        this.viewDidOpen?.();
    }

    public async close(): Promise<void> {
        if (this.screenTransition) {
            await this.screenTransition.playOutroAnim();
        }
        this.updateOpacity(0);
        this.viewDidClose?.();
    }

    public hide(): void {
        this.updateOpacity(0);
    }

    public show(): void {
        this.updateOpacity(255);
    }

    public destroySelf(): void {
        this.node.destroy();
    }

    protected updateOpacity(value: number): void {
        if (this.viewRoot) {
            this.viewRoot.opacity = value;
            if (this.blockInputEvents) {
                this.blockInputEvents.enabled = value < 255;
            }
        }
    }
}