"""Plugin registry for API documentation generators.

This module handles plugin discovery, registration, and execution.
Plugins can be registered built-in or discovered via entry points.
"""

from __future__ import annotations

import sys
from pathlib import Path
from typing import TYPE_CHECKING, Any

from cross_docs.api.base import APIDocPlugin, APIDocResult

if TYPE_CHECKING:
    from cross_docs.config import DocsConfig


class PluginRegistry:
    """Registry for API documentation plugins.

    Handles plugin discovery and instantiation. Built-in plugins are
    registered automatically, and third-party plugins can be discovered
    via the `cross_docs.api_plugins` entry point.

    Example:
        from cross_docs.api.registry import registry

        # Get a plugin by name
        plugin_class = registry.get("python")

        # Create and configure a plugin
        plugin = registry.create("python", {"package": "my_package"})

        # Generate docs
        result = plugin.generate(Path("content/api"))
    """

    def __init__(self) -> None:
        self._plugins: dict[str, type[APIDocPlugin]] = {}
        self._discovered = False

    def register(self, plugin_class: type[APIDocPlugin]) -> None:
        """Register a plugin class.

        Args:
            plugin_class: Plugin class to register. Must have a `name` attribute.

        Raises:
            ValueError: If plugin_class doesn't have a name attribute.
        """
        if not hasattr(plugin_class, "name") or not plugin_class.name:
            raise ValueError(f"Plugin class {plugin_class} must have a 'name' attribute")
        self._plugins[plugin_class.name] = plugin_class

    def get(self, name: str) -> type[APIDocPlugin]:
        """Get a plugin class by name.

        Args:
            name: Plugin identifier (e.g., "python", "typescript").

        Returns:
            Plugin class.

        Raises:
            ValueError: If plugin is not found.
        """
        self._ensure_discovered()

        if name not in self._plugins:
            available = ", ".join(sorted(self._plugins.keys())) or "none"
            raise ValueError(f"Unknown plugin: {name!r}. Available plugins: {available}")
        return self._plugins[name]

    def create(self, name: str, config: dict[str, Any]) -> APIDocPlugin:
        """Create and configure a plugin instance.

        Args:
            name: Plugin identifier.
            config: Configuration dictionary to pass to plugin.configure().

        Returns:
            Configured plugin instance.
        """
        plugin_class = self.get(name)
        plugin = plugin_class()
        plugin.configure(config)
        return plugin

    def list_plugins(self) -> list[str]:
        """List all available plugin names.

        Returns:
            Sorted list of plugin names.
        """
        self._ensure_discovered()
        return sorted(self._plugins.keys())

    def _ensure_discovered(self) -> None:
        """Ensure plugins have been discovered."""
        if self._discovered:
            return

        self._discovered = True

        # Register built-in plugins
        self._register_builtin_plugins()

        # Discover entry point plugins
        self._discover_entry_point_plugins()

    def _register_builtin_plugins(self) -> None:
        """Register built-in plugins."""
        try:
            from cross_docs.api.plugins.python import PythonAPIPlugin

            self.register(PythonAPIPlugin)
        except ImportError:
            # Griffe not installed - Python plugin not available
            pass

    def _discover_entry_point_plugins(self) -> None:
        """Discover plugins via entry points."""
        if sys.version_info >= (3, 10):
            from importlib.metadata import entry_points

            eps = entry_points(group="cross_docs.api_plugins")
        else:
            from importlib.metadata import entry_points

            all_eps = entry_points()
            eps = all_eps.get("cross_docs.api_plugins", [])

        for ep in eps:
            try:
                plugin_class = ep.load()
                # Handle both class and factory function
                if callable(plugin_class) and not isinstance(plugin_class, type):
                    plugin_class = plugin_class()
                if isinstance(plugin_class, type) and issubclass(plugin_class, APIDocPlugin):
                    self.register(plugin_class)
            except Exception as e:
                # Log but don't fail on plugin load errors
                import warnings

                warnings.warn(f"Failed to load plugin {ep.name}: {e}")


# Global registry instance
registry = PluginRegistry()


def generate_api(
    config: DocsConfig | None = None,
    *,
    output_dir: Path | str | None = None,
    plugins: list[str] | None = None,
) -> list[APIDocResult]:
    """Generate API documentation using configured plugins.

    This is the main entry point for generating API documentation.
    It reads configuration from pyproject.toml and runs all configured
    API plugins.

    Args:
        config: DocsConfig instance. If None, loads from pyproject.toml.
        output_dir: Override output directory. If None, uses config value.
        plugins: List of plugin names to run. If None, runs all configured.

    Returns:
        List of APIDocResult from each plugin.

    Raises:
        ValueError: If no API plugins are configured.

    Example:
        # Using pyproject.toml configuration
        results = generate_api()

        # With explicit config
        config = load_config()
        results = generate_api(config, output_dir="docs/api")
    """
    if config is None:
        from cross_docs.config import load_config

        config = load_config()

    if not config.api:
        raise ValueError(
            "No API plugins configured. Add [[tool.cross-docs.api]] to pyproject.toml"
        )

    results: list[APIDocResult] = []

    for api_config in config.api:
        # Skip if not in requested plugins list
        if plugins is not None and api_config.plugin not in plugins:
            continue

        # Determine output directory for this plugin
        # CLI override takes precedence, then config's output_dir
        if output_dir is not None:
            plugin_output = Path(output_dir)
        else:
            plugin_output = config.content_dir / api_config.output_dir

        plugin_output.mkdir(parents=True, exist_ok=True)

        # Create and run plugin
        plugin = registry.create(api_config.plugin, api_config.to_dict())
        result = plugin.generate(plugin_output)
        results.append(result)

    return results
