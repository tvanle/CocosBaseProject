import { Component } from 'cc';
import { CocosTask } from './CocosTask';
import { CancellationToken } from './CancellationToken';

// Delay and frame operations similar to UniTask
export class CocosTaskDelay {
    // Delay with milliseconds
    static delay(milliseconds: number, cancellationToken?: CancellationToken): CocosTask<void> {
        return CocosTask.delay(milliseconds, cancellationToken);
    }

    // Delay with frames
    static delayFrame(frames: number, component: Component, cancellationToken?: CancellationToken): CocosTask<void> {
        return new CocosTask(new Promise<void>((resolve, reject) => {
            if (cancellationToken?.isCancellationRequested) {
                reject(new Error('OperationCanceledException'));
                return;
            }

            let frameCount = 0;
            const updateFunc = () => {
                if (cancellationToken?.isCancellationRequested) {
                    component.unschedule(updateFunc);
                    reject(new Error('OperationCanceledException'));
                    return;
                }

                frameCount++;
                if (frameCount >= frames) {
                    component.unschedule(updateFunc);
                    resolve();
                }
            };

            component.schedule(updateFunc);

            cancellationToken?.register(() => {
                component.unschedule(updateFunc);
                reject(new Error('OperationCanceledException'));
            });
        }), cancellationToken);
    }

    // Wait for next frame
    static nextFrame(component: Component, cancellationToken?: CancellationToken): CocosTask<void> {
        return CocosTaskDelay.delayFrame(1, component, cancellationToken);
    }

    // Wait for end of frame
    static endOfFrame(component: Component, cancellationToken?: CancellationToken): CocosTask<void> {
        return new CocosTask(new Promise<void>((resolve, reject) => {
            if (cancellationToken?.isCancellationRequested) {
                reject(new Error('OperationCanceledException'));
                return;
            }

            const updateFunc = () => {
                component.unschedule(updateFunc);
                if (cancellationToken?.isCancellationRequested) {
                    reject(new Error('OperationCanceledException'));
                } else {
                    resolve();
                }
            };

            component.scheduleOnce(updateFunc, 0);

            cancellationToken?.register(() => {
                component.unschedule(updateFunc);
                reject(new Error('OperationCanceledException'));
            });
        }), cancellationToken);
    }
}