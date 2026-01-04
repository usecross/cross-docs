"""Shared test fixtures for cross-docs tests."""

import pytest
from pathlib import Path


@pytest.fixture
def tmp_content_dir(tmp_path: Path) -> Path:
    """Create a temporary content directory with sample markdown files."""
    content_dir = tmp_path / "content"
    content_dir.mkdir()

    # Create a sample markdown file with frontmatter
    intro = content_dir / "introduction.md"
    intro.write_text("""\
---
title: Introduction
description: Getting started with the library
---

Welcome to the documentation.

## Installation

Install with pip or uv.

### Using pip

Run `pip install mylib`.

### Using uv

Run `uv add mylib`.

## Quick Start

Here's a quick example.
""")

    # Create a file without frontmatter
    plain = content_dir / "plain.md"
    plain.write_text("""\
# Plain Markdown

This file has no frontmatter.

## Section One

Content here.
""")

    return content_dir


@pytest.fixture
def sample_pyproject(tmp_path: Path) -> Path:
    """Create a temporary pyproject.toml with cross-docs config."""
    pyproject = tmp_path / "pyproject.toml"
    pyproject.write_text("""\
[project]
name = "test-project"

[tool.cross-docs]
content_dir = "docs"
prefix = "/documentation"
index_page = "intro"
github_url = "https://github.com/test/repo"

[tool.cross-docs.home]
enabled = true
title = "Test Project"
tagline = "A test project"
""")

    # Create the docs directory
    docs_dir = tmp_path / "docs"
    docs_dir.mkdir()

    return pyproject
