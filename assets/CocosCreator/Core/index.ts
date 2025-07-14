// Core exports for Cocos Creator Asset Management and Screen Management System
// Based on Unity's GameFoundation architecture

// Asset Manager
export type { IAssetManager } from './AssetManager/IAssetManager';
export { AssetManager } from './AssetManager/AssetManager';

// Screen Manager
export type { IScreenPresenter, ScreenStatus, ScreenInfo } from './ScreenManager/IScreenPresenter';
export type { IScreenManager } from './ScreenManager/IScreenManager';
export { ScreenManager } from './ScreenManager/ScreenManager';
export { BaseScreenPresenter } from './ScreenManager/BaseScreenPresenter';
export { ScreenPresenterFactory, ScreenRegistry, RegisterScreen } from './ScreenManager/ScreenPresenterFactory';