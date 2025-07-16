import { CocosTaskAnimation } from './CocosTaskAnimation';
import { CocosTaskDelay } from './CocosTaskDelay';
import { CocosTaskUtility } from './CocosTaskUtility';
import { CocosTaskWait } from './CocosTaskWait';

// Main exports for CocosTask system
export { CancellationToken, CancellationTokenSource } from './CancellationToken';
export { CocosTaskDelay } from './CocosTaskDelay';
export { CocosTaskWait } from './CocosTaskWait';
export { CocosTaskAnimation } from './CocosTaskAnimation';
export { CocosTaskUtility } from './CocosTaskUtility';

// Import the core CocosTask class for re-export
import { CocosTask as CocosTaskClass } from './CocosTask';

// Re-export for convenience (similar to UniTask namespace)
export namespace CocosTask {
    // Core static methods from CocosTask class
    export const delay = CocosTaskClass.delay;
    export const whenAll = CocosTaskClass.whenAll;
    export const whenAny = CocosTaskClass.whenAny;
    export const fromResult = CocosTaskClass.fromResult;
    export const fromPromise = CocosTaskClass.fromPromise;
    export const fromException = CocosTaskClass.fromException;
    export const fromCanceled = CocosTaskClass.fromCanceled;
    export const completedTask = CocosTaskClass.completedTask;

    // Basic operations (capitalized for UniTask style)
    export const Delay = CocosTaskClass.delay;
    export const DelayFrame = CocosTaskDelay.delayFrame;
    export const NextFrame = CocosTaskDelay.nextFrame;
    export const EndOfFrame = CocosTaskDelay.endOfFrame;
    export const WhenAll = CocosTaskClass.whenAll;
    export const WhenAny = CocosTaskClass.whenAny;

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

    // Factory methods
    export const FromResult = CocosTaskClass.fromResult;
    export const FromPromise = CocosTaskClass.fromPromise;
    export const FromException = CocosTaskClass.fromException;
    export const FromCanceled = CocosTaskClass.fromCanceled;
    export const CompletedTask = CocosTaskClass.completedTask;
}