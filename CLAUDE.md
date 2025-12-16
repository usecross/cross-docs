# Cross-Docs Project Instructions

## Project Overview

Cross-Docs is a documentation framework built on Cross-Inertia, providing a complete solution for Python-backed documentation sites with React frontends, SSR support, and Shiki syntax highlighting.

- Main package: `python/cross_docs/`
- Example website: `website/`
- Current version: Check `python/cross_docs/__init__.py`

## Release Process

### Creating a Release

Releases are automated using **autopub**. When a PR is merged to `main` with a `RELEASE.md` file, autopub will:
1. Bump the version number
2. Build packages (Python + npm if applicable)
3. Publish to PyPI/npm
4. Create a GitHub release

### RELEASE.md Format

**IMPORTANT**: The frontmatter uses `release type:` with a **space**, not an underscore.

```markdown
---
release type: minor
---

# Release Title

Description of changes...

## Breaking Changes

List any breaking changes...

## Migration Guide

Provide migration instructions...
```

### Release Types

- `major` - Breaking changes (0.2.7 → 1.0.0)
- `minor` - New features or significant changes (0.2.7 → 0.3.0)
- `patch` - Bug fixes only (0.2.7 → 0.2.8)

### Workflow

1. Create a PR with your changes
2. Add `RELEASE.md` to the PR branch with appropriate release type
3. Merge the PR to `main`
4. Autopub will automatically handle version bump and publishing

## Development Commands

### Python Package

```bash
# Install dependencies
uv sync

# Run tests
uv run pytest

# Run website locally
cd website
uv run fastapi dev app.py
```

### Frontend (website)

```bash
cd website
bun install
bun run dev  # Vite dev server
bun run build  # Production build
```

## Architecture

### Core Components

- **CrossDocs class** (`routes.py`): Main entry point that creates docs and optional home routes
- **Config** (`config.py`): Load configuration from `pyproject.toml`
- **Markdown** (`markdown.py`): Parse markdown with frontmatter, render with Python-Markdown
- **Navigation** (`navigation.py`): Generate nav structure from file system

### Configuration

Projects using cross-docs configure via `[tool.cross-docs]` in `pyproject.toml`:

```toml
[tool.cross-docs]
content_dir = "content"
component = "docs/DocsPage"
prefix = "/docs"
index_page = "introduction"

[tool.cross-docs.home]
enabled = true
component = "HomePage"
title = "Project Name"
```

## Code Style

- Use 4-space indentation for Python
- Follow PEP 8 conventions
- Use type hints for public APIs
- Prefer descriptive variable names over abbreviations

## Git Workflow

- Main branch: `main`
- Create feature branches for changes
- Always create PRs instead of pushing directly to `main`
- Use `gh pr create` for creating pull requests
