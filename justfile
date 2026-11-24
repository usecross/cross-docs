# Justfile for Cross-Docs
# Run `just` to see all available commands

# Default recipe - show available commands
default:
    @just --list

# Install all dependencies
install:
    @echo "📦 Installing Python dependencies with uv..."
    uv sync
    @echo ""
    @echo "📦 Installing frontend dependencies..."
    cd website && bun install
    @echo ""
    @echo "✅ All dependencies installed!"

# Run the website (both servers)
dev:
    @echo "🚀 Starting Cross-Docs website..."
    @echo "  - Vite dev server: http://localhost:5173"
    @echo "  - FastAPI server:  http://localhost:8000"
    @echo ""
    @echo "Open http://localhost:8000 in your browser"
    @echo ""
    @echo "Press Ctrl+C to stop both servers"
    @echo ""
    @just _run-servers

# Build the website for production
build:
    @echo "🏗️  Building website for production..."
    cd website && bun run build
    @echo "✅ Build complete!"

# Clean build artifacts
clean:
    @echo "🧹 Cleaning build artifacts..."
    cd website && rm -rf static/build frontend/dist node_modules bun.lockb
    @echo "✅ Clean complete!"

# Internal recipe for running servers
_run-servers:
    #!/usr/bin/env bash
    set -euo pipefail

    cd website

    # Check if dependencies are installed
    if [ ! -d "node_modules" ]; then
        echo "⚠️  Frontend dependencies not installed."
        echo "   Run: just install"
        exit 1
    fi

    # Clear Vite's pre-bundled dependency cache to avoid stale exports
    if [ -d "node_modules/.vite" ]; then
        echo "🧹 Clearing Vite cache..."
        rm -rf node_modules/.vite
    fi

    # Function to cleanup processes
    cleanup() {
        echo ""
        echo "🛑 Stopping servers..."
        if [ ! -z "${VITE_PID:-}" ]; then
            kill $VITE_PID 2>/dev/null || true
        fi
        if [ ! -z "${API_PID:-}" ]; then
            kill $API_PID 2>/dev/null || true
        fi
        # Kill any remaining child processes
        pkill -P $$ 2>/dev/null || true
        exit 0
    }

    # Trap to cleanup on exit
    trap cleanup SIGINT SIGTERM EXIT

    # Start Vite dev server
    bun run dev &
    VITE_PID=$!

    # Wait for Vite to start
    sleep 2

    # Start FastAPI server (run from root so uv finds workspace)
    cd ..
    uv run --directory website fastapi dev app.py &
    API_PID=$!

    # Wait for both processes
    wait $VITE_PID $API_PID
