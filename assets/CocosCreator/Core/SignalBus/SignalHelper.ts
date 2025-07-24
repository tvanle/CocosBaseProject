import { _decorator } from 'cc';
import { SignalBus, ISubscriptionToken } from './SignalBus';
import * as GameSignals from './GameSignals';

const { ccclass } = _decorator;

/**
 * SignalHelper - Convenience class for easier SignalBus usage
 * Similar to EventHelper but for SignalBus system
 */
@ccclass('SignalHelper')
export class SignalHelper {
    
    /**
     * Initialize commonly used signals
     * Call this at application start
     */
    public static initializeSignals(): void {
        const signalBus = SignalBus.instance;
        
        // Declare all game signals
        signalBus.declareSignal(GameSignals.GameStartedSignal);
        signalBus.declareSignal(GameSignals.GamePausedSignal);
        signalBus.declareSignal(GameSignals.GameOverSignal);
        signalBus.declareSignal(GameSignals.LevelCompletedSignal);
        signalBus.declareSignal(GameSignals.LevelFailedSignal);
        
        signalBus.declareSignal(GameSignals.ScoreChangedSignal);
        signalBus.declareSignal(GameSignals.HealthChangedSignal);
        signalBus.declareSignal(GameSignals.AudioPlaySignal);
        signalBus.declareSignal(GameSignals.LevelLoadedSignal);
        signalBus.declareSignal(GameSignals.PlayerMoveSignal);
        
        signalBus.declareSignal(GameSignals.DamageDealtSignal);
        signalBus.declareSignal(GameSignals.ItemCollectedSignal);
        signalBus.declareSignal(GameSignals.UIButtonClickedSignal);
        signalBus.declareSignal(GameSignals.GridCellSelectedSignal);
        
        signalBus.declareSignal(GameSignals.ShapeCompletedSignal);
        signalBus.declareSignal(GameSignals.TutorialStepSignal);
        
        signalBus.declareSignal(GameSignals.PlayerSpawnedSignal);
        signalBus.declareSignal(GameSignals.PlayerDefeatedSignal);
        
        signalBus.declareSignal(GameSignals.PopupOpenedSignal);
        signalBus.declareSignal(GameSignals.PopupClosedSignal);
        signalBus.declareSignal(GameSignals.SettingsChangedSignal);
        
        signalBus.declareSignal(GameSignals.PowerUpActivatedSignal);
        signalBus.declareSignal(GameSignals.ComboAchievedSignal);
        signalBus.declareSignal(GameSignals.AchievementUnlockedSignal);
        
        signalBus.declareSignal(GameSignals.RedirectToStoreSignal);
        signalBus.declareSignal(GameSignals.PurchaseCompletedSignal);
        signalBus.declareSignal(GameSignals.AdWatchedSignal);
        
        console.log('SignalBus: All game signals initialized');
    }
    
    // Convenience methods for common game events
    
    /**
     * Fire game started signal
     */
    public static fireGameStarted(): void {
        SignalBus.instance.fire(GameSignals.GameStartedSignal);
    }
    
    /**
     * Fire game paused signal
     */
    public static fireGamePaused(): void {
        SignalBus.instance.fire(GameSignals.GamePausedSignal);
    }
    
    /**
     * Fire game over signal
     */
    public static fireGameOver(): void {
        SignalBus.instance.fire(GameSignals.GameOverSignal);
    }
    
    /**
     * Fire level completed signal
     */
    public static fireLevelCompleted(): void {
        SignalBus.instance.fire(GameSignals.LevelCompletedSignal);
    }
    
    /**
     * Fire level failed signal
     */
    public static fireLevelFailed(): void {
        SignalBus.instance.fire(GameSignals.LevelFailedSignal);
    }
    
    /**
     * Fire score changed signal
     */
    public static fireScoreChanged(newScore: number): void {
        SignalBus.instance.fire(GameSignals.ScoreChangedSignal, newScore);
    }
    
    /**
     * Fire health changed signal
     */
    public static fireHealthChanged(newHealth: number): void {
        SignalBus.instance.fire(GameSignals.HealthChangedSignal, newHealth);
    }
    
    /**
     * Fire audio play signal
     */
    public static fireAudioPlay(audioName: string): void {
        SignalBus.instance.fire(GameSignals.AudioPlaySignal, audioName);
    }
    
    /**
     * Fire level loaded signal
     */
    public static fireLevelLoaded(levelIndex: number): void {
        SignalBus.instance.fire(GameSignals.LevelLoadedSignal, levelIndex);
    }
    
    /**
     * Fire player move signal
     */
    public static firePlayerMove(position: { x: number, y: number }): void {
        SignalBus.instance.fire(GameSignals.PlayerMoveSignal, position);
    }
    
    /**
     * Fire damage dealt signal
     */
    public static fireDamageDealt(damage: number, source: string): void {
        SignalBus.instance.fire(GameSignals.DamageDealtSignal, damage, source);
    }
    
    /**
     * Fire item collected signal
     */
    public static fireItemCollected(itemType: string, amount: number): void {
        SignalBus.instance.fire(GameSignals.ItemCollectedSignal, itemType, amount);
    }
    
    /**
     * Fire UI button clicked signal
     */
    public static fireUIButtonClicked(buttonId: string, data?: any): void {
        SignalBus.instance.fire(GameSignals.UIButtonClickedSignal, buttonId, data);
    }
    
    /**
     * Fire grid cell selected signal
     */
    public static fireGridCellSelected(x: number, y: number): void {
        SignalBus.instance.fire(GameSignals.GridCellSelectedSignal, x, y);
    }
    
    /**
     * Fire shape completed signal
     */
    public static fireShapeCompleted(shapeId: number, score: number, isPerfect: boolean): void {
        SignalBus.instance.fire(GameSignals.ShapeCompletedSignal, shapeId, score, isPerfect);
    }
    
    /**
     * Fire tutorial step signal
     */
    public static fireTutorialStep(stepIndex: number, instruction: string, data?: any): void {
        SignalBus.instance.fire(GameSignals.TutorialStepSignal, stepIndex, instruction, data);
    }
    
    /**
     * Fire player spawned signal
     */
    public static firePlayerSpawned(playerData: { x: number, y: number, playerId: string }): void {
        SignalBus.instance.fire(GameSignals.PlayerSpawnedSignal, playerData);
    }
    
    /**
     * Fire player defeated signal
     */
    public static firePlayerDefeated(playerId: string): void {
        SignalBus.instance.fire(GameSignals.PlayerDefeatedSignal, playerId);
    }
    
    /**
     * Fire popup opened signal
     */
    public static firePopupOpened(popupId: string): void {
        SignalBus.instance.fire(GameSignals.PopupOpenedSignal, popupId);
    }
    
    /**
     * Fire popup closed signal
     */
    public static firePopupClosed(popupId: string): void {
        SignalBus.instance.fire(GameSignals.PopupClosedSignal, popupId);
    }
    
    /**
     * Fire settings changed signal
     */
    public static fireSettingsChanged(key: string, value: any): void {
        SignalBus.instance.fire(GameSignals.SettingsChangedSignal, key, value);
    }
    
    /**
     * Fire power up activated signal
     */
    public static firePowerUpActivated(powerUpType: string, duration: number): void {
        SignalBus.instance.fire(GameSignals.PowerUpActivatedSignal, powerUpType, duration);
    }
    
    /**
     * Fire combo achieved signal
     */
    public static fireComboAchieved(comboCount: number): void {
        SignalBus.instance.fire(GameSignals.ComboAchievedSignal, comboCount);
    }
    
    /**
     * Fire achievement unlocked signal
     */
    public static fireAchievementUnlocked(achievementId: string): void {
        SignalBus.instance.fire(GameSignals.AchievementUnlockedSignal, achievementId);
    }
    
    /**
     * Fire redirect to store signal
     */
    public static fireRedirectToStore(): void {
        SignalBus.instance.fire(GameSignals.RedirectToStoreSignal);
    }
    
    /**
     * Fire purchase completed signal
     */
    public static firePurchaseCompleted(productId: string, success: boolean): void {
        SignalBus.instance.fire(GameSignals.PurchaseCompletedSignal, productId, success);
    }
    
    /**
     * Fire ad watched signal
     */
    public static fireAdWatched(adType: string, completed: boolean): void {
        SignalBus.instance.fire(GameSignals.AdWatchedSignal, adType, completed);
    }
    
    // Subscription helpers
    
    /**
     * Subscribe to game started signal
     */
    public static onGameStarted(callback: () => void): ISubscriptionToken {
        return SignalBus.instance.subscribe(GameSignals.GameStartedSignal, callback);
    }
    
    /**
     * Subscribe to game paused signal
     */
    public static onGamePaused(callback: () => void): ISubscriptionToken {
        return SignalBus.instance.subscribe(GameSignals.GamePausedSignal, callback);
    }
    
    /**
     * Subscribe to game over signal
     */
    public static onGameOver(callback: () => void): ISubscriptionToken {
        return SignalBus.instance.subscribe(GameSignals.GameOverSignal, callback);
    }
    
    /**
     * Subscribe to level completed signal
     */
    public static onLevelCompleted(callback: () => void): ISubscriptionToken {
        return SignalBus.instance.subscribe(GameSignals.LevelCompletedSignal, callback);
    }
    
    /**
     * Subscribe to level failed signal
     */
    public static onLevelFailed(callback: () => void): ISubscriptionToken {
        return SignalBus.instance.subscribe(GameSignals.LevelFailedSignal, callback);
    }
    
    /**
     * Subscribe to score changed signal
     */
    public static onScoreChanged(callback: (newScore: number) => void): ISubscriptionToken {
        return SignalBus.instance.subscribe(GameSignals.ScoreChangedSignal, callback);
    }
    
    /**
     * Subscribe to health changed signal
     */
    public static onHealthChanged(callback: (newHealth: number) => void): ISubscriptionToken {
        return SignalBus.instance.subscribe(GameSignals.HealthChangedSignal, callback);
    }
    
    /**
     * Subscribe to audio play signal
     */
    public static onAudioPlay(callback: (audioName: string) => void): ISubscriptionToken {
        return SignalBus.instance.subscribe(GameSignals.AudioPlaySignal, callback);
    }
    
    /**
     * Subscribe to redirect to store signal
     */
    public static onRedirectToStore(callback: () => void): ISubscriptionToken {
        return SignalBus.instance.subscribe(GameSignals.RedirectToStoreSignal, callback);
    }
    
    // Debug utilities
    
    /**
     * Debug all signals
     */
    public static debugSignals(): void {
        SignalBus.instance.debugSignals();
    }
    
    /**
     * Clear all signals (useful for cleanup)
     */
    public static clearAllSignals(): void {
        SignalBus.instance.clearAllSignals();
    }
}
