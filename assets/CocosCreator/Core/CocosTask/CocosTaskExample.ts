import { Component, _decorator, Vec3 } from 'cc';
import {
    CocosTask,
    CancellationTokenSource,
    CocosTaskDelay,
    CocosTaskWait,
    CocosTaskAnimation,
    CocosTaskUtility
} from './index';

const { ccclass } = _decorator;

@ccclass('CocosTaskExample')
export class CocosTaskExample extends Component {
    private cancellationTokenSource = new CancellationTokenSource();

    async start() {
        try {
            await this.demonstrateBasicUsage();
            await this.demonstrateAnimations();
            await this.demonstrateUtilities();
        } catch (error) {
            if ((error as Error).message === 'OperationCanceledException') {
                console.log('Operations were cancelled');
            } else {
                console.error('Error:', error);
            }
        }
    }

    onDestroy() {
        // Cancel all operations when component is destroyed
        this.cancellationTokenSource.dispose();
    }

    private async demonstrateBasicUsage() {
        const token = this.cancellationTokenSource.token;

        console.log('=== Basic Usage Demo ===');

        // Basic delay operations
        await CocosTask.delay(1000, token);
        console.log('✓ Delayed 1 second');

        // Frame-based delays
        await CocosTaskDelay.delayFrame(30, this, token);
        console.log('✓ Waited 30 frames');

        await CocosTaskDelay.nextFrame(this, token);
        console.log('✓ Next frame reached');

        // Wait operations (example with a simple condition)
        let counter = 0;
        const incrementCounter = () => {
            counter++;
            this.scheduleOnce(incrementCounter, 0.1);
        };
        this.scheduleOnce(incrementCounter, 0.1);

        await CocosTaskWait.waitUntil(() => counter > 5, this, token);
        console.log('✓ Counter reached:', counter);

        // Multiple tasks
        await CocosTask.whenAll([
            CocosTask.delay(200, token),
            CocosTaskDelay.delayFrame(10, this, token)
        ]);
        console.log('✓ All parallel tasks completed');
    }

    private async demonstrateAnimations() {
        const token = this.cancellationTokenSource.token;

        console.log('=== Animation Demo ===');

        // Position animation
        await CocosTaskAnimation.toPosition(this.node, new Vec3(100, 0, 0), 0.5, token);
        console.log('✓ Position animation completed');

        // Scale animation
        await CocosTaskAnimation.toScale(this.node, new Vec3(1.2, 1.2, 1.2), 0.3, token);
        console.log('✓ Scale animation completed');

        // Fade out and in
        await CocosTaskAnimation.fadeOut(this.node, 0.5, token);
        console.log('✓ Fade out completed');

        await CocosTaskAnimation.fadeIn(this.node, 0.5, token);
        console.log('✓ Fade in completed');

        // Parallel animations
        await CocosTask.whenAll([
            CocosTaskAnimation.toPosition(this.node, new Vec3(0, 0, 0), 0.8, token),
            CocosTaskAnimation.toScale(this.node, new Vec3(1, 1, 1), 0.8, token)
        ]);
        console.log('✓ Parallel animations completed - back to original state');

        // Using namespace syntax (UniTask style)
        await CocosTask.ToPosition(this.node, new Vec3(50, 50, 0), 0.4, token);
        await CocosTask.FadeOut(this.node, 0.3, token);
        await CocosTask.FadeIn(this.node, 0.3, token);
        await CocosTask.ToPosition(this.node, new Vec3(0, 0, 0), 0.4, token);
        console.log('✓ Namespace syntax demo completed');
    }

    private async demonstrateUtilities() {
        const token = this.cancellationTokenSource.token;

        console.log('=== Utility Demo ===');

        // Retry operation
        try {
            await CocosTaskUtility.retry(
                () => this.simulateFailableOperation(),
                3, // max attempts
                500, // base delay
                token
            );
            console.log('✓ Retry operation succeeded');
        } catch (error) {
            console.log('✗ Retry operation failed after all attempts');
        }

        // Timeout operation
        try {
            await CocosTaskUtility.withTimeout(
                CocosTask.delay(2000, token),
                1000 // 1 second timeout
            );
        } catch (error) {
            if ((error as Error).message === 'TimeoutException') {
                console.log('✓ Operation timed out as expected');
            }
        }

        // Repeat operation
        const results = await CocosTaskUtility.repeat(
            () => this.generateRandomNumber(),
            3, // repeat 3 times
            token
        );
        console.log('✓ Repeated results:', results);

        // Sequence vs Parallel comparison
        const startTime = Date.now();
        await CocosTaskUtility.sequence([
            CocosTask.delay(200, token),
            CocosTask.delay(200, token),
            CocosTask.delay(200, token)
        ], token);
        console.log('✓ Sequential tasks took:', Date.now() - startTime, 'ms');

        const startTime2 = Date.now();
        await CocosTask.whenAll([
            CocosTask.delay(200, token),
            CocosTask.delay(200, token),
            CocosTask.delay(200, token)
        ]);
        console.log('✓ Parallel tasks took:', Date.now() - startTime2, 'ms');
    }

    private simulateFailableOperation(): CocosTask<void> {
        return CocosTask.fromPromise(new Promise<void>((resolve, reject) => {
            // 30% chance to succeed, 70% to fail
            if (Math.random() < 0.3) {
                resolve();
            } else {
                reject(new Error('Simulated failure'));
            }
        }));
    }

    private generateRandomNumber(): CocosTask<number> {
        const randomNum = Math.floor(Math.random() * 100);
        return CocosTask.fromResult(randomNum);
    }

    // Example of a complex workflow using CocosTask
    async performComplexWorkflow(): Promise<void> {
        const token = this.cancellationTokenSource.token;

        console.log('=== Complex Workflow Demo ===');

        try {
            // Step 1: Move to starting position
            await CocosTask.ToPosition(this.node, new Vec3(-100, 0, 0), 0.5, token);

            // Step 2: Wait a moment
            await CocosTask.Delay(300, token);

            // Step 3: Scale up with fade in
            await CocosTask.whenAll([
                CocosTask.ToScale(this.node, new Vec3(1.5, 1.5, 1.5), 0.4, token),
                CocosTask.FadeIn(this.node, 0.4, token)
            ]);

            // Step 4: Wait for condition or timeout
            try {
                await CocosTask.WithTimeout(
                    CocosTask.WaitUntil(() => this.someCondition(), this, token),
                    2000 // 2 second timeout
                );
                console.log('✓ Condition met!');
            } catch (error) {
                console.log('✓ Condition timed out, continuing...');
            }

            // Step 5: Return to normal state
            await CocosTask.whenAll([
                CocosTask.ToPosition(this.node, new Vec3(0, 0, 0), 0.8, token),
                CocosTask.ToScale(this.node, new Vec3(1, 1, 1), 0.8, token)
            ]);

            console.log('✓ Complex workflow completed successfully!');

        } catch (error) {
            if ((error as Error).message === 'OperationCanceledException') {
                console.log('✗ Workflow was cancelled');
            } else {
                console.error('✗ Workflow failed:', error);
            }
        }
    }

    private someCondition(): boolean {
        // Random condition that becomes true after some time
        return Math.random() < 0.1; // 10% chance each frame
    }
}