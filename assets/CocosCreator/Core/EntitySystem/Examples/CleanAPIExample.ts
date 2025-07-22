import { _decorator, Component, Node, Vec3 } from 'cc';
import { Entities, Entity } from '../EntityManager';
import { Transform, Health, Movement } from '../Components';

const { ccclass } = _decorator;

/**
 * Example showcasing the clean Entity API
 */
@ccclass('CleanAPIExample')
export class CleanAPIExample extends Component {
    
    async start() {
        // Create entity with clean fluent API
        const player = await Entities.create();
        
        // Chain everything nicely
        player
            .with(Transform)
            .with(Health, { 
                maxHealth: 100,
                onDeath: () => console.log('Player died!')
            })
            .with(Movement, { speed: 10 })
            .tag('player')
            .tag('hero')
            .tag('friendly');
        
        // Access components with short methods
        const transform = player.get(Transform);
        transform?.setPosition(0, 0, 0);
        
        // Check components/tags
        if (player.has(Health) && player.hasTag('player')) {
            console.log('Player is ready!');
        }
        
        // Advanced tag operations
        player.tags.toggle('invincible'); // Add if not exists, remove if exists
        player.tags.addMultiple('warrior', 'knight', 'level_1');
        player.tags.removeMultiple('level_1'); // Changed mind
        
        // Advanced component operations
        player.components.setEnabled(Movement, false); // Disable movement
        const allComponents = player.components.getNames(); // Get all component names
        console.log('Player components:', allComponents);
        
        // Clone entity
        const clone = await player.clone(this.node);
        clone
            .tag('clone')
            .untag('player')
            .with(Transform) // Will reuse existing
            .get(Transform)?.setPosition(10, 0, 0);
        
        // Query examples with clean API
        this.demonstrateQueries();
        
        // Debug info
        console.log(player.getDebugInfo());
        console.log(clone.getDebugInfo());
    }
    
    demonstrateQueries(): void {
        // Find all entities with health
        const livingEntities = Entities.withComponent(Health);
        
        // Find enemies that are alive
        const aliveEnemies = Entities.query()
            .withComponents(Health, Transform)
            .withTags('enemy')
            .withoutTags('dead')
            .execute();
        
        // Process with forEach
        Entities.query()
            .withComponents(Health)
            .withTags('friendly')
            .forEach(entity => {
                const health = entity.get(Health);
                health?.heal(10); // Heal all friendlies
            });
        
        // Get first player
        const player = Entities.query()
            .withTags('player')
            .first();
        
        // Count enemies
        const enemyCount = Entities.query()
            .withTags('enemy')
            .withoutTags('dead')
            .count();
        
        console.log(`Found ${enemyCount} alive enemies`);
    }
    
    // Example: Clean entity builder pattern
    async createEnemy(type: 'grunt' | 'elite' | 'boss'): Promise<Entity> {
        const enemy = await Entities.create('enemy', this.node);
        
        // Base setup
        enemy
            .with(Transform)
            .with(Movement)
            .tag('enemy')
            .tag('hostile');
        
        // Type-specific setup
        switch (type) {
            case 'grunt':
                enemy
                    .with(Health, { maxHealth: 50 })
                    .get(Movement)!.speed = 3;
                enemy.tag('grunt');
                break;
                
            case 'elite':
                enemy
                    .with(Health, { maxHealth: 100 })
                    .get(Movement)!.speed = 5;
                enemy.tag('elite');
                break;
                
            case 'boss':
                enemy
                    .with(Health, { maxHealth: 500 })
                    .get(Movement)!.speed = 2;
                enemy.tag('boss').tag('dangerous');
                break;
        }
        
        return enemy;
    }
    
    // Example: Entity utilities
    demonstrateUtilities(entity: Entity): void {
        // Enable/disable
        entity.disable(); // Disables entity and node
        entity.enable();  // Re-enables
        
        // Component utilities
        const componentNames = entity.components.getNames();
        const hasAllCombat = componentNames.indexOf('Weapon') !== -1 && 
                           componentNames.indexOf('Armor') !== -1;
        
        // Tag utilities
        const tagCount = entity.tags.count;
        const isElite = entity.tags.hasAll('enemy', 'elite');
        const isAnyEnemy = entity.tags.hasAny('grunt', 'elite', 'boss');
        
        // Debug
        console.log(entity.getDebugInfo());
        console.log(`Entity has ${tagCount} tags`);
    }
}