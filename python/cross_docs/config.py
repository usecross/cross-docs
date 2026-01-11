"""Configuration loading for cross-docs."""

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

try:
    import tomllib
except ImportError:
    import tomli as tomllib  # type: ignore


@dataclass
class DocSet:
    """Configuration for a single documentation set.

    Used in multi-docs mode to define separate documentation collections
    that users can switch between (e.g., "Strawberry" and "Strawberry Django").

    Example in pyproject.toml:
        [[tool.cross-docs.doc_sets]]
        name = "Strawberry"
        slug = ""  # Empty slug means root: /docs/
        description = "GraphQL library for Python"
        icon_url = "/static/strawberry.svg"
        content_subdir = "strawberry"
        index_page = "introduction"
        section_order = ["Getting Started", "Guide", "API"]

        [[tool.cross-docs.doc_sets]]
        name = "Strawberry Django"
        slug = "django"  # Results in: /docs/django/
        description = "Django integration for Strawberry"
        icon_url = "/static/django.svg"
        content_subdir = "strawberry-django"
    """

    name: str
    slug: str = ""  # URL slug (empty = root prefix, e.g., "django" -> /docs/django/)
    description: str = ""
    icon: str | None = None  # Emoji or short text icon (e.g., "🍓")
    icon_url: str | None = None  # URL to icon image
    content_subdir: str = ""  # Subdirectory within content_dir/docs/
    index_page: str = "introduction"
    section_order: list[str] | None = None


@dataclass
class HomeFeature:
    """A feature item for the homepage."""

    title: str
    description: str


@dataclass
class APIPluginConfig:
    """Configuration for a single API documentation plugin.

    Used in pyproject.toml under [[tool.cross-docs.api]]:

        [[tool.cross-docs.api]]
        plugin = "python"
        package = "my_package"
        docstring_parser = "google"
        include_private = false
        prefix = "/api"
        doc_set = ""  # Associate with a doc set by slug

    Attributes:
        plugin: Plugin identifier (e.g., "python", "typescript").
        package: Package name to document (for Python plugin).
        output_dir: Output directory for generated JSON (relative to content_dir).
        prefix: URL prefix for API routes.
        doc_set: Doc set slug to associate this API with (for multi-docs mode).
        docstring_parser: Docstring style for Python ("google", "numpy", "sphinx").
        include_private: Include private members starting with _.
        include_special: Include special __dunder__ methods.
        search_paths: Additional paths to search for modules.
        component: React component to render API docs.
    """

    plugin: str
    package: str | None = None
    output_dir: str = "api"
    prefix: str = "/api"
    doc_set: str | None = None
    docstring_parser: str = "google"
    include_private: bool = False
    include_special: bool = True
    search_paths: list[str] | None = None
    component: str = "api/APIPage"

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary for plugin configuration."""
        return {
            "plugin": self.plugin,
            "package": self.package,
            "output_dir": self.output_dir,
            "prefix": self.prefix,
            "doc_set": self.doc_set,
            "docstring_parser": self.docstring_parser,
            "include_private": self.include_private,
            "include_special": self.include_special,
            "search_paths": self.search_paths,
            "component": self.component,
        }


@dataclass
class HomeConfig:
    """Configuration for the homepage.

    Can be set in pyproject.toml under [tool.cross-docs.home]:

        [tool.cross-docs.home]
        enabled = true
        component = "HomePage"
        title = "My Project"
        tagline = "A great library for doing things"
        description = "Build amazing things with this library"
        install_command = "uv add my-project"
        cta_text = "Get Started"
        cta_href = "/docs/"

        [[tool.cross-docs.home.features]]
        title = "Fast"
        description = "Lightning fast performance"

        [[tool.cross-docs.home.features]]
        title = "Simple"
        description = "Easy to use API"
    """

    enabled: bool = False
    component: str = "HomePage"
    title: str = ""
    tagline: str = ""
    description: str = ""
    install_command: str = ""
    cta_text: str = "Get Started"
    cta_href: str = "/docs/"
    features: list[dict[str, str]] = field(default_factory=list)


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
        footer_logo_url = "/static/footer-logo.svg"
        footer_logo_inverted_url = "/static/footer-logo-inverted.svg"
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
    footer_logo_url: str | None = None
    footer_logo_inverted_url: str | None = None
    github_url: str | None = None
    nav_links: list[dict[str, str]] | None = None
    component: str = "docs/DocsPage"
    enable_markdown_response: bool = True
    home: HomeConfig = field(default_factory=HomeConfig)
    # Multi-docs support (optional)
    doc_sets: list[DocSet] | None = None
    # API documentation plugins (optional)
    api: list[APIPluginConfig] | None = None


def load_config(
    config_path: Path | str | None = None,
    *,
    defaults: dict[str, Any] | None = None,
) -> DocsConfig:
    """Load cross-docs configuration from pyproject.toml or cross-docs.toml.

    Args:
        config_path: Path to config file. If None, searches current directory
                    and parents for cross-docs.toml or pyproject.toml.
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
    if config_path is None:
        config_path = _find_config()

    if config_path is None:
        return DocsConfig(**(defaults or {}))

    config_path = Path(config_path)

    if not config_path.exists():
        return DocsConfig(**(defaults or {}))

    with open(config_path, "rb") as f:
        data = tomllib.load(f)

    # Get config from appropriate location based on file type
    if config_path.name == "cross-docs.toml":
        tool_config = data
    else:
        tool_config = data.get("tool", {}).get("cross-docs", {})

    # Merge defaults with config
    merged = {**(defaults or {}), **tool_config}

    # Handle content_dir specially - make it relative to config file
    if "content_dir" in merged:
        content_dir = merged["content_dir"]
        if isinstance(content_dir, str):
            merged["content_dir"] = config_path.parent / content_dir

    # Handle home config specially - convert dict to HomeConfig
    if "home" in merged and isinstance(merged["home"], dict):
        merged["home"] = HomeConfig(**merged["home"])

    # Handle doc_sets specially - convert list of dicts to list of DocSet
    if "doc_sets" in merged and isinstance(merged["doc_sets"], list):
        merged["doc_sets"] = [DocSet(**ds) for ds in merged["doc_sets"]]

    # Handle api specially - convert list of dicts to list of APIPluginConfig
    if "api" in merged and isinstance(merged["api"], list):
        merged["api"] = [APIPluginConfig(**api) for api in merged["api"]]

    return DocsConfig(**merged)


def _find_config() -> Path | None:
    """Find cross-docs.toml or pyproject.toml in current directory or parents."""
    cwd = Path.cwd()

    for directory in [cwd, *cwd.parents]:
        # Prefer cross-docs.toml
        cross_docs_toml = directory / "cross-docs.toml"
        if cross_docs_toml.exists():
            return cross_docs_toml

        # Fall back to pyproject.toml
        pyproject = directory / "pyproject.toml"
        if pyproject.exists():
            return pyproject

    return None
