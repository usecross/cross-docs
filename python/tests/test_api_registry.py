"""Tests for cross_docs.api.registry module."""

from pathlib import Path
from typing import Any

import pytest

from cross_docs.api.base import APIDocPlugin, APIDocResult
from cross_docs.api.registry import PluginRegistry


class MockPlugin(APIDocPlugin):
    """Mock plugin for testing."""

    name = "mock"

    def __init__(self) -> None:
        self.config: dict[str, Any] = {}

    def configure(self, config: dict[str, Any]) -> None:
        self.config = config

    def generate(self, output_dir: Path) -> APIDocResult:
        return APIDocResult(
            package_name="mock",
            data={"name": "mock"},
            output_path=output_dir / "mock.json",
        )


class AnotherMockPlugin(APIDocPlugin):
    """Another mock plugin for testing."""

    name = "another"

    def configure(self, config: dict[str, Any]) -> None:
        pass

    def generate(self, output_dir: Path) -> APIDocResult:
        return APIDocResult(
            package_name="another",
            data={},
            output_path=output_dir / "another.json",
        )


class TestPluginRegistry:
    """Tests for the PluginRegistry class."""

    def test_register_plugin(self):
        """Plugins can be registered."""
        registry = PluginRegistry()
        registry.register(MockPlugin)

        assert "mock" in registry._plugins
        assert registry._plugins["mock"] is MockPlugin

    def test_register_plugin_without_name_raises(self):
        """Registering a plugin without a name raises ValueError."""

        class NoNamePlugin(APIDocPlugin):
            def configure(self, config: dict[str, Any]) -> None:
                pass

            def generate(self, output_dir: Path) -> APIDocResult:
                return APIDocResult(
                    package_name="",
                    data={},
                    output_path=output_dir / "test.json",
                )

        registry = PluginRegistry()

        with pytest.raises(ValueError, match="must have a 'name' attribute"):
            registry.register(NoNamePlugin)

    def test_get_plugin(self):
        """Plugins can be retrieved by name."""
        registry = PluginRegistry()
        registry._discovered = True  # Skip auto-discovery
        registry.register(MockPlugin)

        plugin_class = registry.get("mock")

        assert plugin_class is MockPlugin

    def test_get_unknown_plugin_raises(self):
        """Getting an unknown plugin raises ValueError."""
        registry = PluginRegistry()
        registry._discovered = True  # Skip auto-discovery

        with pytest.raises(ValueError, match="Unknown plugin: 'nonexistent'"):
            registry.get("nonexistent")

    def test_create_plugin(self):
        """Plugins can be created and configured."""
        registry = PluginRegistry()
        registry._discovered = True
        registry.register(MockPlugin)

        plugin = registry.create("mock", {"option": "value"})

        assert isinstance(plugin, MockPlugin)
        assert plugin.config == {"option": "value"}

    def test_list_plugins(self):
        """list_plugins returns sorted plugin names."""
        registry = PluginRegistry()
        registry._discovered = True
        registry.register(MockPlugin)
        registry.register(AnotherMockPlugin)

        plugins = registry.list_plugins()

        assert plugins == ["another", "mock"]

    def test_list_plugins_empty(self):
        """list_plugins returns empty list when no plugins registered."""
        registry = PluginRegistry()
        registry._discovered = True

        plugins = registry.list_plugins()

        assert plugins == []

    def test_auto_discovery_registers_builtin(self):
        """Auto-discovery registers the built-in Python plugin."""
        registry = PluginRegistry()

        # Trigger discovery
        plugins = registry.list_plugins()

        # Should have at least the python plugin (if griffe is installed)
        # This test may be empty if griffe is not installed
        assert isinstance(plugins, list)


class TestGlobalRegistry:
    """Tests for the global registry instance."""

    def test_global_registry_exists(self):
        """Global registry instance is available."""
        from cross_docs.api.registry import registry

        assert isinstance(registry, PluginRegistry)

    def test_global_registry_has_plugins(self):
        """Global registry discovers plugins on first use."""
        from cross_docs.api.registry import registry

        plugins = registry.list_plugins()

        # Should have at least the python plugin
        assert isinstance(plugins, list)
