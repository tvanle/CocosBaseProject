// File: ScreenHelper.ts
import { director } from 'cc';
import {ScreenView} from "db://assets/CocosCreator/Core/ScreenManager/ScreenView";
export namespace ScreenHelper {

    // Function to get screen ID based on the current scene and view type
    export function getScreenId<T extends ScreenView>(viewType: { new(): T }): string {
        const sceneName = director.getScene()?.name || 'UnknownScene';
        const viewName = viewType.name;
        return `${sceneName}/${viewName}`;
    }
}