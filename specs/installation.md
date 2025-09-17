# Ollama Code CLI - Installation and Setup

## System Requirements

### Hardware Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| Processor | Dual-core 1.6 GHz | Quad-core 2.4 GHz or better |
| RAM | 4 GB | 8 GB or more |
| Disk Space | 500 MB free | 1 GB or more free |
| Network | Broadband connection | High-speed broadband connection |

### Software Requirements

| Component | Requirement | Notes |
|-----------|-------------|-------|
| Operating System | macOS 10.15+ or Linux (Ubuntu 18.04+, Debian 10+, etc.) | Windows not supported directly (requires WSL) |
| Node.js | v18.0.0 or higher | LTS version recommended |
| npm | v7.0.0 or higher | Included with Node.js |
| Git | Any recent version | Required for version control features |

## Installation Methods

### Global Installation (Recommended)

```bash
npm install -g ollama-code
```

This will install Ollama Code globally, making the `ollama-code` command available throughout your system.

### Project-Specific Installation

```bash
cd your-project-directory
npm install ollama-code
```

When installed locally, you can run it using:

```bash
npx ollama-code
```

### Installation Verification

To verify the installation was successful:

```bash
ollama-code --version
```

This should display the current version of Ollama Code.

## First-Time Setup

### Workspace Configuration

Ollama Code automatically recognizes and works with existing project structures, including:

- Git repositories
- npm/yarn projects
- Standard directory layouts for common frameworks

No additional configuration is typically required.

### Optional Configuration

A configuration file can be created at `~/.ollama-code/config.json` with the following structure:

```json
{
  "telemetry": true,
  "logLevel": "info",
  "maxHistorySize": 1000,
  "theme": "dark",
  "editor": {
    "preferredLauncher": "code"
  },
  "git": {
    "preferredRemote": "origin"
  }
}
```

## Environment Configuration

### Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `OLLAMA_CONFIG_PATH` | Custom config location | `~/.ollama-code/config.json` |
| `OLLAMA_LOG_LEVEL` | Set logging verbosity | `info` |
| `OLLAMA_TELEMETRY` | Enable/disable telemetry | `true` |
| `OLLAMA_WORKSPACE` | Default workspace | Current directory |

### Proxy Configuration

Ollama Code respects standard proxy environment variables:

- `HTTP_PROXY` / `http_proxy`
- `HTTPS_PROXY` / `https_proxy`
- `NO_PROXY` / `no_proxy`

## Update Procedures

### Manual Update

```bash
npm update -g ollama-code
```

### Automatic Update Checking

Ollama Code checks for updates on startup and notifies when a new version is available.

### Version Rollback

If needed, you can install a specific version:

```bash
npm install -g ollama-code@0.1.0
```

## Troubleshooting

### Common Installation Issues

| Issue | Possible Cause | Resolution |
|-------|---------------|------------|
| Permission errors | Insufficient npm permissions | Use `sudo` or fix npm permissions |
| Node version error | Outdated Node.js | Update Node.js to v18+ |
| Command not found | Path issues | Check PATH environment variable |
| Installation hangs | Network issues | Check network connection, try with `--verbose` |

### Diagnostic Commands

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Verify installation
which ollama-code

# Check version
ollama-code --version

# Run with verbose logging
ollama-code --verbose
```

## Uninstallation

### Complete Removal

```bash
npm uninstall -g ollama-code
rm -rf ~/.ollama-code
```

### Preserving Configuration

```bash
npm uninstall -g ollama-code
# Configuration remains in ~/.ollama-code for future installations
``` 