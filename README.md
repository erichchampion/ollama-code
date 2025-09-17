# Ollama Code CLI

A command-line interface for interacting with Ollama AI for local code assistance, generation, refactoring, and more.

## Overview

Ollama Code CLI is a powerful coding assistant that runs entirely locally using Ollama. It provides intelligent code analysis, generation, refactoring, and explanation capabilities without requiring internet connectivity or external API keys.

## Features

- **Local AI Processing**: All AI operations run locally using Ollama
- **Model Management**: List, download, and switch between different AI models
- **Code Analysis**: Analyze and understand your codebase structure
- **Code Generation**: Generate code based on natural language prompts
- **Code Refactoring**: Improve code readability, performance, and structure
- **Code Explanation**: Get detailed explanations of complex code
- **Bug Fixing**: Identify and suggest fixes for code issues
- **Git Integration**: Perform git operations and analyze git history
- **File Operations**: Edit files, search codebase, and manage files
- **Interactive Mode**: Use commands interactively or via CLI arguments

## Installation

### Prerequisites

1. **Install Ollama**: Download and install Ollama from [https://ollama.ai](https://ollama.ai)
2. **Start Ollama Server**: Run `ollama serve` to start the local server
3. **Download a Model**: Run `ollama pull llama3.2` to download a model

### Install Ollama Code CLI

```bash
# Clone the repository
git clone <repository-url>
cd ollama-code

# Run the installation script
./install.sh

# Or install manually:
cd ollama-code
npm install
npm run build
npm install -g .
```

## Quick Start

1. **Connect to Ollama**:
   ```bash
   ollama-code login
   ```

2. **List available models**:
   ```bash
   ollama-code list-models
   ```

3. **Download a model** (if needed):
   ```bash
   ollama-code pull-model llama3.2
   ```

4. **Ask a question**:
   ```bash
   ollama-code ask "How do I implement a binary search tree in TypeScript?"
   ```

## Using Different Models

Ollama Code CLI supports using different AI models for various tasks. Here's how to work with models:

### **Model Management**

#### **List Available Models**
```bash
ollama-code list-models
```
This shows all models currently installed in your Ollama instance, including:
- Model name
- Size
- Last modified date
- Parameter count and quantization level

#### **Download New Models**
```bash
# Download a coding-specific model
ollama-code pull-model codellama

# Download a general-purpose model
ollama-code pull-model llama3.2

# Download a smaller, faster model
ollama-code pull-model phi3
```

#### **Set Default Model**
```bash
# Set a model as default for the current session
ollama-code set-model codellama
```

### **Using Models with Commands**

#### **Specify Model for Individual Commands**
```bash
# Use a specific model for a coding question
ollama-code ask "Write a Python function to sort a list" --model codellama

# Use a different model for general questions
ollama-code ask "Explain quantum computing" --model llama3.2

# Use a smaller model for quick tasks
ollama-code ask "What is 2+2?" --model phi3
```

#### **Model Selection Examples**

**For Coding Tasks:**
```bash
# Use CodeLlama for complex programming questions
ollama-code ask "Implement a binary search tree in Python" --model codellama

# Use Qwen2.5 Coder for general coding assistance
ollama-code ask "How do I handle async operations in JavaScript?" --model qwen2.5-coder:latest
```

**For General Questions:**
```bash
# Use Llama 3.2 for general knowledge
ollama-code ask "Explain machine learning concepts" --model llama3.2

# Use Phi3 for quick, simple questions
ollama-code ask "What is the capital of France?" --model phi3
```

**For Code Explanation:**
```bash
# Use a coding model to explain code
ollama-code explain path/to/file.py --model codellama

# Use a general model for broader explanations
ollama-code explain path/to/file.py --model llama3.2
```

### **Model Recommendations**

| Task Type | Recommended Models | Why |
|-----------|-------------------|-----|
| **Coding** | `codellama`, `qwen2.5-coder:latest` | Specialized for programming tasks |
| **General Questions** | `llama3.2`, `llama3.3:latest` | Broad knowledge and reasoning |
| **Quick Tasks** | `phi3`, `phi4:latest` | Fast responses, smaller size |
| **Code Review** | `phind-codellama:34b-v2` | Excellent for code analysis |
| **Multimodal** | `llava:13b` | Can process images and text |

### **Model Configuration**

#### **Default Model Settings**
The CLI uses `qwen2.5-coder:latest` as the default model. To change this:

1. **Edit Configuration**:
   ```bash
   ollama-code config ai.defaultModel "your-preferred-model"
   ```

2. **Environment Variable**:
   ```bash
   export OLLAMA_DEFAULT_MODEL="codellama"
   ollama-code ask "your question"
   ```

#### **Model-Specific Parameters**
Different models may work better with different parameters:

```bash
# Use lower temperature for more focused responses
ollama-code ask "Write clean code" --model codellama --temperature 0.3

# Use higher temperature for creative tasks
ollama-code ask "Write a creative story" --model llama3.2 --temperature 0.9
```

### **Troubleshooting Models**

#### **Model Not Found Error**
If you get a "model not found" error:

1. **Check available models**:
   ```bash
   ollama-code list-models
   ```

2. **Download the model**:
   ```bash
   ollama-code pull-model model-name
   ```

3. **Verify model name**: Make sure you're using the exact model name from the list

#### **Model Too Slow**
If a model is too slow for your needs:

1. **Try a smaller model**:
   ```bash
   ollama-code pull-model phi3  # Smaller, faster model
   ollama-code ask "question" --model phi3
   ```

2. **Use quantized versions**: Look for models with `Q4_K_M` or `Q4_0` quantization

#### **Model Not Responding Well**
If a model isn't giving good responses:

1. **Try a different model** for the task type
2. **Adjust parameters**:
   ```bash
   ollama-code ask "question" --model model-name --temperature 0.7 --top-p 0.9
   ```
3. **Check model capabilities**: Some models are better for specific tasks

### **Advanced Model Usage**

#### **Model Parameters**
Fine-tune model behavior with parameters:

```bash
# Temperature: Controls randomness (0.0 = deterministic, 1.0 = very random)
ollama-code ask "question" --model codellama --temperature 0.3

# Top-p: Controls diversity of responses (0.1 = focused, 0.9 = diverse)
ollama-code ask "question" --model llama3.2 --top-p 0.8

# Top-k: Limits vocabulary choices (lower = more focused)
ollama-code ask "question" --model phi3 --top-k 20
```

#### **Model Performance Tips**

**For Speed:**
- Use smaller models (`phi3`, `phi4`) for quick tasks
- Use quantized versions (Q4_K_M, Q4_0) for better performance
- Lower temperature (0.1-0.3) for faster, more focused responses

**For Quality:**
- Use larger models (`llama3.3:latest`, `phind-codellama:34b-v2`) for complex tasks
- Higher temperature (0.7-0.9) for creative or exploratory tasks
- Use specialized models for specific domains (codellama for programming)

#### **Model-Specific Commands**

```bash
# Use different models for different command types
ollama-code ask "Write a Python function" --model codellama
ollama-code explain path/to/file.js --model phind-codellama:34b-v2
ollama-code refactor path/to/file.py --model qwen2.5-coder:latest
ollama-code generate "a REST API" --model llama3.2
```

#### **Batch Operations with Models**

```bash
# Process multiple files with the same model
ollama-code explain file1.py file2.py file3.py --model codellama

# Use different models for different file types
ollama-code explain *.py --model codellama
ollama-code explain *.js --model qwen2.5-coder:latest
ollama-code explain *.md --model llama3.2
```

5. **Explain code**:
   ```bash
   ollama-code explain path/to/file.js
   ```

## Available Commands

### AI Commands
- `ask <question>` - Ask Ollama a question about code or programming
- `explain <file>` - Explain a code file or snippet
- `refactor <file>` - Refactor code for better readability, performance, or structure
- `fix <file>` - Fix bugs or issues in code
- `generate <prompt>` - Generate code based on a prompt

### Model Management
- `list-models` - List available Ollama models
- `pull-model <name>` - Download a new Ollama model
- `set-model <name>` - Set the default model for the current session

### System Commands
- `login` - Connect to Ollama server
- `logout` - Disconnect from Ollama server
- `config` - View or edit configuration settings
- `run <command>` - Execute a terminal command
- `search <term>` - Search the codebase for a term
- `edit <file>` - Edit a specified file
- `git <operation>` - Perform git operations

### Session Commands
- `clear` - Clear the current session display
- `reset` - Reset the conversation context
- `history` - View conversation history
- `commands` - List all available commands
- `help <command>` - Get help for a specific command
- `exit` / `quit` - Exit the application

## Configuration

Ollama Code CLI uses a configuration file to customize behavior:

```json
{
  "ollama": {
    "baseUrl": "http://localhost:11434",
    "timeout": 120000
  },
  "ai": {
    "defaultModel": "llama3.2",
    "defaultTemperature": 0.7
  }
}
```

## Examples

### Code Analysis
```bash
# Explain a complex function
ollama-code explain src/utils/parser.ts

# Refactor for better performance
ollama-code refactor src/algorithms/sort.js --focus performance

# Fix a bug
ollama-code fix src/components/Button.tsx --issue "Button not responding to clicks"
```

### Code Generation
```bash
# Generate a React component
ollama-code generate "a reusable Button component with TypeScript" --language TypeScript

# Generate a utility function
ollama-code generate "a function that validates email addresses" --language JavaScript
```

### Model Management
```bash
# List all available models
ollama-code list-models

# Download a coding-specific model
ollama-code pull-model codellama

# Switch to a different model
ollama-code set-model codellama
```

### Using Different Models
```bash
# Use a coding model for programming questions
ollama-code ask "How do I implement a binary search?" --model codellama

# Use a general model for broader questions
ollama-code ask "Explain machine learning" --model llama3.2

# Use a fast model for quick tasks
ollama-code ask "What is 2+2?" --model phi3

# Use a specific model for code explanation
ollama-code explain path/to/file.py --model phind-codellama:34b-v2
```

### Interactive Mode
```bash
# Start interactive mode
ollama-code

# Then use commands without the prefix
> ask "What's the best way to handle async operations in Node.js?"
> explain ./src/api/client.js
> list-models
```

## Troubleshooting

### Common Issues

1. **"Failed to connect to Ollama server"**
   - Make sure Ollama is installed and running
   - Run `ollama serve` to start the server
   - Check that the server URL is correct (default: http://localhost:11434)

2. **"No models found"**
   - Download a model first: `ollama-code pull-model llama3.2`
   - Or use Ollama directly: `ollama pull llama3.2`

3. **"Model not found"**
   - Check available models: `ollama-code list-models`
   - Download the model: `ollama-code pull-model <model-name>`

4. **Slow responses**
   - Local models may be slower than cloud services
   - Try a smaller model for faster responses (`phi3`, `phi4`)
   - Use quantized models (Q4_K_M, Q4_0) for better performance
   - Ensure you have sufficient RAM for the model
   - Lower temperature (0.1-0.3) for faster, more focused responses

5. **Model not giving good responses**
   - Try a different model for the task type
   - Adjust temperature and other parameters
   - Use specialized models (codellama for programming, llama3.2 for general questions)
   - Check if the model is appropriate for your task

### Getting Help

- Use `ollama-code help` to see all available commands
- Use `ollama-code help <command>` for specific command help
- Check the [Ollama documentation](https://ollama.ai/docs) for model information

## Development

### Building from Source

```bash
# Clone the repository
git clone <repository-url>
cd ollama-code

# Run the installation script
./install.sh

# Or install manually:
cd ollama-code
npm install
npm run build

# Run in development mode
npm run dev
```

### Project Structure

```
ollama-code/
├── src/
│   ├── ai/                 # AI client and Ollama integration
│   ├── auth/               # Authentication (simplified for Ollama)
│   ├── commands/           # Command definitions and handlers
│   ├── config/             # Configuration management
│   ├── errors/             # Error handling and formatting
│   ├── execution/          # Command execution environment
│   ├── fileops/            # File operations
│   ├── fs/                 # File system utilities
│   ├── terminal/           # Terminal interface
│   ├── utils/              # Utility functions
│   └── simple-cli.ts       # Simplified CLI implementation
├── dist/                   # Compiled JavaScript
├── package.json            # Package configuration
└── tsconfig.json          # TypeScript configuration
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Quick Reference

### **Model Commands**
```bash
ollama-code list-models                    # List available models
ollama-code pull-model <name>              # Download a model
ollama-code set-model <name>               # Set default model
ollama-code ask "question" --model <name>  # Use specific model
```

### **Popular Models**
```bash
# Coding models
ollama-code pull-model codellama
ollama-code pull-model qwen2.5-coder:latest
ollama-code pull-model phind-codellama:34b-v2

# General models
ollama-code pull-model llama3.2
ollama-code pull-model llama3.3:latest

# Fast models
ollama-code pull-model phi3
ollama-code pull-model phi4:latest
```

### **Model Parameters**
```bash
--model <name>        # Specify model
--temperature <0-1>   # Control randomness
--top-p <0-1>         # Control diversity
--top-k <number>       # Limit vocabulary
```

## Acknowledgments

- Built on top of the Ollama Code CLI architecture
- Powered by [Ollama](https://ollama.ai) for local AI inference
- Inspired by the need for privacy-focused, local AI coding assistants