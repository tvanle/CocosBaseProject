import { Node, tween, UIOpacity, UITransform, Vec3 } from 'cc';

export enum TransitionType {
    None = 'None',
    Fade = 'Fade',
    SlideLeft = 'SlideLeft',
    SlideRight = 'SlideRight',
    SlideUp = 'SlideUp',
    SlideDown = 'SlideDown',
    Scale = 'Scale'
}

export class ScreenTransition {
    type: TransitionType = TransitionType.Fade;
    duration: number = 0.3;

    async show(node: Node): Promise<void> {
        if (this.type === TransitionType.None) return;

        return new Promise<void>((resolve) => {
            this.setupShowTween(node, resolve);
        });
    }

    async hide(node: Node): Promise<void> {
        if (this.type === TransitionType.None) return;

        return new Promise<void>((resolve) => {
            this.setupHideTween(node, resolve);
        });
    }

    private setupShowTween(node: Node, onComplete: () => void): void {
        switch (this.type) {
            case TransitionType.Fade:
                const uiOpacity = node.getComponent(UIOpacity);
                if (uiOpacity) {
                    uiOpacity.opacity = 0;
                    tween(uiOpacity).to(this.duration, { opacity: 255 }).call(onComplete).start();
                } else {
                    onComplete();
                }
                break;

            case TransitionType.Scale:
                node.setScale(0, 0, 0);
                tween(node).to(this.duration, { scale: new Vec3(1, 1, 1) }).call(onComplete).start();
                break;

            case TransitionType.SlideLeft:
                const parentTransform = node.parent?.getComponent(UITransform);
                const width = parentTransform?.width || 1920;
                node.setPosition(-width, 0, 0);
                tween(node).to(this.duration, { position: new Vec3(0, 0, 0) }).call(onComplete).start();
                break;

            case TransitionType.SlideRight:
                const parentTransformRight = node.parent?.getComponent(UITransform);
                const widthRight = parentTransformRight?.width || 1920;
                node.setPosition(widthRight, 0, 0);
                tween(node).to(this.duration, { position: new Vec3(0, 0, 0) }).call(onComplete).start();
                break;

            case TransitionType.SlideUp:
                const parentTransformUp = node.parent?.getComponent(UITransform);
                const height = parentTransformUp?.height || 1080;
                node.setPosition(0, -height, 0);
                tween(node).to(this.duration, { position: new Vec3(0, 0, 0) }).call(onComplete).start();
                break;

            case TransitionType.SlideDown:
                const parentTransformDown = node.parent?.getComponent(UITransform);
                const heightDown = parentTransformDown?.height || 1080;
                node.setPosition(0, heightDown, 0);
                tween(node).to(this.duration, { position: new Vec3(0, 0, 0) }).call(onComplete).start();
                break;

            default:
                onComplete();
        }
    }

    private setupHideTween(node: Node, onComplete: () => void): void {
        switch (this.type) {
            case TransitionType.Fade:
                const uiOpacity = node.getComponent(UIOpacity);
                if (uiOpacity) {
                    tween(uiOpacity).to(this.duration, { opacity: 0 }).call(onComplete).start();
                } else {
                    onComplete();
                }
                break;

            case TransitionType.Scale:
                tween(node).to(this.duration, { scale: new Vec3(0, 0, 0) }).call(onComplete).start();
                break;

            case TransitionType.SlideLeft:
                const parentTransform = node.parent?.getComponent(UITransform);
                const width = parentTransform?.width || 1920;
                tween(node).to(this.duration, { position: new Vec3(width, 0, 0) }).call(onComplete).start();
                break;

            case TransitionType.SlideRight:
                const parentTransformRight = node.parent?.getComponent(UITransform);
                const widthRight = parentTransformRight?.width || 1920;
                tween(node).to(this.duration, { position: new Vec3(-widthRight, 0, 0) }).call(onComplete).start();
                break;

            case TransitionType.SlideUp:
                const parentTransformUp = node.parent?.getComponent(UITransform);
                const height = parentTransformUp?.height || 1080;
                tween(node).to(this.duration, { position: new Vec3(0, height, 0) }).call(onComplete).start();
                break;

            case TransitionType.SlideDown:
                const parentTransformDown = node.parent?.getComponent(UITransform);
                const heightDown = parentTransformDown?.height || 1080;
                tween(node).to(this.duration, { position: new Vec3(0, -heightDown, 0) }).call(onComplete).start();
                break;

            default:
                onComplete();
        }
    }
}