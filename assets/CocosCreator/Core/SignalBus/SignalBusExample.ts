import { _decorator, Component } from 'cc';
import { SignalBus, ISubscriptionToken } from './SignalBus';
import { SignalHelper } from './SignalHelper';
import { 
    GameStartedSignal, 
    LevelCompletedSignal, 
    ScoreChangedSignal, 
    PlayerMoveSignal,
    ShapeCompletedSignal,
    RedirectToStoreSignal
} from './GameSignals';

const { ccclass } = _decorator;

/**
 * Example component showing how to use SignalBus system
 * Similar to Unity MonoBehaviour that uses SignalBus
 */
@ccclass('SignalBusExample')
export class SignalBusExample extends Component {
    
    // Store subscription tokens for cleanup
    private subscriptions: ISubscriptionToken[] = [];
    
    protected onLoad(): void {
        // Initialize signals (usually done in main game manager)
        SignalHelper.initializeSignals();
        
        // Set up subscriptions
        this.setupSignalSubscriptions();
        
        console.log('SignalBusExample: Component loaded and signals setup');
    }
    
    protected onDestroy(): void {
        // Clean up subscriptions
        this.cleanupSignalSubscriptions();
        
        console.log('SignalBusExample: Component destroyed and signals cleaned up');
    }
    
    /**
     * Set up signal subscriptions
     */
    private setupSignalSubscriptions(): void {
        const signalBus = SignalBus.instance;
        
        // Method 1: Direct SignalBus usage
        this.subscriptions.push(
            signalBus.subscribe(GameStartedSignal, this.onGameStarted.bind(this))
        );
        
        this.subscriptions.push(
            signalBus.subscribe(LevelCompletedSignal, this.onLevelCompleted.bind(this))
        );
        
        this.subscriptions.push(
            signalBus.subscribe(ScoreChangedSignal, this.onScoreChanged.bind(this))
        );
        
        this.subscriptions.push(
            signalBus.subscribe(PlayerMoveSignal, this.onPlayerMove.bind(this))
        );
        
        this.subscriptions.push(
            signalBus.subscribe(ShapeCompletedSignal, this.onShapeCompleted.bind(this))
        );
        
        // Method 2: Using SignalHelper convenience methods
        this.subscriptions.push(
            SignalHelper.onRedirectToStore(this.onRedirectToStore.bind(this))
        );
    }
    
    /**
     * Clean up signal subscriptions
     */
    private cleanupSignalSubscriptions(): void {
        // Unsubscribe all
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
        this.subscriptions = [];
    }
    
    // Signal handlers
    
    private onGameStarted(): void {
        console.log('SignalBusExample: Game started!');
    }
    
    private onLevelCompleted(): void {
        console.log('SignalBusExample: Level completed!');
    }
    
    private onScoreChanged(newScore: number): void {
        console.log(`SignalBusExample: Score changed to ${newScore}`);
    }
    
    private onPlayerMove(position: { x: number, y: number }): void {
        console.log(`SignalBusExample: Player moved to (${position.x}, ${position.y})`);
    }
    
    private onShapeCompleted(shapeId: number, score: number, isPerfect: boolean): void {
        console.log(`SignalBusExample: Shape ${shapeId} completed with score ${score}, perfect: ${isPerfect}`);
    }
    
    private onRedirectToStore(): void {
        console.log('SignalBusExample: Redirecting to store!');
    }
    
    // Example methods that fire signals
    
    /**
     * Example: Start a new game
     */
    public startGame(): void {
        // Method 1: Using SignalHelper
        SignalHelper.fireGameStarted();
        
        // Method 2: Direct SignalBus usage
        // SignalBus.instance.fire(GameStartedSignal);
    }
    
    /**
     * Example: Update player score
     */
    public updateScore(newScore: number): void {
        SignalHelper.fireScoreChanged(newScore);
    }
    
    /**
     * Example: Player moves
     */
    public movePlayer(x: number, y: number): void {
        SignalHelper.firePlayerMove({ x, y });
    }
    
    /**
     * Example: Complete a shape
     */
    public completeShape(shapeId: number, score: number, isPerfect: boolean = false): void {
        SignalHelper.fireShapeCompleted(shapeId, score, isPerfect);
    }
    
    /**
     * Example: Complete level
     */
    public completeLevel(): void {
        SignalHelper.fireLevelCompleted();
    }
    
    /**
     * Example: Redirect to store
     */
    public redirectToStore(): void {
        SignalHelper.fireRedirectToStore();
    }
    
    /**
     * Debug method to test signals
     */
    public testSignals(): void {
        console.log('Testing SignalBus system...');
        
        // Fire various signals to test
        this.startGame();
        this.updateScore(100);
        this.movePlayer(5, 3);
        this.completeShape(1, 50, true);
        this.completeLevel();
        
        // Debug signal bus state
        SignalHelper.debugSignals();
    }
}

/**
 * Usage examples for different scenarios:
 * 
 * 1. In Game Manager (initialize):
 *    SignalHelper.initializeSignals();
 * 
 * 2. In UI Components (subscribe to score changes):
 *    this.scoreSubscription = SignalHelper.onScoreChanged((score) => {
 *        this.updateScoreDisplay(score);
 *    });
 * 
 * 3. In Game Logic (fire events):
 *    SignalHelper.fireScoreChanged(newScore);
 *    SignalHelper.fireLevelCompleted();
 * 
 * 4. In Component cleanup:
 *    this.scoreSubscription.unsubscribe();
 * 
 * 5. Direct SignalBus usage (more flexibility):
 *    const signalBus = SignalBus.instance;
 *    signalBus.subscribe(CustomSignal, callback);
 *    signalBus.fire(CustomSignal, data);
 * 
 * 6. Creating custom signals:
 *    @ccclass('MyCustomSignal')
 *    export class MyCustomSignal extends Signal1<MyDataType> {}
 *    
 *    // Then use it:
 *    signalBus.fire(MyCustomSignal, myData);
 */
