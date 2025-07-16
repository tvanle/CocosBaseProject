import { CancellationToken } from './CancellationToken';

// Core CocosTask implementation similar to UniTask
export class CocosTask<T = void> {
    private _promise: Promise<T>;
    private _cancellationToken?: CancellationToken;

    constructor(promise: Promise<T>, cancellationToken?: CancellationToken) {
        this._promise = promise;
        this._cancellationToken = cancellationToken;
    }

    // Wait for completion (similar to UniTask.GetResult())
    async getResult(): Promise<T> {
        this._cancellationToken?.throwIfCancellationRequested();
        return await this._promise;
    }

    // For async/await compatibility
    then<TResult1 = T, TResult2 = never>(
        onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
        onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
    ): Promise<TResult1 | TResult2> {
        return this._promise.then(onfulfilled, onrejected);
    }

    catch<TResult = never>(
        onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null
    ): Promise<T | TResult> {
        return this._promise.catch(onrejected);
    }


    // Static factory methods
    static fromPromise<T>(promise: Promise<T>, cancellationToken?: CancellationToken): CocosTask<T> {
        return new CocosTask(promise, cancellationToken);
    }

    static completedTask(): CocosTask<void> {
        return new CocosTask(Promise.resolve());
    }

    static fromResult<T>(value: T): CocosTask<T> {
        return new CocosTask(Promise.resolve(value));
    }

    static fromException<T>(error: Error): CocosTask<T> {
        return new CocosTask(Promise.reject(error));
    }

    static fromCanceled<T>(cancellationToken?: CancellationToken): CocosTask<T> {
        return new CocosTask(Promise.reject(new Error('OperationCanceledException')), cancellationToken);
    }

    // Utility methods
    static whenAll<T>(tasks: CocosTask<T>[]): CocosTask<T[]> {
        return new CocosTask(Promise.all(tasks.map(task => task.getResult())));
    }

    static whenAny<T>(tasks: CocosTask<T>[]): CocosTask<T> {
        return new CocosTask(Promise.race(tasks.map(task => task.getResult())));
    }

    static delay(milliseconds: number, cancellationToken?: CancellationToken): CocosTask<void> {
        return new CocosTask(new Promise<void>((resolve, reject) => {
            if (cancellationToken?.isCancellationRequested) {
                reject(new Error('OperationCanceledException'));
                return;
            }

            const timeoutId = setTimeout(() => {
                if (cancellationToken?.isCancellationRequested) {
                    reject(new Error('OperationCanceledException'));
                } else {
                    resolve();
                }
            }, milliseconds);

            cancellationToken?.register(() => {
                clearTimeout(timeoutId);
                reject(new Error('OperationCanceledException'));
            });
        }), cancellationToken);
    }
}