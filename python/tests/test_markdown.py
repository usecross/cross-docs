"""Tests for cross_docs.markdown module."""

import pytest
from pathlib import Path
from fastapi import HTTPException

from cross_docs.markdown import (
    slugify,
    extract_toc,
    parse_frontmatter,
    load_markdown,
    load_raw_markdown,
)


class TestSlugify:
    """Tests for the slugify function."""

    def test_basic(self):
        """Basic text is converted to lowercase with hyphens."""
        assert slugify("Hello World") == "hello-world"
        assert slugify("Getting Started") == "getting-started"

    def test_special_chars(self):
        """Special characters are removed."""
        assert slugify("What's New?") == "whats-new"
        assert slugify("API (v2)") == "api-v2"
        assert slugify("C++ Guide") == "c-guide"

    def test_multiple_spaces(self):
        """Multiple spaces/hyphens are collapsed."""
        assert slugify("Hello   World") == "hello-world"
        assert slugify("Hello---World") == "hello-world"
        assert slugify("Hello - World") == "hello-world"

    def test_underscores(self):
        """Underscores are converted to hyphens."""
        assert slugify("hello_world") == "hello-world"
        assert slugify("HELLO_WORLD") == "hello-world"

    def test_leading_trailing(self):
        """Leading/trailing hyphens are removed."""
        assert slugify("-Hello-") == "hello"
        assert slugify("  Hello  ") == "hello"

    def test_empty(self):
        """Empty string returns empty."""
        assert slugify("") == ""
        assert slugify("   ") == ""


class TestExtractToc:
    """Tests for the extract_toc function."""

    def test_h2_h3_headings(self):
        """H2 and H3 headings are extracted with correct levels."""
        body = """\
## Installation

Some content.

### Using pip

More content.

### Using uv

Even more.

## Quick Start

Final section.
"""
        toc = extract_toc(body)

        assert len(toc) == 4
        assert toc[0] == {"id": "installation", "text": "Installation", "level": 2}
        assert toc[1] == {"id": "using-pip", "text": "Using pip", "level": 3}
        assert toc[2] == {"id": "using-uv", "text": "Using uv", "level": 3}
        assert toc[3] == {"id": "quick-start", "text": "Quick Start", "level": 2}

    def test_empty_body(self):
        """Empty body returns empty TOC."""
        assert extract_toc("") == []
        assert extract_toc("Just some text without headings.") == []

    def test_h1_ignored(self):
        """H1 headings are not included in TOC."""
        body = """\
# Title

## Section

### Subsection
"""
        toc = extract_toc(body)

        assert len(toc) == 2
        assert toc[0]["text"] == "Section"
        assert toc[1]["text"] == "Subsection"

    def test_h4_and_beyond_ignored(self):
        """H4+ headings are not included in TOC."""
        body = """\
## Section

#### Deep Heading

##### Even Deeper
"""
        toc = extract_toc(body)

        assert len(toc) == 1
        assert toc[0]["text"] == "Section"


class TestParseFrontmatter:
    """Tests for the parse_frontmatter function."""

    def test_valid_frontmatter(self):
        """Valid YAML frontmatter is extracted."""
        content = """\
---
title: My Title
description: A description
---

Body content here.
"""
        frontmatter, body = parse_frontmatter(content)

        assert frontmatter == {"title": "My Title", "description": "A description"}
        assert body == "Body content here."

    def test_empty_frontmatter(self):
        """Empty frontmatter returns empty dict."""
        content = """\
---
---

Body content.
"""
        frontmatter, body = parse_frontmatter(content)

        assert frontmatter == {}
        assert body == "Body content."

    def test_no_frontmatter(self):
        """Content without frontmatter returns empty dict and full content."""
        content = "Just markdown content."
        frontmatter, body = parse_frontmatter(content)

        assert frontmatter == {}
        assert body == "Just markdown content."

    def test_no_delimiters(self):
        """Content that starts with --- but has no closing delimiter."""
        content = """\
--- Some text
More text
"""
        frontmatter, body = parse_frontmatter(content)

        # Should return content as-is since there's no proper frontmatter
        assert frontmatter == {}
        assert body == content


class TestLoadMarkdown:
    """Tests for the load_markdown function."""

    def test_success(self, tmp_content_dir: Path):
        """Successfully loads markdown with frontmatter and TOC."""
        result = load_markdown(tmp_content_dir, "introduction")

        assert result["title"] == "Introduction"
        assert result["description"] == "Getting started with the library"
        assert "Welcome to the documentation." in result["body"]
        assert len(result["toc"]) == 4  # Installation, Using pip, Using uv, Quick Start

    def test_not_found(self, tmp_content_dir: Path):
        """Raises HTTPException 404 when file not found."""
        with pytest.raises(HTTPException) as exc_info:
            load_markdown(tmp_content_dir, "nonexistent")

        assert exc_info.value.status_code == 404
        assert "nonexistent" in exc_info.value.detail

    def test_no_frontmatter(self, tmp_content_dir: Path):
        """Handles files without frontmatter."""
        result = load_markdown(tmp_content_dir, "plain")

        assert result["title"] == "Untitled"
        assert result["description"] == ""
        assert "# Plain Markdown" in result["body"]


class TestLoadRawMarkdown:
    """Tests for the load_raw_markdown function."""

    def test_success(self, tmp_content_dir: Path):
        """Successfully loads raw markdown content."""
        result = load_raw_markdown(tmp_content_dir, "introduction")

        assert "---" in result
        assert "title: Introduction" in result
        assert "Welcome to the documentation." in result

    def test_not_found(self, tmp_content_dir: Path):
        """Raises HTTPException 404 when file not found."""
        with pytest.raises(HTTPException) as exc_info:
            load_raw_markdown(tmp_content_dir, "nonexistent")

        assert exc_info.value.status_code == 404
