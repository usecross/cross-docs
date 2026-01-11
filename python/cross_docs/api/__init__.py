"""API documentation generation for cross-docs.

This module provides a plugin-based system for generating API documentation
from source code. Currently supports Python via Griffe, with extensibility
for other languages.

Example usage:
    from cross_docs.api import generate_api, PythonAPIPlugin

    # Generate API docs using configuration from pyproject.toml
    generate_api()

    # Or programmatically
    plugin = PythonAPIPlugin()
    plugin.configure({"package": "my_package", "docstring_parser": "google"})
    result = plugin.generate(Path("content/api"))
"""

from cross_docs.api.base import APIDocPlugin, APIDocResult

__all__ = [
    "APIDocPlugin",
    "APIDocResult",
]

# Lazy imports for optional dependencies
def __getattr__(name: str):
    if name == "PythonAPIPlugin":
        from cross_docs.api.plugins.python import PythonAPIPlugin
        return PythonAPIPlugin
    if name == "registry":
        from cross_docs.api.registry import registry
        return registry
    if name == "generate_api":
        from cross_docs.api.registry import generate_api
        return generate_api
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
