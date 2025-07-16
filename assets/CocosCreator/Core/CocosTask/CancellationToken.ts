// CancellationToken implementation similar to UniTask
export class CancellationToken {
    private _cancelled: boolean = false;
    private _callbacks: Array<() => void> = [];

    public static readonly None = new CancellationToken();

    get isCancellationRequested(): boolean {
        return this._cancelled;
    }

    cancel(): void {
        if (this._cancelled) return;
        this._cancelled = true;
        this._callbacks.forEach(callback => {
            try {
                callback();
            } catch (error) {
                console.error('Error in cancellation callback:', error);
            }
        });
        this._callbacks.length = 0;
    }

    register(callback: () => void): void {
        if (this._cancelled) {
            callback();
            return;
        }
        this._callbacks.push(callback);
    }

    throwIfCancellationRequested(): void {
        if (this._cancelled) {
            throw new Error('OperationCanceledException');
        }
    }
}

export class CancellationTokenSource {
    private _token: CancellationToken = new CancellationToken();

    get token(): CancellationToken {
        return this._token;
    }

    cancel(): void {
        this._token.cancel();
    }

    dispose(): void {
        this.cancel();
    }
}