"""Configuration loading for cross-docs."""

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

try:
    import tomllib
except ImportError:
    import tomli as tomllib  # type: ignore


@dataclass
class DocsConfig:
    """Configuration for cross-docs.

    Can be set in pyproject.toml under [tool.cross-docs]:

        [tool.cross-docs]
        content_dir = "content"
        prefix = "/docs"
        index_page = "introduction"
        section_order = ["Getting Started", "Guide", "API"]
        logo_url = "/static/logo.svg"
        logo_inverted_url = "/static/logo-inverted.svg"
        github_url = "https://github.com/org/repo"

        [[tool.cross-docs.nav_links]]
        label = "Docs"
        href = "/docs"

        [[tool.cross-docs.nav_links]]
        label = "Blog"
        href = "/blog"
    """

    content_dir: Path = field(default_factory=lambda: Path("content"))
    prefix: str = "/docs"
    index_page: str = "introduction"
    section_order: list[str] | None = None
    logo_url: str | None = None
    logo_inverted_url: str | None = None
    github_url: str | None = None
    nav_links: list[dict[str, str]] | None = None
    component: str = "docs/DocsPage"
    enable_markdown_response: bool = True


def load_config(
    pyproject_path: Path | str | None = None,
    *,
    defaults: dict[str, Any] | None = None,
) -> DocsConfig:
    """Load cross-docs configuration from pyproject.toml.

    Args:
        pyproject_path: Path to pyproject.toml. If None, searches current
                       directory and parents for pyproject.toml.
        defaults: Default values to use if not specified in config.

    Returns:
        DocsConfig with loaded settings.

    Example:
        config = load_config()
        router = create_docs_router(
            config.content_dir,
            prefix=config.prefix,
            logo_url=config.logo_url,
            github_url=config.github_url,
            nav_links=config.nav_links,
        )
    """
    if pyproject_path is None:
        pyproject_path = _find_pyproject()

    if pyproject_path is None:
        return DocsConfig(**(defaults or {}))

    pyproject_path = Path(pyproject_path)

    if not pyproject_path.exists():
        return DocsConfig(**(defaults or {}))

    with open(pyproject_path, "rb") as f:
        data = tomllib.load(f)

    tool_config = data.get("tool", {}).get("cross-docs", {})

    # Merge defaults with config
    merged = {**(defaults or {}), **tool_config}

    # Handle content_dir specially - make it relative to pyproject.toml
    if "content_dir" in merged:
        content_dir = merged["content_dir"]
        if isinstance(content_dir, str):
            merged["content_dir"] = pyproject_path.parent / content_dir

    return DocsConfig(**merged)


def _find_pyproject() -> Path | None:
    """Find pyproject.toml in current directory or parents."""
    cwd = Path.cwd()

    for directory in [cwd, *cwd.parents]:
        pyproject = directory / "pyproject.toml"
        if pyproject.exists():
            return pyproject

    return None
