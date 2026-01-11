"""Base classes for API documentation plugins.

This module defines the plugin interface that all API documentation generators
must implement. Plugins extract API information from source code and produce
a standardized JSON format that can be rendered by the frontend.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


@dataclass
class APIDocResult:
    """Result from an API documentation generator.

    Attributes:
        package_name: Name of the documented package (e.g., "cross_docs").
        data: The extracted API data in JSON-serializable format.
        output_path: Path where the JSON was written.
        nav_items: Navigation structure for the sidebar.

    Example nav_items structure:
        [
            {
                "title": "Modules",
                "items": [
                    {"title": "cross_docs", "href": "/api/cross_docs/"},
                    {"title": "cross_docs.config", "href": "/api/cross_docs.config/"},
                ]
            },
            {
                "title": "Classes",
                "items": [
                    {"title": "CrossDocs", "href": "/api/cross_docs/CrossDocs/"},
                    {"title": "DocsConfig", "href": "/api/cross_docs/DocsConfig/"},
                ]
            }
        ]
    """

    package_name: str
    data: dict[str, Any]
    output_path: Path
    nav_items: list[dict[str, Any]] = field(default_factory=list)


class APIDocPlugin(ABC):
    """Base class for API documentation generator plugins.

    Plugins are responsible for:
    1. Extracting API information from source code
    2. Producing JSON output in a standardized format
    3. Generating navigation structure for the frontend

    Built-in plugins:
    - PythonAPIPlugin: Uses Griffe to extract Python API docs

    Example implementation:
        class MyPlugin(APIDocPlugin):
            name = "my-language"

            def configure(self, config: dict[str, Any]) -> None:
                self.source_dir = config.get("source_dir", "src")

            def generate(self, output_dir: Path) -> APIDocResult:
                # Extract API info and write JSON
                data = extract_api(self.source_dir)
                output_path = output_dir / "my-package.json"
                output_path.write_text(json.dumps(data))
                return APIDocResult(
                    package_name="my-package",
                    data=data,
                    output_path=output_path,
                    nav_items=generate_nav(data),
                )
    """

    # Plugin identifier (e.g., "python", "typescript")
    name: str

    @abstractmethod
    def configure(self, config: dict[str, Any]) -> None:
        """Configure the plugin from settings.

        Args:
            config: Configuration dictionary from pyproject.toml.
                    Contains plugin-specific options like package name,
                    docstring parser, etc.
        """
        pass

    @abstractmethod
    def generate(self, output_dir: Path) -> APIDocResult:
        """Generate API documentation.

        This method should:
        1. Extract API information from source code
        2. Write JSON to output_dir
        3. Return result with data and navigation

        Args:
            output_dir: Directory to write JSON output to.

        Returns:
            APIDocResult with extracted data and navigation structure.

        Raises:
            ValueError: If required configuration is missing.
            ImportError: If required dependencies are not installed.
        """
        pass

    def get_prefix(self) -> str:
        """Get the URL prefix for this plugin's routes.

        Override this to customize the URL prefix. Default is "/api".

        Returns:
            URL prefix string (e.g., "/api", "/api/python").
        """
        return "/api"
