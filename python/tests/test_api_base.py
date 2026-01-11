"""Tests for cross_docs.api.base module."""

from pathlib import Path
from typing import Any

from cross_docs.api.base import APIDocPlugin, APIDocResult


class TestAPIDocResult:
    """Tests for the APIDocResult dataclass."""

    def test_required_fields(self, tmp_path: Path):
        """Required fields are set correctly."""
        result = APIDocResult(
            package_name="my_package",
            data={"name": "my_package", "kind": "module"},
            output_path=tmp_path / "my_package.json",
        )

        assert result.package_name == "my_package"
        assert result.data == {"name": "my_package", "kind": "module"}
        assert result.output_path == tmp_path / "my_package.json"
        assert result.nav_items == []

    def test_with_nav_items(self, tmp_path: Path):
        """nav_items can be set."""
        nav = [
            {"title": "MODULES", "items": [{"title": "config", "href": "/api/config"}]}
        ]
        result = APIDocResult(
            package_name="my_package",
            data={},
            output_path=tmp_path / "my_package.json",
            nav_items=nav,
        )

        assert result.nav_items == nav
        assert len(result.nav_items) == 1
        assert result.nav_items[0]["title"] == "MODULES"


class DummyPlugin(APIDocPlugin):
    """A dummy plugin for testing the abstract base class."""

    name = "dummy"

    def __init__(self) -> None:
        self.configured = False
        self.config: dict[str, Any] = {}

    def configure(self, config: dict[str, Any]) -> None:
        self.configured = True
        self.config = config

    def generate(self, output_dir: Path) -> APIDocResult:
        output_path = output_dir / "dummy.json"
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text('{"name": "dummy"}')
        return APIDocResult(
            package_name="dummy",
            data={"name": "dummy"},
            output_path=output_path,
        )


class TestAPIDocPlugin:
    """Tests for the APIDocPlugin abstract base class."""

    def test_plugin_name(self):
        """Plugin has a name attribute."""
        plugin = DummyPlugin()
        assert plugin.name == "dummy"

    def test_configure(self):
        """configure() is called with config dict."""
        plugin = DummyPlugin()
        plugin.configure({"option1": "value1", "option2": 42})

        assert plugin.configured is True
        assert plugin.config == {"option1": "value1", "option2": 42}

    def test_generate(self, tmp_path: Path):
        """generate() produces an APIDocResult."""
        plugin = DummyPlugin()
        plugin.configure({})

        result = plugin.generate(tmp_path)

        assert isinstance(result, APIDocResult)
        assert result.package_name == "dummy"
        assert result.output_path.exists()
        assert result.output_path.read_text() == '{"name": "dummy"}'

    def test_get_prefix_default(self):
        """get_prefix() returns /api by default."""
        plugin = DummyPlugin()
        assert plugin.get_prefix() == "/api"
