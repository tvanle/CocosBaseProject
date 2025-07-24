/**
 * SignalBus System for Cocos Creator
 * TypeScript port from Unity C# SignalBus (Zenject/Extenject)
 * 
 * This system provides a type-safe, decoupled messaging system using signals.
 * Similar to Unity's SignalBus pattern with singleton access.
 */

// Core interfaces and base classes
export * from './ISignal';
export * from './Signal';
export * from './SignalBus';

// Game-specific signal definitions
export * from './GameSignals';

// Helper utilities
export * from './SignalHelper';

// Example usage
export * from './SignalBusExample';

// Re-export for convenience
export { SignalBus } from './SignalBus';
export { SignalHelper } from './SignalHelper';
export { 
    Signal, 
    Signal1, 
    Signal2, 
    Signal3, 
    Signal4, 
    Signal5 
} from './Signal';
