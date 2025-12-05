"""Markdown parsing utilities for cross-docs."""

from pathlib import Path

from fastapi import HTTPException


def parse_frontmatter(content: str) -> tuple[dict, str]:
    """Parse YAML frontmatter from markdown content.

    Args:
        content: Raw markdown content with optional frontmatter

    Returns:
        Tuple of (frontmatter dict, body content)
    """
    if not content.startswith("---"):
        return {}, content

    parts = content.split("---", 2)
    if len(parts) < 3:
        return {}, content

    frontmatter = {}
    for line in parts[1].strip().split("\n"):
        if ":" in line:
            key, value = line.split(":", 1)
            frontmatter[key.strip()] = value.strip()

    return frontmatter, parts[2].strip()


def load_markdown(content_dir: Path, path: str) -> dict:
    """Load and parse a markdown file.

    Args:
        content_dir: Base directory for content
        path: Relative path to markdown file (without .md extension)

    Returns:
        Dict with title, description, and body

    Raises:
        HTTPException: If file not found
    """
    file_path = content_dir / f"{path}.md"
    if not file_path.exists():
        raise HTTPException(status_code=404, detail=f"Content not found: {path}")

    content = file_path.read_text()
    frontmatter, body = parse_frontmatter(content)

    return {
        "title": frontmatter.get("title", "Untitled"),
        "description": frontmatter.get("description", ""),
        "body": body,
    }


def load_raw_markdown(content_dir: Path, path: str) -> str:
    """Load raw markdown file content.

    Args:
        content_dir: Base directory for content
        path: Relative path to markdown file (without .md extension)

    Returns:
        Raw file content as string

    Raises:
        HTTPException: If file not found
    """
    file_path = content_dir / f"{path}.md"
    if not file_path.exists():
        raise HTTPException(status_code=404, detail=f"Content not found: {path}")
    return file_path.read_text()
