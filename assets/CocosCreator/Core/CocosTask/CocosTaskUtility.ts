import { Component } from 'cc';
import { CocosTask } from './CocosTask';
import { CancellationToken } from './CancellationToken';
import { CocosTaskDelay } from './CocosTaskDelay';

// Utility operations similar to UniTask extensions
export class CocosTaskUtility {
    // Timeout operation
    static timeout<T>(task: CocosTask<T>, timeoutMilliseconds: number): CocosTask<T> {
        return new CocosTask(Promise.race([
            task.getResult(),
            new Promise<T>((_, reject) => {
                setTimeout(() => reject(new Error('TimeoutException')), timeoutMilliseconds);
            })
        ]));
    }

    // Retry with exponential backoff
    static retry<T>(
        taskFactory: () => CocosTask<T>,
        maxAttempts: number,
        baseDelayMs: number = 1000,
        cancellationToken?: CancellationToken
    ): CocosTask<T> {
        return new CocosTask((async () => {
            let lastError: Error | null = null;
            for (let attempt = 0; attempt < maxAttempts; attempt++) {
                cancellationToken?.throwIfCancellationRequested();
                try {
                    return await taskFactory().getResult();
                } catch (error) {
                    lastError = error as Error;
                    if (attempt < maxAttempts - 1) {
                        const delay = baseDelayMs * Math.pow(2, attempt);
                        await CocosTask.delay(delay, cancellationToken).getResult();
                    }
                }
            }
            throw lastError!;
        })(), cancellationToken);
    }

    // Execute action repeatedly
    static repeat<T>(
        taskFactory: () => CocosTask<T>,
        count: number,
        cancellationToken?: CancellationToken
    ): CocosTask<T[]> {
        return new CocosTask((async () => {
            const results: T[] = [];
            for (let i = 0; i < count; i++) {
                cancellationToken?.throwIfCancellationRequested();
                const result = await taskFactory().getResult();
                results.push(result);
            }
            return results;
        })(), cancellationToken);
    }

    // Execute action forever
    static repeatForever<T>(
        taskFactory: () => CocosTask<T>,
        component: Component,
        cancellationToken?: CancellationToken
    ): CocosTask<void> {
        return new CocosTask((async () => {
            while (!cancellationToken?.isCancellationRequested) {
                await taskFactory().getResult();
                await CocosTaskDelay.nextFrame(component, cancellationToken).getResult();
            }
        })(), cancellationToken);
    }

    // Execute action periodically
    static periodic(
        taskFactory: () => CocosTask<void>,
        intervalMs: number,
        component: Component,
        cancellationToken?: CancellationToken
    ): CocosTask<void> {
        return new CocosTask((async () => {
            while (!cancellationToken?.isCancellationRequested) {
                await taskFactory().getResult();
                await CocosTask.delay(intervalMs, cancellationToken).getResult();
            }
        })(), cancellationToken);
    }

    // Execute with configurable timeout
    static withTimeout<T>(task: CocosTask<T>, timeoutMs: number): CocosTask<T> {
        return CocosTaskUtility.timeout(task, timeoutMs);
    }

    // Run tasks in sequence
    static sequence<T>(tasks: CocosTask<T>[], cancellationToken?: CancellationToken): CocosTask<T[]> {
        return new CocosTask((async () => {
            const results: T[] = [];
            for (const task of tasks) {
                cancellationToken?.throwIfCancellationRequested();
                const result = await task.getResult();
                results.push(result);
            }
            return results;
        })(), cancellationToken);
    }

    // Run tasks in parallel with limit
    static parallelLimit<T>(tasks: CocosTask<T>[], limit: number): CocosTask<T[]> {
        return new CocosTask((async () => {
            const results: T[] = new Array(tasks.length);

            // Simple approach: run tasks in batches
            for (let i = 0; i < tasks.length; i += limit) {
                const batch = tasks.slice(i, i + limit);
                const batchResults = await Promise.all(
                    batch.map(task => task.getResult())
                );

                // Copy batch results to the correct positions
                for (let j = 0; j < batchResults.length; j++) {
                    results[i + j] = batchResults[j];
                }
            }

            return results;
        })());
    }
}