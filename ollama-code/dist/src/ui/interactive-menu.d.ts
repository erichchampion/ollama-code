/**
 * Interactive Menu System
 *
 * Provides an intuitive command selection interface with:
 * - Categorized command browsing
 * - Search and filtering capabilities
 * - Command preview and help
 * - Keyboard navigation
 * - Recent commands tracking
 */
export interface MenuOption {
    label: string;
    value: string;
    description?: string;
    category?: string;
    examples?: string[];
    disabled?: boolean;
}
export interface MenuConfig {
    title: string;
    message?: string;
    options: MenuOption[];
    showSearch?: boolean;
    showCategories?: boolean;
    maxDisplayItems?: number;
    enablePreview?: boolean;
}
export interface InteractiveSession {
    recentCommands: string[];
    favoriteCommands: string[];
    sessionStartTime: Date;
    commandCount: number;
}
export declare class InteractiveMenu {
    private session;
    private readonly maxRecentCommands;
    constructor();
    /**
     * Show main command selection menu
     */
    showMainMenu(): Promise<string | null>;
    /**
     * Show category-specific commands
     */
    showCategoryMenu(category: string): Promise<string | null>;
    /**
     * Show command preview and execution options
     */
    showCommandPreview(commandName: string): Promise<string | null>;
    /**
     * Show search interface
     */
    showSearchMenu(searchTerm?: string): Promise<string | null>;
    /**
     * Show quick start guide
     */
    showQuickStartGuide(): Promise<string | null>;
    /**
     * Display menu with options
     */
    private displayMenu;
    /**
     * Display individual menu option
     */
    private displayOption;
    /**
     * Display welcome banner
     */
    private displayWelcomeBanner;
    /**
     * Format duration for display
     */
    private formatDuration;
    /**
     * Add command to recent list
     */
    addRecentCommand(commandName: string): void;
    /**
     * Add command to favorites
     */
    addFavoriteCommand(commandName: string): void;
    /**
     * Get session statistics
     */
    getSessionStats(): InteractiveSession;
}
/**
 * Default interactive menu instance
 */
export declare const interactiveMenu: InteractiveMenu;
