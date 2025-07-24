import { _decorator } from 'cc';
import { Signal, Signal1, Signal2, Signal3 } from './Signal';

const { ccclass } = _decorator;

/**
 * Game signals definitions
 * Similar to Unity signal declarations
 */

// Simple signals without parameters
@ccclass('GameStartedSignal')
export class GameStartedSignal extends Signal {}

@ccclass('GamePausedSignal') 
export class GamePausedSignal extends Signal {}

@ccclass('GameOverSignal')
export class GameOverSignal extends Signal {}

@ccclass('LevelCompletedSignal')
export class LevelCompletedSignal extends Signal {}

@ccclass('LevelFailedSignal')
export class LevelFailedSignal extends Signal {}

// Signals with one parameter
@ccclass('ScoreChangedSignal')
export class ScoreChangedSignal extends Signal1<number> {}

@ccclass('HealthChangedSignal')
export class HealthChangedSignal extends Signal1<number> {}

@ccclass('AudioPlaySignal')
export class AudioPlaySignal extends Signal1<string> {}

@ccclass('LevelLoadedSignal')
export class LevelLoadedSignal extends Signal1<number> {}

@ccclass('PlayerMoveSignal')
export class PlayerMoveSignal extends Signal1<{ x: number, y: number }> {}

// Signals with two parameters
@ccclass('DamageDealtSignal')
export class DamageDealtSignal extends Signal2<number, string> {} // damage, source

@ccclass('ItemCollectedSignal')
export class ItemCollectedSignal extends Signal2<string, number> {} // itemType, amount

@ccclass('UIButtonClickedSignal')
export class UIButtonClickedSignal extends Signal2<string, any> {} // buttonId, data

@ccclass('GridCellSelectedSignal')
export class GridCellSelectedSignal extends Signal2<number, number> {} // x, y

// Signals with three parameters
@ccclass('ShapeCompletedSignal')
export class ShapeCompletedSignal extends Signal3<number, number, boolean> {} // shapeId, score, isPerfect

@ccclass('TutorialStepSignal')
export class TutorialStepSignal extends Signal3<number, string, any> {} // stepIndex, instruction, data

// Player-related signals
@ccclass('PlayerSpawnedSignal')
export class PlayerSpawnedSignal extends Signal1<{ x: number, y: number, playerId: string }> {}

@ccclass('PlayerDefeatedSignal')
export class PlayerDefeatedSignal extends Signal1<string> {} // playerId

// UI-related signals
@ccclass('PopupOpenedSignal')
export class PopupOpenedSignal extends Signal1<string> {} // popupId

@ccclass('PopupClosedSignal')
export class PopupClosedSignal extends Signal1<string> {} // popupId

@ccclass('SettingsChangedSignal')
export class SettingsChangedSignal extends Signal2<string, any> {} // setting key, value

// Game mechanics signals
@ccclass('PowerUpActivatedSignal')
export class PowerUpActivatedSignal extends Signal2<string, number> {} // powerUpType, duration

@ccclass('ComboAchievedSignal')
export class ComboAchievedSignal extends Signal1<number> {} // comboCount

@ccclass('AchievementUnlockedSignal')
export class AchievementUnlockedSignal extends Signal1<string> {} // achievementId

// Store/Monetization signals
@ccclass('RedirectToStoreSignal')
export class RedirectToStoreSignal extends Signal {}

@ccclass('PurchaseCompletedSignal')
export class PurchaseCompletedSignal extends Signal2<string, boolean> {} // productId, success

@ccclass('AdWatchedSignal')
export class AdWatchedSignal extends Signal2<string, boolean> {} // adType, completed
