"use strict";
/**
 * Tool System Types
 *
 * Defines the interfaces and types for the tool system that enables
 * sophisticated multi-tool orchestration for coding tasks.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseTool = void 0;
class BaseTool {
    validateParameters(parameters) {
        for (const param of this.metadata.parameters) {
            if (param.required && !(param.name in parameters)) {
                return false;
            }
            if (param.name in parameters && param.validation) {
                if (!param.validation(parameters[param.name])) {
                    return false;
                }
            }
        }
        return true;
    }
    getParameterDefaults() {
        const defaults = {};
        for (const param of this.metadata.parameters) {
            if (param.default !== undefined) {
                defaults[param.name] = param.default;
            }
        }
        return defaults;
    }
}
exports.BaseTool = BaseTool;
//# sourceMappingURL=types.js.map