import { Node, Vec3, tween, Tween, UIOpacity } from 'cc';
import { CocosTask } from './CocosTask';
import { CancellationToken } from './CancellationToken';

// Animation operations similar to UniTask DOTween extensions
export class CocosTaskAnimation {
    // Wait for tween completion
    static waitForCompletion(tweenInstance: Tween<any>, cancellationToken?: CancellationToken): CocosTask<void> {
        return new CocosTask(new Promise<void>((resolve, reject) => {
            if (cancellationToken?.isCancellationRequested) {
                reject(new Error('OperationCanceledException'));
                return;
            }

            tweenInstance.call(() => {
                if (cancellationToken?.isCancellationRequested) {
                    reject(new Error('OperationCanceledException'));
                } else {
                    resolve();
                }
            }).start();

            cancellationToken?.register(() => {
                tweenInstance.stop();
                reject(new Error('OperationCanceledException'));
            });
        }), cancellationToken);
    }

    // Animate position to target
    static toPosition(node: Node, targetPos: Vec3, duration: number, cancellationToken?: CancellationToken): CocosTask<void> {
        const tweenInstance = tween(node).to(duration, { position: targetPos });
        return CocosTaskAnimation.waitForCompletion(tweenInstance, cancellationToken);
    }

    // Animate scale to target
    static toScale(node: Node, targetScale: Vec3, duration: number, cancellationToken?: CancellationToken): CocosTask<void> {
        const tweenInstance = tween(node).to(duration, { scale: targetScale });
        return CocosTaskAnimation.waitForCompletion(tweenInstance, cancellationToken);
    }

    // Animate rotation to target
    static toRotation(node: Node, targetRotation: Vec3, duration: number, cancellationToken?: CancellationToken): CocosTask<void> {
        const tweenInstance = tween(node).to(duration, { eulerAngles: targetRotation });
        return CocosTaskAnimation.waitForCompletion(tweenInstance, cancellationToken);
    }

    // Fade to alpha (using UIOpacity component)
    static toAlpha(node: Node, targetAlpha: number, duration: number, cancellationToken?: CancellationToken): CocosTask<void> {
        return new CocosTask(new Promise<void>((resolve, reject) => {
            if (cancellationToken?.isCancellationRequested) {
                reject(new Error('OperationCanceledException'));
                return;
            }

            let uiOpacity = node.getComponent(UIOpacity);
            if (!uiOpacity) {
                uiOpacity = node.addComponent(UIOpacity);
            }

            const tweenInstance = tween(uiOpacity).to(duration, {
                opacity: Math.round(targetAlpha * 255)
            }).call(() => {
                if (cancellationToken?.isCancellationRequested) {
                    reject(new Error('OperationCanceledException'));
                } else {
                    resolve();
                }
            }).start();

            cancellationToken?.register(() => {
                tweenInstance.stop();
                reject(new Error('OperationCanceledException'));
            });
        }), cancellationToken);
    }

    // Fade in
    static fadeIn(node: Node, duration: number, cancellationToken?: CancellationToken): CocosTask<void> {
        return CocosTaskAnimation.toAlpha(node, 1, duration, cancellationToken);
    }

    // Fade out
    static fadeOut(node: Node, duration: number, cancellationToken?: CancellationToken): CocosTask<void> {
        return CocosTaskAnimation.toAlpha(node, 0, duration, cancellationToken);
    }

    // Move by offset
    static moveBy(node: Node, offset: Vec3, duration: number, cancellationToken?: CancellationToken): CocosTask<void> {
        const targetPos = node.position.clone().add(offset);
        return CocosTaskAnimation.toPosition(node, targetPos, duration, cancellationToken);
    }

    // Scale by multiplier
    static scaleBy(node: Node, multiplier: Vec3, duration: number, cancellationToken?: CancellationToken): CocosTask<void> {
        const targetScale = new Vec3(
            node.scale.x * multiplier.x,
            node.scale.y * multiplier.y,
            node.scale.z * multiplier.z
        );
        return CocosTaskAnimation.toScale(node, targetScale, duration, cancellationToken);
    }

    // Rotate by offset
    static rotateBy(node: Node, offset: Vec3, duration: number, cancellationToken?: CancellationToken): CocosTask<void> {
        const targetRotation = node.eulerAngles.clone().add(offset);
        return CocosTaskAnimation.toRotation(node, targetRotation, duration, cancellationToken);
    }
}