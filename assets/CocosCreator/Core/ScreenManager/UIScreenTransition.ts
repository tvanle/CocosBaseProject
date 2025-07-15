import { _decorator, Component, Node, Animation, AnimationClip, input, Input } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIScreenTransition')
export class UIScreenTransition extends Component {

    @property(Animation)
    private introAnimation: Animation = null!;

    @property(Animation)
    private outroAnimation: Animation = null!;

    @property(AnimationClip)
    private introClip: AnimationClip = null!;

    @property(AnimationClip)
    private outroClip: AnimationClip = null!;

    @property({
        tooltip: "if lockInput = true, disable input while anim is running"
    })
    private lockInput: boolean = true;

    @property({
        tooltip: "Animation update mode - Normal or UnscaledTime"
    })
    private unscaledTime: boolean = false;

    private inputEnabled: boolean = true;
    private animationTask: ((value?: any) => void) | null = null;

    // Getters tương tự Unity
    public get IntroAnimation(): Animation { return this.introAnimation; }
    public get OutroAnimation(): Animation { return this.outroAnimation; }

    protected onLoad(): void {
        this.setupAnimations();
    }

    private setupAnimations(): void {
        // Setup intro animation
        if (this.introAnimation && this.introClip) {
            this.introAnimation.addClip(this.introClip, 'intro');
            this.introAnimation.node.active = true;

            // Đăng ký event khi animation kết thúc
            this.introAnimation.on(Animation.EventType.FINISHED, this.onAnimComplete, this);
            this.introAnimation.on(Animation.EventType.STOP, this.onAnimComplete, this);
        }

        // Setup outro animation
        if (this.outroAnimation && this.outroClip) {
            this.outroAnimation.addClip(this.outroClip, 'outro');
            this.outroAnimation.node.active = true;

            // Đăng ký event khi animation kết thúc
            this.outroAnimation.on(Animation.EventType.FINISHED, this.onAnimComplete, this);
            this.outroAnimation.on(Animation.EventType.STOP, this.onAnimComplete, this);
        }
    }

    public async playIntroAnim(): Promise<void> {
        return this.playAnim(this.introAnimation, 'intro');
    }

    public async playOutroAnim(): Promise<void> {
        return this.playAnim(this.outroAnimation, 'outro');
    }

    private async playAnim(animComponent: Animation, clipName: string): Promise<void> {
        if (!animComponent || !animComponent.getState(clipName)) {
            return Promise.resolve();
        }

        return new Promise<void>((resolve) => {
            this.animationTask = resolve;
            this.setActiveInput(false);

            // Reset animation to start
            const state = animComponent.getState(clipName);
            if (state) {
                state.time = 0;
                state.sample(); // Tương đương Evaluate() trong Unity
            }

            // Play animation
            animComponent.play(clipName);
        });
    }

    private onAnimComplete(): void {
        if (this.animationTask) {
            this.animationTask();
            this.animationTask = null;
        }
        this.setActiveInput(true);
    }

    private setActiveInput(value: boolean): void {
        if (!this.lockInput) return;

        this.inputEnabled = value;

        if (value) {
            // Enable input
            input.on(Input.EventType.TOUCH_START, this.blockInput, this);
            input.on(Input.EventType.TOUCH_MOVE, this.blockInput, this);
            input.on(Input.EventType.TOUCH_END, this.blockInput, this);
            input.on(Input.EventType.TOUCH_CANCEL, this.blockInput, this);
        } else {
            // Disable input
            input.off(Input.EventType.TOUCH_START, this.blockInput, this);
            input.off(Input.EventType.TOUCH_MOVE, this.blockInput, this);
            input.off(Input.EventType.TOUCH_END, this.blockInput, this);
            input.off(Input.EventType.TOUCH_CANCEL, this.blockInput, this);
        }
    }

    private blockInput(event: any): void {
        if (!this.inputEnabled) {
            event.propagationStopped = true;
            event.propagationImmediateStopped = true;
        }
    }

    /**
     * Stop all animations
     */
    public stopAllAnimations(): void {
        if (this.introAnimation) {
            this.introAnimation.stop();
        }
        if (this.outroAnimation) {
            this.outroAnimation.stop();
        }

        // Reset task if any
        if (this.animationTask) {
            this.animationTask();
            this.animationTask = null;
        }

        this.setActiveInput(true);
    }

    /**
     * Check if any animation is playing
     */
    public isPlaying(): boolean {
        const introPlaying = this.introAnimation ?
            this.introAnimation.getState('intro')?.isPlaying : false;
        const outroPlaying = this.outroAnimation ?
            this.outroAnimation.getState('outro')?.isPlaying : false;

        return introPlaying || outroPlaying;
    }

    /**
     * Set animation speed
     */
    public setAnimationSpeed(speed: number): void {
        if (this.introAnimation) {
            const state = this.introAnimation.getState('intro');
            if (state) state.speed = speed;
        }

        if (this.outroAnimation) {
            const state = this.outroAnimation.getState('outro');
            if (state) state.speed = speed;
        }
    }

    protected onDestroy(): void {
        // Clean up events
        if (this.introAnimation) {
            this.introAnimation.off(Animation.EventType.FINISHED, this.onAnimComplete, this);
            this.introAnimation.off(Animation.EventType.STOP, this.onAnimComplete, this);
        }

        if (this.outroAnimation) {
            this.outroAnimation.off(Animation.EventType.FINISHED, this.onAnimComplete, this);
            this.outroAnimation.off(Animation.EventType.STOP, this.onAnimComplete, this);
        }

        // Clean up input events
        input.off(Input.EventType.TOUCH_START, this.blockInput, this);
        input.off(Input.EventType.TOUCH_MOVE, this.blockInput, this);
        input.off(Input.EventType.TOUCH_END, this.blockInput, this);
        input.off(Input.EventType.TOUCH_CANCEL, this.blockInput, this);
    }
}