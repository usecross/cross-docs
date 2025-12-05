"""Cross-Docs: Documentation framework built on Cross-Inertia.

A complete solution for Python-backed documentation sites with
React frontends, SSR support, and Shiki syntax highlighting.
"""

from cross_docs.markdown import load_markdown, load_raw_markdown, parse_frontmatter
from cross_docs.middleware import strip_trailing_slash_middleware, wants_markdown
from cross_docs.navigation import generate_nav
from cross_docs.routes import create_docs_handler, create_docs_routes

__version__ = "0.1.0"

__all__ = [
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
    "create_docs_routes",
    "create_docs_handler",
]
