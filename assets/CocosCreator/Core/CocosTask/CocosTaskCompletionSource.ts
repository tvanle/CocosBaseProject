export class CocosTaskCompletionSource<T = void> {
    private promise: Promise<T>;
    private resolveFn: ((value: T | PromiseLike<T>) => void) | null = null;
    private rejectFn: ((reason?: any) => void) | null = null;
    private isCompleted: boolean = false;

    constructor() {
        this.promise = new Promise<T>((resolve, reject) => {
            this.resolveFn = resolve;
            this.rejectFn = reject;
        });
    }

    public getPromise(): Promise<T> {
        return this.promise;
    }

    public setResult(value: T): void {
        if (this.isCompleted) {
            console.warn('PromiseCompletionSource is already completed');
            return;
        }
        this.isCompleted = true;
        this.resolveFn?.(value);
        this.resolveFn = null;
        this.rejectFn = null;
    }

    public trySetResult(value: T): boolean {
        if (this.isCompleted) {
            return false;
        }
        this.setResult(value);
        return true;
    }

    public setException(error: any): void {
        if (this.isCompleted) {
            console.warn('PromiseCompletionSource is already completed');
            return;
        }
        this.isCompleted = true;
        this.rejectFn?.(error);
        this.resolveFn = null;
        this.rejectFn = null;
    }

    public get isDone(): boolean {
        return this.isCompleted;
    }
}