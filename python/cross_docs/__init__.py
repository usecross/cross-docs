"""Cross-Docs: Documentation framework built on Cross-Inertia.

A complete solution for Python-backed documentation sites with
React frontends, SSR support, and Shiki syntax highlighting.
"""

from cross_docs.config import DocsConfig, HomeConfig, load_config
from cross_docs.markdown import load_markdown, load_raw_markdown, parse_frontmatter
from cross_docs.middleware import strip_trailing_slash_middleware, wants_markdown
from cross_docs.navigation import generate_nav
from cross_docs.routes import (
    create_docs_handler,
    create_docs_router,
    create_docs_router_from_config,
    create_home_route,
)

__version__ = "0.2.7"

__all__ = [
    # Config
    "DocsConfig",
    "HomeConfig",
    "load_config",
    # Markdown utilities
    "parse_frontmatter",
    "load_markdown",
    "load_raw_markdown",
    # Navigation
    "generate_nav",
    # Middleware
    "strip_trailing_slash_middleware",
    "wants_markdown",
    # Routes
    "create_docs_router",
    "create_docs_router_from_config",
    "create_docs_handler",
    "create_home_route",
]
