# CocosBaseProject

A base project for Cocos Creator 3.8.6 with a set of reusable TypeScript core systems.

## Features

Core modules live under `assets/CocosCreator/Core/`:

- **AssetManager** - asset loading helper.
- **CocosTask** - UniTask-style async/await helpers: delay, wait, animation, retry/timeout and cancellation tokens.
- **EntitySystem** - entity-component system with tag and component managers, health and movement systems.
- **ObjectPool** - `ObjectPoolManager` for reusing nodes and objects.
- **ScreenManager** - screen and popup management with decorators and an MVP-style presenter/view split.
- **SignalBus** - type-safe, decoupled messaging.

Most modules ship their own README (written in Vietnamese) with usage examples.

## Tech stack

- Cocos Creator 3.8.6
- TypeScript

## Getting started

1. Clone the repository.
2. Open the project folder in Cocos Creator 3.8.6 through Cocos Dashboard.
3. Open `assets/Scene/scene.scene` and run the preview.
