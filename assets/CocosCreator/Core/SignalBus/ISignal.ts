import { _decorator } from 'cc';

const { ccclass } = _decorator;

/**
 * Base interface for all signals
 * Similar to Unity's ISignal interface
 */
export interface ISignalBase {
    readonly hasListeners: boolean;
    addListener(callback: Function): void;
    removeListener(callback: Function): void;
    removeAllListeners(): void;
}

/**
 * Signal with no parameters
 */
export interface ISignal extends ISignalBase {
    addListener(callback: () => void): void;
    removeListener(callback: () => void): void;
    fire(): void;
}

/**
 * Signal with one parameter
 */
export interface ISignal1<T> extends ISignalBase {
    addListener(callback: (arg: T) => void): void;
    removeListener(callback: (arg: T) => void): void;
    fire(arg: T): void;
}

/**
 * Signal with two parameters  
 */
export interface ISignal2<T1, T2> extends ISignalBase {
    addListener(callback: (arg1: T1, arg2: T2) => void): void;
    removeListener(callback: (arg1: T1, arg2: T2) => void): void;
    fire(arg1: T1, arg2: T2): void;
}

/**
 * Signal with three parameters
 */
export interface ISignal3<T1, T2, T3> extends ISignalBase {
    addListener(callback: (arg1: T1, arg2: T2, arg3: T3) => void): void;
    removeListener(callback: (arg1: T1, arg2: T2, arg3: T3) => void): void;
    fire(arg1: T1, arg2: T2, arg3: T3): void;
}

/**
 * Signal with four parameters
 */
export interface ISignal4<T1, T2, T3, T4> extends ISignalBase {
    addListener(callback: (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => void): void;
    removeListener(callback: (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => void): void;
    fire(arg1: T1, arg2: T2, arg3: T3, arg4: T4): void;
}

/**
 * Signal with five parameters
 */
export interface ISignal5<T1, T2, T3, T4, T5> extends ISignalBase {
    addListener(callback: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => void): void;
    removeListener(callback: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => void): void;
    fire(arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5): void;
}
