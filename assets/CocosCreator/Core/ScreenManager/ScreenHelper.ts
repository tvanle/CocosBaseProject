// File: ScreenHelper.ts
import { director } from 'cc';
import {IScreenView} from "db://assets/CocosCreator/Core/ScreenManager/IScreenView";
export namespace ScreenHelper {

    // Function to get screen ID based on the current scene and view type
    export function getScreenId<T extends IScreenView>(viewType: { new(): T }): string {
        const sceneName = director.getScene()?.name || 'UnknownScene';
        const viewName = viewType.name;
        return `${sceneName}/${viewName}`;
    }
}