#!/bin/bash
# Portable wrapper for mantis-mcp

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Use 'node' from PATH instead of hardcoded path
exec node "$SCRIPT_DIR/dist/index.js" "$@"