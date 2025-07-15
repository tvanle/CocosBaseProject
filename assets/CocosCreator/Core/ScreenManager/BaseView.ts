import { _decorator, Component } from 'cc';
const { ccclass, property } = _decorator;
import { UIOpacity } from 'cc';
import { Node } from 'cc';
import { IScreenView } from './IScreenView';
import { UIScreenTransition } from './UIScreenTransition';
import { BlockInputEvents } from 'cc';

@ccclass('BaseView')
export class BaseView extends Component implements IScreenView {
    @property(UIOpacity)
    private viewRoot: UIOpacity | null = null;

    @property(UIScreenTransition)
    private screenTransition: UIScreenTransition | null = null;

    @property(BlockInputEvents)
    private blockInputEvents: BlockInputEvents | null = null;

    public viewDidClose: (() => void) | null = null;
    public viewDidOpen: (() => void) | null = null;
    public viewDidDestroy: (() => void) | null = null;

    private _isReadyToUse: boolean = false;
    public get isReadyToUse(): boolean {
        return this._isReadyToUse;
    }

    public get rectTransform(): Node {
        return this.node;
    }

    onLoad() {
        // Tương tự Awake() trong Unity
        if (!this.viewRoot) {
            this.viewRoot = this.getComponent(UIOpacity);
        }

        if (!this.screenTransition) {
            this.screenTransition = this.getComponent(UIScreenTransition);
        }

        if (!this.blockInputEvents) {
            this.blockInputEvents = this.getComponent(BlockInputEvents);
        }

        if (!this.screenTransition) {
            console.error(`Cannot find UIScreenTransition component in ${this.node.name} screen`);
        }

        // Đặt opacity ban đầu là 0 để ẩn
        this.updateOpacity(0);

        this.awakeUnityEvent();
        this._isReadyToUse = true;
    }

    start() {
        this.startUnityEvent();
    }

    onDestroy() {
        this.onDestroyUnityEvent();
        this.viewDidDestroy?.();
    }

    protected awakeUnityEvent() {
        // Có thể override trong class con
    }

    protected startUnityEvent() {
        // Có thể override trong class con
    }

    protected onDestroyUnityEvent() {
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
            // blocksRaycasts: vô hiệu hóa sự kiện khi opacity < 255
            if (this.blockInputEvents) {
                this.blockInputEvents.enabled = value < 255;
            }
        }
    }
}