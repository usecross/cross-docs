"""Navigation generation for cross-docs."""

from __future__ import annotations

from pathlib import Path

from .markdown import parse_frontmatter


def generate_nav(
    docs_dir: Path,
    base_path: str = "/docs",
    section_order: list[str] | None = None,
    index_page: str = "introduction",
) -> list[dict]:
    """Generate navigation structure from markdown files.

    Reads all markdown files in docs_dir, extracts frontmatter,
    and builds a navigation structure grouped by section.

    Args:
        docs_dir: Directory containing markdown files
        base_path: URL base path for docs (default: "/docs")
        section_order: List of section names in desired order
        index_page: Name of the index page file (maps to base_path)

    Returns:
        List of section dicts with title and items
    """
    if section_order is None:
        section_order = ["Getting Started", "Core Concepts", "Advanced", "API Reference"]

    sections: dict[str, list[dict]] = {}

    # Collect all markdown files
    for md_file in docs_dir.rglob("*.md"):
        content = md_file.read_text()
        frontmatter, _ = parse_frontmatter(content)

        title = frontmatter.get("title", md_file.stem)
        section = frontmatter.get("section", "Other")
        order = int(frontmatter.get("order", 99))

        # Build href from file path relative to docs_dir
        rel_path = md_file.relative_to(docs_dir)
        href_parts = list(rel_path.parts)
        href_parts[-1] = href_parts[-1].replace(".md", "")

        # index_page.md -> base_path/, others -> base_path/<path>/
        if href_parts == [index_page]:
            href = f"{base_path}/"
        else:
            href = f"{base_path}/" + "/".join(href_parts) + "/"

        if section not in sections:
            sections[section] = []

        sections[section].append({"title": title, "href": href, "order": order})

    # Sort items within each section by order
    for section in sections:
        sections[section].sort(key=lambda x: x["order"])
        # Remove order from final output
        for item in sections[section]:
            del item["order"]

    # Build final navigation in section order
    nav = []
    for section_name in section_order:
        if section_name in sections:
            nav.append({"title": section_name, "items": sections[section_name]})

    # Add any remaining sections not in the predefined order
    for section_name, items in sections.items():
        if section_name not in section_order:
            nav.append({"title": section_name, "items": items})

    return nav


def generate_llms_txt(
    nav: list[dict],
    *,
    title: str = "Documentation",
    description: str = "",
    base_url: str = "",
) -> str:
    """Generate llms.txt content from a navigation structure.

    Renders the nav as a markdown index following the llms.txt convention
    (see https://llmstxt.org/).

    Args:
        nav: Navigation structure from generate_nav()
        title: Site/project title for the H1 heading
        description: Short project description (rendered as blockquote)
        base_url: Base URL to prepend to hrefs (e.g. "https://example.com")

    Returns:
        llms.txt content as a string
    """
    lines = [f"# {title}", ""]

    if description:
        lines.append(f"> {description}")
        lines.append("")

    for section in nav:
        lines.append(f"## {section['title']}")
        lines.append("")
        for item in section.get("items", []):
            href = f"{base_url}{item['href']}"
            lines.append(f"- [{item['title']}]({href})")
        lines.append("")

    return "\n".join(lines)
