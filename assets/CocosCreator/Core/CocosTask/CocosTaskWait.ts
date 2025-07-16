import { Component, Node } from 'cc';
import { CocosTask } from './CocosTask';
import { CancellationToken } from './CancellationToken';

// Wait operations similar to UniTask
export class CocosTaskWait {
    // Wait until condition is true
    static waitUntil(predicate: () => boolean, component: Component, cancellationToken?: CancellationToken): CocosTask<void> {
        return new CocosTask(new Promise<void>((resolve, reject) => {
            if (cancellationToken?.isCancellationRequested) {
                reject(new Error('OperationCanceledException'));
                return;
            }

            if (predicate()) {
                resolve();
                return;
            }

            const checkCondition = () => {
                if (cancellationToken?.isCancellationRequested) {
                    component.unschedule(checkCondition);
                    reject(new Error('OperationCanceledException'));
                    return;
                }

                if (predicate()) {
                    component.unschedule(checkCondition);
                    resolve();
                }
            };

            component.schedule(checkCondition, 0);

            cancellationToken?.register(() => {
                component.unschedule(checkCondition);
                reject(new Error('OperationCanceledException'));
            });
        }), cancellationToken);
    }

    // Wait while condition is true
    static waitWhile(predicate: () => boolean, component: Component, cancellationToken?: CancellationToken): CocosTask<void> {
        return CocosTaskWait.waitUntil(() => !predicate(), component, cancellationToken);
    }

    // Wait for node destruction
    static waitForDestroy(node: Node, component: Component, cancellationToken?: CancellationToken): CocosTask<void> {
        return CocosTaskWait.waitUntil(() => !node.isValid, component, cancellationToken);
    }

    // Wait for node to become active
    static waitForActive(node: Node, component: Component, cancellationToken?: CancellationToken): CocosTask<void> {
        return CocosTaskWait.waitUntil(() => node.activeInHierarchy, component, cancellationToken);
    }

    // Wait for node to become inactive
    static waitForInactive(node: Node, component: Component, cancellationToken?: CancellationToken): CocosTask<void> {
        return CocosTaskWait.waitUntil(() => !node.activeInHierarchy, component, cancellationToken);
    }
}