"""Navigation generation for cross-docs."""

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
