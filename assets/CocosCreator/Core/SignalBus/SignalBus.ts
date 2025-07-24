import { _decorator } from 'cc';
import { ISignalBase } from './ISignal';

const { ccclass } = _decorator;

/**
 * Signal identifier interface
 * Similar to Unity's ISignalDeclaration
 */
export interface ISignalDeclaration {
    readonly signalType: string;
}

/**
 * Signal subscription handle
 * Similar to Unity's SubscriptionToken for unsubscribing
 */
export interface ISubscriptionToken {
    unsubscribe(): void;
}

/**
 * Internal subscription token implementation
 */
class SubscriptionToken implements ISubscriptionToken {
    constructor(
        private signalBus: SignalBus,
        private signalType: string, 
        private callback: Function
    ) {}
    
    public unsubscribe(): void {
        this.signalBus.unsubscribe(this.signalType, this.callback);
    }
}

/**
 * SignalBus - Central messaging system
 * Similar to Unity's SignalBus from Zenject/Extenject
 * Manages all signals in the application using singleton pattern
 */
@ccclass('SignalBus')
export class SignalBus {
    private static _instance: SignalBus | null = null;
    private _signals: Map<string, ISignalBase> = new Map();
    private _signalInstances: Map<Function, ISignalBase> = new Map();
    
    /**
     * Singleton instance getter
     */
    public static get instance(): SignalBus {
        if (!this._instance) {
            this._instance = new SignalBus();
        }
        return this._instance;
    }
    
    /**
     * Private constructor for singleton pattern
     */
    private constructor() {
        // Private constructor prevents external instantiation
    }
    
    /**
     * Declare a signal type for later use
     * Similar to Unity's DeclareSignal<T>()
     */
    public declareSignal<T extends ISignalBase>(signalConstructor: new() => T): void {
        const signalType = signalConstructor.name;
        if (!this._signals.has(signalType)) {
            const signalInstance = new signalConstructor();
            this._signals.set(signalType, signalInstance);
            this._signalInstances.set(signalConstructor, signalInstance);
        }
    }
    
    /**
     * Get signal instance by constructor
     * Similar to Unity's GetSignal<T>()
     */
    public getSignal<T extends ISignalBase>(signalConstructor: new() => T): T {
        let signal = this._signalInstances.get(signalConstructor) as T;
        if (!signal) {
            // Auto-declare if not declared yet
            this.declareSignal(signalConstructor);
            signal = this._signalInstances.get(signalConstructor) as T;
        }
        return signal;
    }
    
    /**
     * Subscribe to a signal
     * Similar to Unity's Subscribe<T>(callback)
     */
    public subscribe<T extends ISignalBase>(
        signalConstructor: new() => T, 
        callback: Function
    ): ISubscriptionToken {
        const signal = this.getSignal(signalConstructor);
        signal.addListener(callback);
        
        return new SubscriptionToken(this, signalConstructor.name, callback);
    }
    
    /**
     * Unsubscribe from a signal
     * Similar to Unity's Unsubscribe<T>(callback)
     */
    public unsubscribe<T extends ISignalBase>(
        signalConstructor: new() => T, 
        callback: Function
    ): void;
    public unsubscribe(signalType: string, callback: Function): void;
    public unsubscribe(signalOrType: any, callback: Function): void {
        if (typeof signalOrType === 'string') {
            // Called from SubscriptionToken
            const signal = this._signals.get(signalOrType);
            if (signal) {
                signal.removeListener(callback);
            }
        } else {
            // Called with constructor
            const signal = this.getSignal(signalOrType);
            signal.removeListener(callback);
        }
    }
    
    /**
     * Fire a signal with no parameters
     * Similar to Unity's Fire<T>()
     */
    public fire<T extends { fire(): void }>(signalConstructor: new() => T): void;
    /**
     * Fire a signal with one parameter
     */
    public fire<T extends { fire(arg: any): void }, TArg>(
        signalConstructor: new() => T, 
        arg: TArg
    ): void;
    /**
     * Fire a signal with two parameters
     */
    public fire<T extends { fire(arg1: any, arg2: any): void }, TArg1, TArg2>(
        signalConstructor: new() => T, 
        arg1: TArg1, 
        arg2: TArg2
    ): void;
    /**
     * Fire a signal with three parameters
     */
    public fire<T extends { fire(arg1: any, arg2: any, arg3: any): void }, TArg1, TArg2, TArg3>(
        signalConstructor: new() => T, 
        arg1: TArg1, 
        arg2: TArg2, 
        arg3: TArg3
    ): void;
    /**
     * Fire a signal with four parameters
     */
    public fire<T extends { fire(arg1: any, arg2: any, arg3: any, arg4: any): void }, TArg1, TArg2, TArg3, TArg4>(
        signalConstructor: new() => T, 
        arg1: TArg1, 
        arg2: TArg2, 
        arg3: TArg3, 
        arg4: TArg4
    ): void;
    /**
     * Fire a signal with five parameters
     */
    public fire<T extends { fire(arg1: any, arg2: any, arg3: any, arg4: any, arg5: any): void }, TArg1, TArg2, TArg3, TArg4, TArg5>(
        signalConstructor: new() => T, 
        arg1: TArg1, 
        arg2: TArg2, 
        arg3: TArg3, 
        arg4: TArg4, 
        arg5: TArg5
    ): void;
    
    /**
     * Implementation for fire method
     */
    public fire(signalConstructor: any, ...args: any[]): void {
        const signal = this.getSignal(signalConstructor) as any;
        if (signal && typeof signal.fire === 'function') {
            signal.fire(...args);
        }
    }
    
    /**
     * Check if signal has listeners
     * Similar to Unity's HasSubscribers<T>()
     */
    public hasSubscribers<T extends ISignalBase>(signalConstructor: new() => T): boolean {
        const signal = this._signalInstances.get(signalConstructor);
        return signal ? signal.hasListeners : false;
    }
    
    /**
     * Remove all listeners from a specific signal
     */
    public clearSignal<T extends ISignalBase>(signalConstructor: new() => T): void {
        const signal = this._signalInstances.get(signalConstructor);
        if (signal) {
            signal.removeAllListeners();
        }
    }
    
    /**
     * Remove all listeners from all signals
     */
    public clearAllSignals(): void {
        for (const signal of this._signals.values()) {
            signal.removeAllListeners();
        }
    }
    
    /**
     * Get signal count for debugging
     */
    public getSignalCount(): number {
        return this._signals.size;
    }
    
    /**
     * Get total listeners count across all signals for debugging
     */
    public getTotalListenersCount(): number {
        let total = 0;
        for (const signal of this._signals.values()) {
            if (signal.hasListeners) {
                // We can't get exact count without exposing it in interface
                // This is a simplified version
                total++;
            }
        }
        return total;
    }
    
    /**
     * Debug method to log all registered signals
     */
    public debugSignals(): void {
        console.log('=== SignalBus Debug Info ===');
        console.log(`Total signals: ${this.getSignalCount()}`);
        console.log(`Total listeners: ${this.getTotalListenersCount()}`);
        
        for (const [signalType, signal] of this._signals.entries()) {
            console.log(`Signal: ${signalType} - Has listeners: ${signal.hasListeners}`);
        }
        console.log('===========================');
    }
    
    /**
     * Dispose the SignalBus (mainly for testing)
     */
    public dispose(): void {
        this.clearAllSignals();
        this._signals.clear();
        this._signalInstances.clear();
        SignalBus._instance = null;
    }
}
