import * as cc from 'cc';

export interface IScreenView {
    uiTransform: cc.UITransform;
    isReady: boolean;

    open(): Promise<void>;
    close(): Promise<void>;
    hide(): void;
    show(): void;
    destroySelf(): void;

    viewDidClose: (() => void) | null;
    viewDidOpen: (() => void) | null;
    viewDidDestroy: (() => void) | null;
}