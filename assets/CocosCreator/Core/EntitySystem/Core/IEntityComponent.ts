import { Entity } from './Entity';

// Base component interface
export interface IEntityComponent {
    entity: Entity;
    enabled?: boolean;
    onAttach?(entity: Entity): void;
    onDetach?(): void;
    update?(dt: number): void;
    onEnable?(): void;
    onDisable?(): void;
}