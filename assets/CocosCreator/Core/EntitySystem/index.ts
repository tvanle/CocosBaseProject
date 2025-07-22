// Core
export { EntityManager, EntityQuery, Entities } from './EntityManager';
export { Entity, ComponentManager, TagManager } from './Core';
export type { IEntityComponent, ComponentConstructor } from './Core';

// Components
export * from './Components';

// Systems
export { MovementSystem } from './Systems/MovementSystem';
export { HealthSystem } from './Systems/HealthSystem';