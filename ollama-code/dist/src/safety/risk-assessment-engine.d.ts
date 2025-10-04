/**
 * Risk Assessment Engine
 *
 * Phase 2.3: Comprehensive risk assessment for file operations
 */
import { RiskAssessment, FileOperationDescription } from './safety-types.js';
import { FileTarget } from '../routing/file-operation-types.js';
export declare class RiskAssessmentEngine {
    private riskFactorWeights;
    private safetyThresholds;
    constructor();
    /**
     * Perform comprehensive risk assessment for file operation
     */
    assessRisk(operation: FileOperationDescription, targets: FileTarget[]): Promise<RiskAssessment>;
    /**
     * Identify specific risk factors for the operation
     */
    private identifyRiskFactors;
    /**
     * Calculate overall risk level based on factors
     */
    private calculateRiskLevel;
    /**
     * Determine safety level based on operation characteristics
     */
    private determineSafetyLevel;
    /**
     * Determine impact level based on scope of changes
     */
    private determineImpactLevel;
    /**
     * Generate mitigation strategies for identified risks
     */
    private generateMitigationStrategies;
    /**
     * Calculate confidence in the risk assessment
     */
    private calculateConfidence;
    /**
     * Generate human-readable reasoning for the assessment
     */
    private generateReasoning;
    /**
     * Determine if operation can be automatically approved
     */
    private canAutoApprove;
    /**
     * Create conservative assessment when normal assessment fails
     */
    private createConservativeAssessment;
    /**
     * Check if file is related to dependencies
     */
    private isDependencyFile;
    /**
     * Check if file is related to build system
     */
    private isBuildFile;
    /**
     * Initialize risk factor weights
     */
    private initializeWeights;
    /**
     * Initialize risk level thresholds
     */
    private initializeThresholds;
}
