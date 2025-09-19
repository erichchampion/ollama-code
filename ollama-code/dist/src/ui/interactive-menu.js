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
import { commandRegistry } from '../commands/index.js';
export class InteractiveMenu {
    session;
    maxRecentCommands = 10;
    constructor() {
        this.session = {
            recentCommands: [],
            favoriteCommands: [],
            sessionStartTime: new Date(),
            commandCount: 0
        };
    }
    /**
     * Show main command selection menu
     */
    async showMainMenu() {
        console.clear();
        this.displayWelcomeBanner();
        const categories = commandRegistry.getCategories();
        const options = [];
        // Add quick actions
        options.push({
            label: '🚀 Quick Start Guide',
            value: 'quick-start',
            description: 'Get started with common tasks',
            category: 'Getting Started'
        }, {
            label: '⭐ Favorite Commands',
            value: 'favorites',
            description: 'Your most used commands',
            category: 'Getting Started',
            disabled: this.session.favoriteCommands.length === 0
        }, {
            label: '🕒 Recent Commands',
            value: 'recent',
            description: 'Recently executed commands',
            category: 'Getting Started',
            disabled: this.session.recentCommands.length === 0
        });
        // Add category browsing
        for (const category of categories) {
            const commands = commandRegistry.getByCategory(category)
                .filter(cmd => !cmd.hidden);
            options.push({
                label: `📁 ${category}`,
                value: `category:${category}`,
                description: `Browse ${commands.length} ${category.toLowerCase()} commands`,
                category: 'Browse by Category'
            });
        }
        // Add utility options
        options.push({
            label: '🔍 Search Commands',
            value: 'search',
            description: 'Search for specific commands',
            category: 'Utilities'
        }, {
            label: '⚙️ Settings',
            value: 'settings',
            description: 'Configure ollama-code preferences',
            category: 'Utilities'
        }, {
            label: '📚 Help & Documentation',
            value: 'help',
            description: 'View help and documentation',
            category: 'Utilities'
        }, {
            label: '🚪 Exit',
            value: 'exit',
            description: 'Exit ollama-code',
            category: 'Utilities'
        });
        const config = {
            title: 'Ollama Code - Main Menu',
            message: 'What would you like to do?',
            options,
            showCategories: true,
            enablePreview: true
        };
        return await this.displayMenu(config);
    }
    /**
     * Show category-specific commands
     */
    async showCategoryMenu(category) {
        console.clear();
        console.log(`\n📁 ${category} Commands\n`);
        const commands = commandRegistry.getByCategory(category)
            .filter(cmd => !cmd.hidden)
            .sort((a, b) => a.name.localeCompare(b.name));
        const options = commands.map(cmd => ({
            label: `${cmd.name}`,
            value: `command:${cmd.name}`,
            description: cmd.description,
            examples: cmd.examples
        }));
        // Add navigation options
        options.unshift({
            label: '← Back to Main Menu',
            value: 'back',
            description: 'Return to main menu'
        }, {
            label: '🔍 Search in this category',
            value: 'search',
            description: `Search within ${category} commands`
        });
        const config = {
            title: `${category} Commands`,
            options,
            enablePreview: true
        };
        const result = await this.displayMenu(config);
        if (result?.startsWith('command:')) {
            const commandName = result.replace('command:', '');
            return await this.showCommandPreview(commandName);
        }
        return result;
    }
    /**
     * Show command preview and execution options
     */
    async showCommandPreview(commandName) {
        const command = commandRegistry.get(commandName);
        if (!command) {
            console.log(`❌ Command '${commandName}' not found`);
            return null;
        }
        console.clear();
        console.log(`\n🔍 Command Preview: ${command.name}\n`);
        // Display command information
        console.log(`📝 Description: ${command.description}`);
        if (command.category) {
            console.log(`📁 Category: ${command.category}`);
        }
        if (command.args && command.args.length > 0) {
            console.log('\n📋 Arguments:');
            for (const arg of command.args) {
                const required = arg.required ? '(required)' : '(optional)';
                console.log(`   ${arg.name}: ${arg.description} ${required}`);
            }
        }
        if (command.examples && command.examples.length > 0) {
            console.log('\n💡 Examples:');
            for (const example of command.examples) {
                console.log(`   $ ${example}`);
            }
        }
        const options = [
            {
                label: '▶️ Execute Command',
                value: `execute:${commandName}`,
                description: 'Run this command now'
            },
            {
                label: '📖 Show Detailed Help',
                value: `help:${commandName}`,
                description: 'View comprehensive help for this command'
            },
            {
                label: '⭐ Add to Favorites',
                value: `favorite:${commandName}`,
                description: 'Add to your favorite commands',
                disabled: this.session.favoriteCommands.includes(commandName)
            },
            {
                label: '← Back',
                value: 'back',
                description: 'Return to previous menu'
            }
        ];
        const config = {
            title: `Preview: ${command.name}`,
            options
        };
        return await this.displayMenu(config);
    }
    /**
     * Show search interface
     */
    async showSearchMenu(searchTerm) {
        console.clear();
        console.log('\n🔍 Search Commands\n');
        if (!searchTerm) {
            // Get search term from user
            console.log('Enter search terms (command name, description, or category):');
            // In a real implementation, you'd use a proper input library
            console.log('(For this demo, we\'ll search for "git")');
            searchTerm = 'git';
        }
        const allCommands = commandRegistry.list().filter(cmd => !cmd.hidden);
        const searchResults = allCommands.filter(cmd => cmd.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cmd.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (cmd.category && cmd.category.toLowerCase().includes(searchTerm.toLowerCase())));
        if (searchResults.length === 0) {
            console.log(`❌ No commands found matching "${searchTerm}"`);
            console.log('\n💡 Try different search terms or browse by category');
            const options = [
                {
                    label: '🔍 New Search',
                    value: 'search',
                    description: 'Try a different search term'
                },
                {
                    label: '← Back to Main Menu',
                    value: 'back',
                    description: 'Return to main menu'
                }
            ];
            const config = {
                title: 'Search Results',
                options
            };
            return await this.displayMenu(config);
        }
        console.log(`📊 Found ${searchResults.length} commands matching "${searchTerm}":\n`);
        const options = searchResults.map(cmd => ({
            label: `${cmd.name}`,
            value: `command:${cmd.name}`,
            description: cmd.description,
            category: cmd.category,
            examples: cmd.examples
        }));
        // Add navigation options
        options.unshift({
            label: '🔍 New Search',
            value: 'search',
            description: 'Search for different commands'
        }, {
            label: '← Back to Main Menu',
            value: 'back',
            description: 'Return to main menu'
        });
        const config = {
            title: `Search Results for "${searchTerm}"`,
            options,
            showCategories: true,
            enablePreview: true
        };
        const result = await this.displayMenu(config);
        if (result?.startsWith('command:')) {
            const commandName = result.replace('command:', '');
            return await this.showCommandPreview(commandName);
        }
        return result;
    }
    /**
     * Show quick start guide
     */
    async showQuickStartGuide() {
        console.clear();
        console.log('\n🚀 Quick Start Guide\n');
        console.log('Welcome to Ollama Code! Here are some common tasks to get you started:\n');
        const quickTasks = [
            {
                title: '💬 Ask AI Questions',
                command: 'ask',
                description: 'Get help with coding questions and explanations'
            },
            {
                title: '🔍 Explain Code',
                command: 'explain',
                description: 'Understand what a piece of code does'
            },
            {
                title: '🛠️ Generate Code',
                command: 'generate',
                description: 'Create new code from natural language descriptions'
            },
            {
                title: '🌿 Git Operations',
                command: 'git-status',
                description: 'Smart git operations with AI assistance'
            },
            {
                title: '🧪 Testing',
                command: 'test-setup',
                description: 'Set up testing framework for your project'
            },
            {
                title: '🔧 Refactoring',
                command: 'refactor-analyze',
                description: 'Improve your code structure and quality'
            }
        ];
        const options = quickTasks.map(task => ({
            label: task.title,
            value: `command:${task.command}`,
            description: task.description
        }));
        options.push({
            label: '← Back to Main Menu',
            value: 'back',
            description: 'Return to main menu'
        });
        const config = {
            title: 'Quick Start Guide',
            options,
            enablePreview: true
        };
        const result = await this.displayMenu(config);
        if (result?.startsWith('command:')) {
            const commandName = result.replace('command:', '');
            return await this.showCommandPreview(commandName);
        }
        return result;
    }
    /**
     * Display menu with options
     */
    async displayMenu(config) {
        console.log(`\n${config.title}`);
        console.log('='.repeat(config.title.length));
        if (config.message) {
            console.log(`\n${config.message}`);
        }
        // Group options by category if enabled
        if (config.showCategories) {
            const grouped = new Map();
            for (const option of config.options) {
                const category = option.category || 'Other';
                if (!grouped.has(category)) {
                    grouped.set(category, []);
                }
                grouped.get(category).push(option);
            }
            let index = 1;
            for (const [category, options] of grouped) {
                console.log(`\n📂 ${category}:`);
                for (const option of options) {
                    this.displayOption(index++, option, config.enablePreview);
                }
            }
        }
        else {
            config.options.forEach((option, index) => {
                this.displayOption(index + 1, option, config.enablePreview);
            });
        }
        console.log('\n💡 Navigation:');
        console.log('   • Enter number to select option');
        console.log('   • Type "search" to search commands');
        console.log('   • Type "help" for help');
        console.log('   • Type "exit" to quit');
        // In a real implementation, you'd use a proper input library like inquirer
        // For this demo, we'll simulate user selection
        console.log('\n[Simulating user selection for demo...]');
        // Return first non-back option for demo
        const nonBackOption = config.options.find(opt => opt.value !== 'back');
        return nonBackOption?.value || null;
    }
    /**
     * Display individual menu option
     */
    displayOption(index, option, showPreview) {
        const disabled = option.disabled ? ' (disabled)' : '';
        const indexStr = `${index}.`.padEnd(4);
        console.log(`   ${indexStr}${option.label}${disabled}`);
        if (option.description) {
            console.log(`        ${option.description}`);
        }
        if (showPreview && option.examples && option.examples.length > 0) {
            console.log(`        Example: ${option.examples[0]}`);
        }
    }
    /**
     * Display welcome banner
     */
    displayWelcomeBanner() {
        const banner = `
╔══════════════════════════════════════════════════════════════╗
║                     🤖 OLLAMA CODE CLI                      ║
║              Your AI-Powered Development Assistant          ║
╠══════════════════════════════════════════════════════════════╣
║  Session: ${this.formatDuration(Date.now() - this.session.sessionStartTime.getTime())}  │  Commands: ${this.session.commandCount}  │  Local AI: ✅  ║
╚══════════════════════════════════════════════════════════════╝
`;
        console.log(banner);
    }
    /**
     * Format duration for display
     */
    formatDuration(ms) {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        }
        return `${seconds}s`;
    }
    /**
     * Add command to recent list
     */
    addRecentCommand(commandName) {
        // Remove if already exists
        const index = this.session.recentCommands.indexOf(commandName);
        if (index > -1) {
            this.session.recentCommands.splice(index, 1);
        }
        // Add to beginning
        this.session.recentCommands.unshift(commandName);
        // Limit size
        if (this.session.recentCommands.length > this.maxRecentCommands) {
            this.session.recentCommands = this.session.recentCommands.slice(0, this.maxRecentCommands);
        }
        this.session.commandCount++;
    }
    /**
     * Add command to favorites
     */
    addFavoriteCommand(commandName) {
        if (!this.session.favoriteCommands.includes(commandName)) {
            this.session.favoriteCommands.push(commandName);
        }
    }
    /**
     * Get session statistics
     */
    getSessionStats() {
        return { ...this.session };
    }
}
/**
 * Default interactive menu instance
 */
export const interactiveMenu = new InteractiveMenu();
//# sourceMappingURL=interactive-menu.js.map