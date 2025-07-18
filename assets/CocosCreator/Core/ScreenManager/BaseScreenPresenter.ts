import {IScreenPresenter, ScreenStatus, ScreenType} from './IScreenPresenter';
import { IScreenView } from "db://assets/CocosCreator/Core/ScreenManager/IScreenView";
import { director,Node } from 'cc';
import {ScreenHelper} from "db://assets/CocosCreator/Core/ScreenManager/ScreenHelper";

// Generic presenter cho View và Model
export abstract class BaseScreenPresenter<TView extends IScreenView, TModel = any> implements IScreenPresenter{
    public view: TView | null = null;
    public screenId = '';
    public screenType = ScreenType.Screen;
    public status = ScreenStatus.None;
    public model: TModel | null = null;

    async setView(view: IScreenView)
    {
        this.view = view as TView;
        this.screenId = ScreenHelper.getScreenId(view.constructor as { new(): TView });
        //Todo: await this.view.isReady
        this.onViewReady();
    }

    setViewParent(parent: Node) {
        this.view.uiTransform.node.parent = parent;
    }

    getViewParent(): Node | null {
        return this.view.uiTransform.node.parent;
    }

    protected onViewReady() {}
    protected async bindData() {
    }

    async openAsync() {
        if (this.status === ScreenStatus.Opened) return;
        await this.bindData();
        this.status = ScreenStatus.Opened;
        await this.view.open();
        this.onOpened();
    }

    async closeAsync() {
        if (this.status === ScreenStatus.Closed) return;
        this.status = ScreenStatus.Closed;
        await this.view.close();
        this.onClosed();
    }

    onOpened() {}
    onClosed() {}
    dispose() {}
}