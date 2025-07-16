// Main exports for CocosTask system
export { CancellationToken, CancellationTokenSource } from './CancellationToken';
export { CocosTask } from './CocosTask';
export { CocosTaskDelay } from './CocosTaskDelay';
export { CocosTaskWait } from './CocosTaskWait';
export { CocosTaskAnimation } from './CocosTaskAnimation';
export { CocosTaskUtility } from './CocosTaskUtility';

// Re-export for convenience (similar to UniTask namespace)
export namespace CocosTask {
    // Basic operations
    export const Delay = CocosTaskDelay.delay;
    export const DelayFrame = CocosTaskDelay.delayFrame;
    export const NextFrame = CocosTaskDelay.nextFrame;
    export const EndOfFrame = CocosTaskDelay.endOfFrame;

    // Wait operations
    export const WaitUntil = CocosTaskWait.waitUntil;
    export const WaitWhile = CocosTaskWait.waitWhile;
    export const WaitForDestroy = CocosTaskWait.waitForDestroy;
    export const WaitForActive = CocosTaskWait.waitForActive;
    export const WaitForInactive = CocosTaskWait.waitForInactive;

    // Animation operations
    export const ToPosition = CocosTaskAnimation.toPosition;
    export const ToScale = CocosTaskAnimation.toScale;
    export const ToRotation = CocosTaskAnimation.toRotation;
    export const ToAlpha = CocosTaskAnimation.toAlpha;
    export const FadeIn = CocosTaskAnimation.fadeIn;
    export const FadeOut = CocosTaskAnimation.fadeOut;
    export const MoveBy = CocosTaskAnimation.moveBy;
    export const ScaleBy = CocosTaskAnimation.scaleBy;
    export const RotateBy = CocosTaskAnimation.rotateBy;

    // Utility operations
    export const Timeout = CocosTaskUtility.timeout;
    export const Retry = CocosTaskUtility.retry;
    export const Repeat = CocosTaskUtility.repeat;
    export const RepeatForever = CocosTaskUtility.repeatForever;
    export const Periodic = CocosTaskUtility.periodic;
    export const WithTimeout = CocosTaskUtility.withTimeout;
    export const Sequence = CocosTaskUtility.sequence;
    export const ParallelLimit = CocosTaskUtility.parallelLimit;
}