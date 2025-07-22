import { ScreenManager } from './ScreenManager';
import { ScreenPresenter } from './ScreenPresenter';

type ScreenConstructor<T extends ScreenPresenter> = new () => T;

interface ScreenOptions {
    path?: string;
    isPopup?: boolean;
}

/**
 * Decorator for screen registration
 */
export function Screen(options?: ScreenOptions) {
    return function <T extends ScreenPresenter>(constructor: ScreenConstructor<T>) {
        // Auto-register on decorator application
        setTimeout(() => {
            ScreenManager.instance.registerScreen(
                constructor,
                options?.path,
                options?.isPopup || false
            );
        }, 0);

        return constructor;
    };
}

/**
 * Decorator for popup screens
 */
export function Popup(path?: string) {
    return Screen({ path, isPopup: true });
}