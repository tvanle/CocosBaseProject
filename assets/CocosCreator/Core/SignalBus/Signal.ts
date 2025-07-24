import { _decorator } from 'cc';
import { ISignal, ISignal1, ISignal2, ISignal3, ISignal4, ISignal5, ISignalBase } from './ISignal';

const { ccclass } = _decorator;

/**
 * Base Signal implementation
 * Similar to Unity's Signal classes
 */
abstract class SignalBase implements ISignalBase {
    protected _listeners: Function[] = [];
    
    public get hasListeners(): boolean {
        return this._listeners.length > 0;
    }
    
    public addListener(callback: Function): void {
        if (!this._listeners.includes(callback)) {
            this._listeners.push(callback);
        }
    }
    
    public removeListener(callback: Function): void {
        const index = this._listeners.indexOf(callback);
        if (index !== -1) {
            this._listeners.splice(index, 1);
        }
    }
    
    public removeAllListeners(): void {
        this._listeners.length = 0;
    }
    
    protected invokeListeners(...args: any[]): void {
        // Create a copy to avoid issues with listeners being removed during iteration
        const listeners = [...this._listeners];
        for (const listener of listeners) {
            try {
                listener(...args);
            } catch (error) {
                console.error('Error in signal callback:', error);
            }
        }
    }
}

/**
 * Signal with no parameters
 * Similar to Unity's Signal class
 */
@ccclass('Signal')
export class Signal extends SignalBase implements ISignal {
    public addListener(callback: () => void): void {
        super.addListener(callback);
    }
    
    public removeListener(callback: () => void): void {
        super.removeListener(callback);
    }
    
    public fire(): void {
        this.invokeListeners();
    }
}

/**
 * Signal with one parameter
 * Similar to Unity's Signal<T> class
 */
@ccclass('Signal1')
export class Signal1<T> extends SignalBase implements ISignal1<T> {
    public addListener(callback: (arg: T) => void): void {
        super.addListener(callback);
    }
    
    public removeListener(callback: (arg: T) => void): void {
        super.removeListener(callback);
    }
    
    public fire(arg: T): void {
        this.invokeListeners(arg);
    }
}

/**
 * Signal with two parameters
 * Similar to Unity's Signal<T1, T2> class
 */
@ccclass('Signal2')
export class Signal2<T1, T2> extends SignalBase implements ISignal2<T1, T2> {
    public addListener(callback: (arg1: T1, arg2: T2) => void): void {
        super.addListener(callback);
    }
    
    public removeListener(callback: (arg1: T1, arg2: T2) => void): void {
        super.removeListener(callback);
    }
    
    public fire(arg1: T1, arg2: T2): void {
        this.invokeListeners(arg1, arg2);
    }
}

/**
 * Signal with three parameters
 * Similar to Unity's Signal<T1, T2, T3> class
 */
@ccclass('Signal3')
export class Signal3<T1, T2, T3> extends SignalBase implements ISignal3<T1, T2, T3> {
    public addListener(callback: (arg1: T1, arg2: T2, arg3: T3) => void): void {
        super.addListener(callback);
    }
    
    public removeListener(callback: (arg1: T1, arg2: T2, arg3: T3) => void): void {
        super.removeListener(callback);
    }
    
    public fire(arg1: T1, arg2: T2, arg3: T3): void {
        this.invokeListeners(arg1, arg2, arg3);
    }
}

/**
 * Signal with four parameters
 * Similar to Unity's Signal<T1, T2, T3, T4> class
 */
@ccclass('Signal4')
export class Signal4<T1, T2, T3, T4> extends SignalBase implements ISignal4<T1, T2, T3, T4> {
    public addListener(callback: (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => void): void {
        super.addListener(callback);
    }
    
    public removeListener(callback: (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => void): void {
        super.removeListener(callback);
    }
    
    public fire(arg1: T1, arg2: T2, arg3: T3, arg4: T4): void {
        this.invokeListeners(arg1, arg2, arg3, arg4);
    }
}

/**
 * Signal with five parameters
 * Similar to Unity's Signal<T1, T2, T3, T4, T5> class
 */
@ccclass('Signal5')
export class Signal5<T1, T2, T3, T4, T5> extends SignalBase implements ISignal5<T1, T2, T3, T4, T5> {
    public addListener(callback: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => void): void {
        super.addListener(callback);
    }
    
    public removeListener(callback: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => void): void {
        super.removeListener(callback);
    }
    
    public fire(arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5): void {
        this.invokeListeners(arg1, arg2, arg3, arg4, arg5);
    }
}
