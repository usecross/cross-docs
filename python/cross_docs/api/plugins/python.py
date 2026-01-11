"""Python API documentation plugin using Griffe.

This plugin extracts API documentation from Python packages using Griffe,
a fast static analysis tool that parses Python source code and docstrings.

Requires the `griffe` package to be installed:
    pip install cross-docs[api]
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from cross_docs.api.base import APIDocPlugin, APIDocResult


class PythonAPIPlugin(APIDocPlugin):
    """Generate Python API documentation using Griffe.

    This plugin uses Griffe to statically analyze Python source code
    and extract API documentation including:
    - Module structure
    - Classes with methods and attributes
    - Functions with signatures
    - Docstrings (Google, NumPy, or Sphinx style)
    - Type annotations

    Configuration options:
        package: Name of the package to document (required)
        docstring_parser: Docstring style - "google", "numpy", or "sphinx" (default: "google")
        include_private: Include private members starting with _ (default: False)
        include_special: Include special members like __init__ (default: True)
        search_paths: Additional paths to search for modules (default: None)

    Example pyproject.toml:
        [[tool.cross-docs.api]]
        plugin = "python"
        package = "my_package"
        docstring_parser = "google"
        include_private = false
    """

    name = "python"

    def __init__(self) -> None:
        self.package: str | None = None
        self.docstring_parser: str = "google"
        self.include_private: bool = False
        self.include_special: bool = True
        self.search_paths: list[str] | None = None
        self._prefix: str = "/api"

    def configure(self, config: dict[str, Any]) -> None:
        """Configure the plugin from settings.

        Args:
            config: Configuration dictionary with options:
                - package: Package name to document
                - docstring_parser: Docstring style
                - include_private: Include private members
                - include_special: Include special methods
                - search_paths: Additional module search paths
                - prefix: URL prefix for routes
        """
        self.package = config.get("package")
        self.docstring_parser = config.get("docstring_parser", "google")
        self.include_private = config.get("include_private", False)
        self.include_special = config.get("include_special", True)
        self.search_paths = config.get("search_paths")
        self._prefix = config.get("prefix", "/api")

    def generate(self, output_dir: Path) -> APIDocResult:
        """Generate API documentation using Griffe.

        Args:
            output_dir: Directory to write JSON output.

        Returns:
            APIDocResult with extracted API data and navigation.

        Raises:
            ValueError: If package name is not configured.
            ImportError: If griffe is not installed.
        """
        if not self.package:
            raise ValueError(
                "Package name is required. Set 'package' in [[tool.cross-docs.api]]"
            )

        try:
            import griffe
        except ImportError as e:
            raise ImportError(
                "Griffe is required for Python API documentation. "
                "Install it with: pip install cross-docs[api]"
            ) from e

        # Configure Griffe loader
        # DocstringStyle is a Literal type, so we pass the string directly
        loader = griffe.GriffeLoader(
            docstring_parser=self.docstring_parser,  # type: ignore[arg-type]
            search_paths=self.search_paths,
        )

        # Load the package
        package = loader.load(self.package)

        # Convert to dictionary
        data = package.as_dict(full=True)

        # Post-process the data
        data = self._sort_members(data)

        if not self.include_private:
            data = self._filter_private(data)

        if not self.include_special:
            data = self._filter_special(data)

        # Add metadata
        data["_generator"] = "cross-docs"
        data["_plugin"] = "python"
        data["_version"] = "1.0"

        # Write output
        output_path = output_dir / f"{self.package}.json"
        output_path.parent.mkdir(parents=True, exist_ok=True)

        with open(output_path, "w", encoding="utf-8") as f:
            # Use Griffe's JSONEncoder with full=True to include parsed docstrings
            encoder = griffe.JSONEncoder(indent=2, ensure_ascii=False, full=True)
            f.write(encoder.encode(data))

        # Generate navigation
        nav_items = self._generate_nav(data)

        return APIDocResult(
            package_name=self.package,
            data=data,
            output_path=output_path,
            nav_items=nav_items,
        )

    def get_prefix(self) -> str:
        """Get the URL prefix for API routes."""
        return self._prefix

    def _sort_members(self, obj: dict[str, Any]) -> dict[str, Any]:
        """Recursively sort members for consistent output.

        Sorts by filepath, then path, then name to ensure deterministic
        output that won't cause unnecessary diffs.
        """
        if "members" in obj and isinstance(obj["members"], dict):
            obj["members"] = dict(
                sorted(
                    obj["members"].items(),
                    key=lambda x: (
                        str(x[1].get("filepath", "") or ""),
                        str(x[1].get("path", "") or ""),
                        str(x[1].get("name", "") or ""),
                    ),
                )
            )
            for member in obj["members"].values():
                if isinstance(member, dict):
                    self._sort_members(member)
        return obj

    def _filter_private(self, obj: dict[str, Any]) -> dict[str, Any]:
        """Remove private members (starting with _ but not __dunder__).

        Keeps special dunder methods like __init__, __str__, etc.
        """
        if "members" in obj and isinstance(obj["members"], dict):
            obj["members"] = {
                k: self._filter_private(v) if isinstance(v, dict) else v
                for k, v in obj["members"].items()
                if not k.startswith("_") or (k.startswith("__") and k.endswith("__"))
            }
        return obj

    def _filter_special(self, obj: dict[str, Any]) -> dict[str, Any]:
        """Remove special dunder methods like __init__, __str__, etc."""
        if "members" in obj and isinstance(obj["members"], dict):
            obj["members"] = {
                k: self._filter_special(v) if isinstance(v, dict) else v
                for k, v in obj["members"].items()
                if not (k.startswith("__") and k.endswith("__"))
            }
        return obj

    def _generate_nav(self, data: dict[str, Any]) -> list[dict[str, Any]]:
        """Generate navigation structure from API data.

        Groups items by kind (Modules, Aliases) like strawberry.rocks.

        Args:
            data: The extracted API data.

        Returns:
            Navigation structure for the sidebar.
        """
        prefix = self._prefix.rstrip("/")
        package_name = data.get("name", self.package)

        # Collect direct children by kind
        modules: list[dict[str, str]] = []
        aliases: list[dict[str, str]] = []

        members = data.get("members", {})

        for name, member in members.items():
            if not isinstance(member, dict):
                continue

            # Skip private members
            if name.startswith("_"):
                continue

            kind = member.get("kind", "")

            if kind == "module":
                modules.append({
                    "title": name,
                    "href": f"{prefix}/{package_name}.{name}",
                })
            elif kind == "alias":
                aliases.append({
                    "title": name,
                    "href": f"{prefix}/{package_name}.{name}",
                })

        # Sort alphabetically
        modules.sort(key=lambda x: x["title"].lower())
        aliases.sort(key=lambda x: x["title"].lower())

        # Build navigation sections
        nav: list[dict[str, Any]] = []

        if modules:
            nav.append({"title": "MODULES", "items": modules})

        if aliases:
            nav.append({"title": "ALIASES", "items": aliases})

        return nav

    def _collect_nav_items(
        self,
        obj: dict[str, Any],
        prefix: str,
        current_path: str,
        classes: list[dict[str, str]],
        functions: list[dict[str, str]],
    ) -> None:
        """Recursively collect navigation items from API data.

        Groups items by kind (classes, functions).

        Args:
            obj: Current object in the API data tree.
            prefix: URL prefix.
            current_path: Current dotted path (e.g., "cross_docs.config").
            classes: List to append class items to.
            functions: List to append function items to.
        """
        members = obj.get("members", {})
        obj_kind = obj.get("kind", "")

        for name, member in members.items():
            if not isinstance(member, dict):
                continue

            kind = member.get("kind", "")
            member_path = f"{current_path}.{name}"

            if kind == "module":
                # Recurse into submodules
                self._collect_nav_items(
                    member,
                    prefix,
                    member_path,
                    classes,
                    functions,
                )

            elif kind == "class":
                classes.append({
                    "title": name,
                    "href": f"{prefix}/{current_path.replace('.', '/')}/{name}/",
                })

            elif kind == "function":
                # Only add module-level functions
                if obj_kind == "module":
                    functions.append({
                        "title": name,
                        "href": f"{prefix}/{current_path.replace('.', '/')}/{name}/",
                    })
