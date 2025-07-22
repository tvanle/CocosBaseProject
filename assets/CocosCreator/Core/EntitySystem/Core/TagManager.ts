/**
 * Manages tags for an entity
 */
export class TagManager {
    private tags = new Set<string>();
    
    /**
     * Add a tag
     */
    add(tag: string): boolean {
        if (this.tags.has(tag)) return false;
        this.tags.add(tag);
        return true;
    }
    
    /**
     * Add multiple tags
     */
    addMultiple(...tags: string[]): void {
        tags.forEach(tag => this.tags.add(tag));
    }
    
    /**
     * Remove a tag
     */
    remove(tag: string): boolean {
        return this.tags.delete(tag);
    }
    
    /**
     * Remove multiple tags
     */
    removeMultiple(...tags: string[]): void {
        tags.forEach(tag => this.tags.delete(tag));
    }
    
    /**
     * Check if has tag
     */
    has(tag: string): boolean {
        return this.tags.has(tag);
    }
    
    /**
     * Check if has all tags
     */
    hasAll(...tags: string[]): boolean {
        return tags.every(tag => this.tags.has(tag));
    }
    
    /**
     * Check if has any of the tags
     */
    hasAny(...tags: string[]): boolean {
        return tags.some(tag => this.tags.has(tag));
    }
    
    /**
     * Get all tags
     */
    getAll(): string[] {
        return Array.from(this.tags);
    }
    
    /**
     * Get tags as set (for performance)
     */
    getSet(): Set<string> {
        return new Set(this.tags);
    }
    
    /**
     * Toggle a tag
     */
    toggle(tag: string): boolean {
        if (this.tags.has(tag)) {
            this.tags.delete(tag);
            return false;
        } else {
            this.tags.add(tag);
            return true;
        }
    }
    
    /**
     * Clear all tags
     */
    clear(): void {
        this.tags.clear();
    }
    
    /**
     * Get tag count
     */
    get count(): number {
        return this.tags.size;
    }
}