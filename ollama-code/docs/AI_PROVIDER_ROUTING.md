# AI Provider Routing and Selection Guide

## Overview

This document describes the intelligent AI provider routing system implemented in Phase 7.1, which enables the ollama-code system to automatically select the optimal AI provider based on request requirements, cost considerations, and performance characteristics.

## Available Providers

### 1. Ollama (Local)
**Best for:** Privacy-focused development, offline work, cost-sensitive operations

- **Capabilities:** Text completion, chat, code generation, code analysis, streaming, reasoning
- **Context Window:** Up to 32K tokens (model dependent)
- **Cost:** Free (local processing)
- **Latency:** Low to medium (hardware dependent)
- **Quality Score:** 85/100
- **Privacy:** Excellent (local processing)

**Ideal Use Cases:**
- Sensitive code analysis
- Offline development
- High-volume operations without cost concerns
- Learning and experimentation

### 2. OpenAI GPT Models
**Best for:** High-quality responses, function calling, complex reasoning

- **Capabilities:** All capabilities including function calling, image analysis
- **Context Window:** Up to 128K tokens (GPT-4 Turbo)
- **Cost:** $0.01-0.03 per 1K input tokens, $0.02-0.06 per 1K output tokens
- **Latency:** Medium
- **Quality Score:** 95/100
- **Privacy:** Standard (API processing)

**Ideal Use Cases:**
- Complex problem solving
- Function calling and tool usage
- High-quality code generation
- Image analysis tasks

### 3. Anthropic Claude
**Best for:** Long documents, reasoning, safety-conscious responses

- **Capabilities:** Text completion, chat, code analysis, document analysis, reasoning
- **Context Window:** Up to 200K tokens
- **Cost:** $0.00025-0.015 per 1K input tokens, $0.00125-0.075 per 1K output tokens
- **Latency:** Medium to high
- **Quality Score:** 92/100
- **Privacy:** High (constitutional AI)

**Ideal Use Cases:**
- Long document analysis
- Complex reasoning tasks
- Safety-critical applications
- In-depth code reviews

## Routing Strategies

### 1. Performance-Based Routing
Routes requests to the provider with the fastest expected response time.

```typescript
const routingContext: RoutingContext = {
  requestType: 'completion',
  preferredResponseTime: 1000, // 1 second
  requiredCapabilities: [AICapability.CODE_GENERATION]
};
```

**Selection Criteria:**
- Current provider health status
- Historical average response times
- Provider load and availability

**Best For:**
- Interactive development sessions
- Real-time assistance
- Quick code completions

### 2. Cost-Optimized Routing
Selects the most cost-effective provider for the task.

```typescript
const routingContext: RoutingContext = {
  requestType: 'analysis',
  maxCostPerToken: 0.001,
  requiredCapabilities: [AICapability.CODE_ANALYSIS]
};
```

**Selection Criteria:**
- Token-based pricing models
- Estimated request size
- Budget constraints

**Best For:**
- High-volume operations
- Budget-conscious development
- Automated analysis tasks

### 3. Quality-Based Routing
Routes to the provider with the highest quality score for the specific task type.

```typescript
const routingContext: RoutingContext = {
  requestType: 'generation',
  prioritizeQuality: true,
  requiredCapabilities: [AICapability.CODE_GENERATION, AICapability.REASONING]
};
```

**Selection Criteria:**
- Provider quality benchmarks
- Task-specific performance metrics
- Model capabilities alignment

**Best For:**
- Critical code generation
- Complex problem solving
- High-stakes development decisions

### 4. Capability-Based Routing
Automatically selects providers based on required capabilities.

```typescript
const routingContext: RoutingContext = {
  requiredCapabilities: [
    AICapability.FUNCTION_CALLING,
    AICapability.IMAGE_ANALYSIS
  ]
};
```

**Selection Criteria:**
- Provider capability matrix
- Feature requirements
- Specialized model availability

**Best For:**
- Multi-modal tasks
- Function calling scenarios
- Specialized analysis requirements

### 5. Round-Robin Load Balancing
Distributes requests evenly across available providers.

```typescript
const routerConfig: RouterConfig = {
  defaultStrategy: 'round_robin',
  loadBalancingEnabled: true
};
```

**Selection Criteria:**
- Provider availability
- Request distribution history
- Load balancing requirements

**Best For:**
- High-volume applications
- Provider performance testing
- Load distribution scenarios

### 6. Session Sticky Routing
Maintains consistency by using the same provider within a session.

```typescript
const routingContext: RoutingContext = {
  sessionId: 'user-session-123',
  userId: 'user-456'
};
```

**Selection Criteria:**
- Session continuity requirements
- Context preservation
- User preferences

**Best For:**
- Conversational interactions
- Multi-step workflows
- Consistent response style

## Provider Selection Decision Matrix

| Use Case | Primary Strategy | Fallback Strategy | Provider Preference |
|----------|------------------|-------------------|---------------------|
| Quick code completion | Performance | Cost | Ollama → OpenAI → Anthropic |
| Complex reasoning | Quality | Performance | OpenAI → Anthropic → Ollama |
| Long document analysis | Capability | Cost | Anthropic → OpenAI → Ollama |
| High-volume automation | Cost | Performance | Ollama → Anthropic → OpenAI |
| Function calling | Capability | Quality | OpenAI → (others don't support) |
| Privacy-sensitive tasks | Local-only | Performance | Ollama only |
| Budget-unlimited quality | Quality | Performance | OpenAI → Anthropic → Ollama |

## Fallback and Circuit Breaker Patterns

### Circuit Breaker Implementation

The system implements circuit breakers for each provider to handle failures gracefully:

1. **Closed State:** Normal operation, requests flow through
2. **Open State:** Provider is failing, requests are blocked
3. **Half-Open State:** Testing if provider has recovered

**Thresholds:**
- Failure threshold: 5 consecutive failures
- Recovery timeout: 60 seconds
- Recovery test: 3 successful requests

### Fallback Chain

When a provider fails, the system automatically attempts fallbacks:

1. **Primary Provider:** Selected by routing strategy
2. **Secondary Provider:** Next best option based on capabilities
3. **Tertiary Provider:** Last resort with required capabilities

**Example Fallback Chain:**
```
OpenAI (primary) → Anthropic (secondary) → Ollama (tertiary)
```

## Cost Optimization

### Token Estimation

The router estimates token usage before making requests:

```typescript
// Rough estimation: 1 token ≈ 4 characters for English text
const estimatedTokens = Math.ceil(text.length / 4);
const estimatedCost = provider.calculateCost(estimatedTokens, estimatedTokens * 0.5);
```

### Budget Management

Configure cost limits to prevent runaway expenses:

```typescript
const routerConfig: RouterConfig = {
  costOptimizationEnabled: true,
  maxCostPerRequest: 0.10, // $0.10 maximum per request
  dailyBudgetLimit: 50.00  // $50 daily limit
};
```

### Cost Tracking

Monitor spending across providers:

```typescript
const metrics = router.getMetrics();
console.log(`Total cost today: $${metrics.totalCost}`);
console.log(`Cost savings: $${metrics.costSavings}`);
```

## Performance Monitoring

### Health Checks

Each provider is continuously monitored:

- **Response Time:** Average latency over 5-minute windows
- **Success Rate:** Percentage of successful requests
- **Error Rate:** Frequency of failures
- **Availability:** Uptime percentage

### Metrics Collection

Real-time metrics are collected for routing decisions:

```typescript
const providerStatus = router.getProviderStatus();
/*
{
  ollama: {
    health: 'healthy',
    responseTime: 850,
    successRate: 98.5,
    capabilities: ['chat', 'code_generation']
  },
  openai: {
    health: 'healthy',
    responseTime: 1200,
    successRate: 99.8,
    capabilities: ['chat', 'function_calling', 'image_analysis']
  }
}
*/
```

## Configuration Examples

### Development Environment
Prioritize cost and privacy:

```typescript
const devConfig: RouterConfig = {
  defaultStrategy: 'cost',
  fallbackEnabled: true,
  costOptimizationEnabled: true,
  circuitBreakerThreshold: 3
};
```

### Production Environment
Prioritize reliability and quality:

```typescript
const prodConfig: RouterConfig = {
  defaultStrategy: 'quality',
  fallbackEnabled: true,
  circuitBreakerThreshold: 5,
  healthCheckInterval: 30000,
  loadBalancingEnabled: true
};
```

### High-Volume Environment
Distribute load and optimize for throughput:

```typescript
const highVolumeConfig: RouterConfig = {
  defaultStrategy: 'round_robin',
  fallbackEnabled: true,
  loadBalancingEnabled: true,
  performanceWindowMs: 300000
};
```

## Best Practices

### 1. Provider Configuration
- Always configure fallback providers
- Set appropriate timeouts for each provider
- Monitor API key usage and rotation

### 2. Cost Management
- Set daily/monthly budget limits
- Use cost-effective providers for high-volume tasks
- Monitor token usage patterns

### 3. Performance Optimization
- Implement caching for repeated queries
- Use streaming for long responses
- Configure appropriate circuit breaker thresholds

### 4. Security Considerations
- Rotate API keys regularly
- Use environment variables for secrets
- Prefer local providers for sensitive data

### 5. Error Handling
- Implement graceful degradation
- Log routing decisions for debugging
- Monitor fallback usage patterns

## Troubleshooting

### Common Issues

1. **All Providers Failing**
   - Check internet connectivity
   - Verify API keys are valid
   - Review rate limiting settings

2. **High Costs**
   - Review routing strategy (prefer cost-effective providers)
   - Implement request caching
   - Set budget limits

3. **Slow Responses**
   - Check provider health status
   - Adjust routing strategy to prioritize performance
   - Consider using local providers

4. **Quality Issues**
   - Switch to quality-based routing
   - Use higher-tier models
   - Implement result validation

### Monitoring Commands

```bash
# Check provider status
ollama-code provider status

# View routing metrics
ollama-code provider metrics

# Test provider connections
ollama-code provider test-all

# View cost analysis
ollama-code provider costs --period today
```

## Future Enhancements

### Planned Features
- Machine learning-based routing optimization
- User behavior pattern analysis
- Automatic model selection within providers
- Real-time cost optimization
- Provider performance prediction

### Integration Points
- IDE extensions with provider preferences
- CI/CD pipeline integration
- Team-wide routing policies
- Enterprise provider management