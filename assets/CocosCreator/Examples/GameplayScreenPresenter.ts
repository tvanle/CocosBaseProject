import { BaseScreenPresenter } from '../Core/ScreenManager/BaseScreenPresenter';
import { ScreenManager } from '../Core/ScreenManager/ScreenManager';
import { AssetManager } from '../Core/AssetManager/AssetManager';

/**
 * Gameplay Screen Presenter Example
 * Ví dụ về màn hình gameplay chính
 */
export class GameplayScreenPresenter extends BaseScreenPresenter {
    // UI References
    private pauseButton: any = null;
    private homeButton: any = null;
    private scoreLabel: any = null;
    private timeLabel: any = null;
    private progressBar: any = null;
    private hintButton: any = null;
    
    // Game state
    private currentScore: number = 0;
    private gameTime: number = 0;
    private isPaused: boolean = false;
    private gameTimer: any = null;

    // Screen configuration
    public screenId = 'GameplayScreen';
    public isClosePrevious = true;

    protected async onInitialize(): Promise<void> {
        await this.setupUIComponents();
        await this.bindEvents();
        await this.preloadGameAssets();
    }

    protected async onBindData(data?: any): Promise<void> {
        // Initialize game data from level data
        const levelData = data?.levelData || { levelId: 1, timeLimit: 300 };
        this.gameTime = levelData.timeLimit;
        this.currentScore = 0;
        
        await this.updateGameUI();
    }

    protected async onViewOpened(): Promise<void> {
        console.log('Gameplay Screen opened');
        await this.startGame();
    }

    protected async onViewClosed(): Promise<void> {
        this.pauseGame();
        this.cleanup();
        console.log('Gameplay Screen closed');
    }

    private async setupUIComponents(): Promise<void> {
        if (!this.view) return;

        // UI Layout: Header (score, time) / Game Area / Bottom (buttons)
        const header = this.view.getChildByName('Header');
        const bottomPanel = this.view.getChildByName('BottomPanel');

        if (header) {
            this.scoreLabel = header.getChildByName('ScoreLabel')?.getComponent('Label');
            this.timeLabel = header.getChildByName('TimeLabel')?.getComponent('Label');
            this.progressBar = header.getChildByName('ProgressBar')?.getComponent('ProgressBar');
        }

        if (bottomPanel) {
            this.pauseButton = bottomPanel.getChildByName('PauseButton')?.getComponent('Button');
            this.homeButton = bottomPanel.getChildByName('HomeButton')?.getComponent('Button');
            this.hintButton = bottomPanel.getChildByName('HintButton')?.getComponent('Button');
        }
    }

    private async bindEvents(): Promise<void> {
        // Pause button
        if (this.pauseButton) {
            this.pauseButton.node.on('click', this.onPauseClicked, this);
        }

        // Home button
        if (this.homeButton) {
            this.homeButton.node.on('click', this.onHomeClicked, this);
        }

        // Hint button
        if (this.hintButton) {
            this.hintButton.node.on('click', this.onHintClicked, this);
        }

        // Game events
        this.bindGameplayEvents();
    }

    private bindGameplayEvents(): void {
        // Listen to game events (tương tự MessagePipe trong Unity)
        // Example: EventManager.on('LEVEL_COMPLETED', this.onLevelCompleted, this);
        // Example: EventManager.on('GAME_OVER', this.onGameOver, this);
    }

    private async preloadGameAssets(): Promise<void> {
        const assetManager = AssetManager.instance;
        
        // Preload essential gameplay assets
        const gameplayAssets = [
            'ui_pause_popup',
            'ui_level_complete',
            'ui_game_over',
            'icon_hint',
            'fx_explosion'
        ];

        try {
            await assetManager.preloadAsync(gameplayAssets);
            console.log('Gameplay assets preloaded successfully');
        } catch (error) {
            console.error('Failed to preload gameplay assets:', error);
        }
    }

    private async startGame(): Promise<void> {
        this.isPaused = false;
        
        // Start game timer
        this.gameTimer = setInterval(() => {
            if (!this.isPaused) {
                this.gameTime--;
                this.updateTimeDisplay();
                
                if (this.gameTime <= 0) {
                    this.onTimeUp();
                }
            }
        }, 1000);

        // Initialize game logic
        // Example: GameplayManager.instance.startLevel(this.levelData);
    }

    private pauseGame(): void {
        this.isPaused = true;
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
    }

    private async updateGameUI(): Promise<void> {
        this.updateScoreDisplay();
        this.updateTimeDisplay();
        this.updateProgressDisplay();
    }

    private updateScoreDisplay(): void {
        if (this.scoreLabel) {
            this.scoreLabel.string = `Score: ${this.currentScore}`;
        }
    }

    private updateTimeDisplay(): void {
        if (this.timeLabel) {
            const minutes = Math.floor(this.gameTime / 60);
            const seconds = this.gameTime % 60;
            this.timeLabel.string = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    private updateProgressDisplay(): void {
        if (this.progressBar) {
            // Calculate progress based on game state
            const progress = Math.min(this.currentScore / 1000, 1.0); // Example
            this.progressBar.progress = progress;
        }
    }

    // Event Handlers
    private async onPauseClicked(): Promise<void> {
        this.pauseGame();
        
        // Open pause popup as overlay
        await ScreenManager.instance.openScreen('PausePopup', {
            onResume: () => this.resumeGame(),
            onHome: () => this.goToHome()
        });
    }

    private async onHomeClicked(): Promise<void> {
        // Confirm dialog trước khi về home
        await ScreenManager.instance.openScreen('ConfirmPopup', {
            title: 'Confirm',
            message: 'Are you sure you want to go home? Progress will be lost.',
            onConfirm: () => this.goToHome(),
            onCancel: () => { /* Do nothing */ }
        });
    }

    private async onHintClicked(): Promise<void> {
        // Use hint logic
        console.log('Hint requested');
        
        // Show hint effect or open hint popup
        // Example: GameplayManager.instance.useHint();
    }

    private resumeGame(): void {
        this.isPaused = false;
        // Restart timer if needed
        if (!this.gameTimer) {
            this.startGame();
        }
    }

    private async goToHome(): Promise<void> {
        this.pauseGame();
        await ScreenManager.instance.openScreen('HomeScreen');
    }

    private async onLevelCompleted(): Promise<void> {
        this.pauseGame();
        
        // Calculate final score and rewards
        const completionData = {
            score: this.currentScore,
            timeBonus: Math.max(0, this.gameTime * 10),
            stars: this.calculateStars()
        };

        await ScreenManager.instance.openScreen('LevelCompletePopup', completionData);
    }

    private async onGameOver(): Promise<void> {
        this.pauseGame();
        
        const gameOverData = {
            score: this.currentScore,
            bestScore: this.getBestScore()
        };

        await ScreenManager.instance.openScreen('GameOverPopup', gameOverData);
    }

    private async onTimeUp(): Promise<void> {
        console.log('Time up!');
        await this.onGameOver();
    }

    private calculateStars(): number {
        // Simple star calculation based on score
        if (this.currentScore >= 1000) return 3;
        if (this.currentScore >= 500) return 2;
        return 1;
    }

    private getBestScore(): number {
        // Get best score from persistent data
        // Example: return GameData.instance.getBestScore(this.levelId);
        return 0;
    }

    private cleanup(): void {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }

        // Cleanup game objects, remove event listeners
        // Example: GameplayManager.instance.cleanup();
    }

    // Public methods for external control
    public addScore(points: number): void {
        this.currentScore += points;
        this.updateScoreDisplay();
        this.updateProgressDisplay();
    }

    public getCurrentScore(): number {
        return this.currentScore;
    }

    public getRemainingTime(): number {
        return this.gameTime;
    }

    protected onDispose(): void {
        this.cleanup();
        
        // Remove event listeners
        if (this.pauseButton) {
            this.pauseButton.node.off('click', this.onPauseClicked, this);
        }
        if (this.homeButton) {
            this.homeButton.node.off('click', this.onHomeClicked, this);
        }
        if (this.hintButton) {
            this.hintButton.node.off('click', this.onHintClicked, this);
        }
    }
}
