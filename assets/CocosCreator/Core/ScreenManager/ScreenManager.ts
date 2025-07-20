import {Constructor, instantiate, Prefab, Node} from 'cc';
import {AssetManager} from '../AssetManager/AssetManager';
import {IScreenPresenter, ScreenType} from "db://assets/CocosCreator/Core/ScreenManager/IScreenPresenter";
import {RootUI} from "db://assets/CocosCreator/Core/ScreenManager/RootUI";

export class ScreenManager {
    private static _instance: ScreenManager = new ScreenManager();

    static get instance(): ScreenManager {
        return this._instance;
    }

    private typeToLoadedScreensPresenter: Map<Constructor<IScreenPresenter>, IScreenPresenter> = new Map();
    private screenRoot: Node;
    private popupRoot: Node;
    private hiddenRoot: Node;

    init() {
        this.screenRoot = RootUI.instance.screens;
        this.popupRoot = RootUI.instance.popups;
        this.hiddenRoot = RootUI.instance.hiddens;
    }

    async openScreen<T extends IScreenPresenter>(type: Constructor<T>, force = false): Promise<T> {
        const screen = await this.getScreen(type) as T;
        await screen?.openAsync();
        return screen;
    }

    async openScreenWithModel<T extends IScreenPresenter, M extends any>(type: Constructor<T>, model: M, force = false): Promise<T> {
        const screen = await this.getScreen(type) as T;
        screen.setModel(model);
        await screen?.openAsync();
        return screen;
    }

    private async getScreen<T extends IScreenPresenter>(type: Constructor<T>): Promise<T> {
        if (this.typeToLoadedScreensPresenter.has(type)) {
            return this.typeToLoadedScreensPresenter.get(type) as T;
        }
        const presenter = new type();
        const id = presenter.viewName || type.name;
        const prefab = await AssetManager.instance.loadAsync<Prefab>(id);
        const node = instantiate(prefab);
        node.setParent(presenter.screenType === ScreenType.Popup ? this.popupRoot : this.screenRoot, false);
        presenter.setView(node.getComponent(presenter.viewName) as any);
        this.typeToLoadedScreensPresenter.set(type, presenter);
        return presenter as T;
    }
}