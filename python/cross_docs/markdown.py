"""Markdown parsing utilities for cross-docs."""

import re
from pathlib import Path

from fastapi import HTTPException


def slugify(text: str) -> str:
    """Convert heading text to URL-safe slug.

    Args:
        text: Heading text to slugify

    Returns:
        URL-safe slug (e.g., "Browser Support" -> "browser-support")
    """
    # Convert to lowercase
    slug = text.lower()
    # Replace spaces and underscores with hyphens
    slug = re.sub(r"[\s_]+", "-", slug)
    # Remove characters that aren't alphanumeric or hyphens
    slug = re.sub(r"[^a-z0-9-]", "", slug)
    # Remove multiple consecutive hyphens
    slug = re.sub(r"-+", "-", slug)
    # Remove leading/trailing hyphens
    slug = slug.strip("-")
    return slug


def extract_toc(body: str) -> list[dict]:
    """Extract table of contents from markdown body.

    Extracts H2 and H3 headings and generates slug IDs for anchor links.

    Args:
        body: Markdown body content (without frontmatter)

    Returns:
        List of TOC items with id, text, and level
    """
    toc = []

    # Match markdown headings: ## Heading or ### Heading
    # Avoid matching inside code blocks by checking line start
    heading_pattern = re.compile(r"^(#{2,3})\s+(.+)$", re.MULTILINE)

    for match in heading_pattern.finditer(body):
        hashes = match.group(1)
        text = match.group(2).strip()

        # Skip empty headings
        if not text:
            continue

        level = len(hashes)  # 2 for ##, 3 for ###

        toc.append({
            "id": slugify(text),
            "text": text,
            "level": level,
        })

    return toc


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
        "toc": extract_toc(body),
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
