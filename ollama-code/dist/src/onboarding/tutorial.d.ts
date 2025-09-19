/**
 * User Onboarding and Tutorial System
 *
 * Provides interactive tutorials and guided experiences including:
 * - First-time user setup and configuration
 * - Feature discovery and walkthroughs
 * - Interactive tutorials for different workflows
 * - Progress tracking and achievement system
 * - Context-sensitive help and tips
 */
import { TerminalInterface } from '../terminal/types.js';
export interface TutorialStep {
    id: string;
    title: string;
    description: string;
    command?: string;
    expectedOutput?: string;
    tips?: string[];
    nextSteps?: string[];
    completionCriteria?: {
        commandRun?: string;
        outputContains?: string;
        configSet?: {
            key: string;
            value: any;
        };
    };
}
export interface Tutorial {
    id: string;
    name: string;
    description: string;
    category: 'getting-started' | 'advanced' | 'workflow' | 'feature';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime: number;
    prerequisites?: string[];
    steps: TutorialStep[];
    achievements?: string[];
}
export interface TutorialProgress {
    tutorialId: string;
    startedAt: number;
    completedAt?: number;
    currentStep: number;
    completedSteps: string[];
    totalSteps: number;
    status: 'not-started' | 'in-progress' | 'completed' | 'skipped';
}
export interface OnboardingState {
    userId: string;
    startedAt: number;
    completedAt?: number;
    currentPhase: 'welcome' | 'setup' | 'tutorial' | 'completed';
    tutorials: Record<string, TutorialProgress>;
    achievements: string[];
    preferences: {
        showTips: boolean;
        autoAdvance: boolean;
        difficulty: 'beginner' | 'intermediate' | 'advanced';
    };
}
export declare class TutorialSystem {
    private onboardingDir;
    private progressFile;
    private onboardingState;
    private availableTutorials;
    private terminal;
    constructor();
    /**
     * Set the terminal interface for interactive tutorials
     */
    setTerminal(terminal: TerminalInterface): void;
    /**
     * Initialize the tutorial system
     */
    initialize(): Promise<void>;
    /**
     * Start the onboarding process
     */
    startOnboarding(): Promise<void>;
    /**
     * Show available tutorials
     */
    showTutorials(): Promise<void>;
    /**
     * Start a specific tutorial
     */
    startTutorial(tutorialId: string): Promise<void>;
    /**
     * Continue current tutorial
     */
    continueTutorial(): Promise<void>;
    /**
     * Show tutorial progress
     */
    showProgress(): Promise<void>;
    /**
     * Skip current tutorial
     */
    skipTutorial(tutorialId?: string): Promise<void>;
    /**
     * Reset tutorial progress
     */
    resetProgress(tutorialId?: string): Promise<void>;
    /**
     * Get context-sensitive tips
     */
    getContextTips(command?: string): string[];
    /**
     * Initialize built-in tutorials
     */
    private initializeTutorials;
    /**
     * Run tutorial steps
     */
    private runTutorialSteps;
    /**
     * Show welcome message
     */
    private showWelcomeMessage;
    /**
     * Run setup phase
     */
    private runSetupPhase;
    /**
     * Show available tutorials after setup
     */
    private showAvailableTutorials;
    /**
     * Create new user
     */
    private createNewUser;
    /**
     * Load progress from file
     */
    private loadProgress;
    /**
     * Save progress to file
     */
    private saveProgress;
    /**
     * Get current tutorial in progress
     */
    private getCurrentTutorial;
    /**
     * Group tutorials by category
     */
    private groupTutorialsByCategory;
    /**
     * Get category icon
     */
    private getCategoryIcon;
    /**
     * Format category name
     */
    private formatCategoryName;
    /**
     * Get tutorial status icon
     */
    private getTutorialStatusIcon;
    /**
     * Get difficulty badge
     */
    private getDifficultyBadge;
    /**
     * Check for achievements
     */
    private checkAchievements;
    /**
     * Suggest next tutorials
     */
    private suggestNextTutorials;
    /**
     * Get command-specific tips
     */
    private getCommandTips;
    /**
     * Get general tips based on progress
     */
    private getGeneralTips;
    /**
     * Generate unique user ID
     */
    private generateUserId;
}
/**
 * Default tutorial system instance
 */
export declare const tutorialSystem: TutorialSystem;
