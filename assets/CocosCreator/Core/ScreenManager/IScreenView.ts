import * as cc from 'cc';

export interface IScreenView {
    rectTransform: cc.Node;
    isReadyToUse: boolean;

    open(): Promise<void>;
    close(): Promise<void>;
    hide(): void;
    show(): void;
    destroySelf(): void;

    viewDidClose: (() => void) | null;
    viewDidOpen: (() => void) | null;
    viewDidDestroy: (() => void) | null;
}