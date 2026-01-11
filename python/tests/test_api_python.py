"""Tests for cross_docs.api.plugins.python module."""

import json
from pathlib import Path

import pytest

from cross_docs.api.plugins.python import PythonAPIPlugin


class TestPythonAPIPlugin:
    """Tests for the PythonAPIPlugin class."""

    def test_plugin_name(self):
        """Plugin has the correct name."""
        plugin = PythonAPIPlugin()
        assert plugin.name == "python"

    def test_default_configuration(self):
        """Default configuration values are set."""
        plugin = PythonAPIPlugin()

        assert plugin.package is None
        assert plugin.docstring_parser == "google"
        assert plugin.include_private is False
        assert plugin.include_special is True
        assert plugin.search_paths is None

    def test_configure(self):
        """Configure sets options from config dict."""
        plugin = PythonAPIPlugin()
        plugin.configure({
            "package": "my_package",
            "docstring_parser": "numpy",
            "include_private": True,
            "include_special": False,
            "search_paths": ["src", "lib"],
            "prefix": "/api/v2",
        })

        assert plugin.package == "my_package"
        assert plugin.docstring_parser == "numpy"
        assert plugin.include_private is True
        assert plugin.include_special is False
        assert plugin.search_paths == ["src", "lib"]
        assert plugin.get_prefix() == "/api/v2"

    def test_get_prefix_default(self):
        """get_prefix returns /api by default."""
        plugin = PythonAPIPlugin()
        assert plugin.get_prefix() == "/api"

    def test_generate_without_package_raises(self, tmp_path: Path):
        """Generate raises ValueError if package is not configured."""
        plugin = PythonAPIPlugin()

        with pytest.raises(ValueError, match="Package name is required"):
            plugin.generate(tmp_path)

    def test_generate_creates_json_file(self, tmp_path: Path):
        """Generate creates a JSON file with API data."""
        plugin = PythonAPIPlugin()
        plugin.configure({"package": "cross_docs"})

        result = plugin.generate(tmp_path)

        assert result.output_path.exists()
        assert result.output_path.suffix == ".json"
        assert result.package_name == "cross_docs"

        # Verify JSON is valid
        data = json.loads(result.output_path.read_text())
        assert "name" in data
        assert data["name"] == "cross_docs"

    def test_generate_adds_metadata(self, tmp_path: Path):
        """Generate adds generator metadata to output."""
        plugin = PythonAPIPlugin()
        plugin.configure({"package": "cross_docs"})

        result = plugin.generate(tmp_path)
        data = json.loads(result.output_path.read_text())

        assert data["_generator"] == "cross-docs"
        assert data["_plugin"] == "python"
        assert data["_version"] == "1.0"

    def test_generate_returns_nav_items(self, tmp_path: Path):
        """Generate returns navigation structure."""
        plugin = PythonAPIPlugin()
        plugin.configure({"package": "cross_docs"})

        result = plugin.generate(tmp_path)

        # Should have navigation items
        assert isinstance(result.nav_items, list)

    def test_filter_private_members(self, tmp_path: Path):
        """Private members are filtered when include_private is False."""
        plugin = PythonAPIPlugin()
        plugin.configure({
            "package": "cross_docs",
            "include_private": False,
        })

        result = plugin.generate(tmp_path)
        data = json.loads(result.output_path.read_text())

        # Check that private members are not in the output
        members = data.get("members", {})
        for name in members:
            # Private members starting with _ (but not __dunder__) should be filtered
            if name.startswith("_") and not (name.startswith("__") and name.endswith("__")):
                pytest.fail(f"Private member {name} should have been filtered")

    def test_filter_special_members(self, tmp_path: Path):
        """Special members are filtered when include_special is False."""
        plugin = PythonAPIPlugin()
        plugin.configure({
            "package": "cross_docs",
            "include_special": False,
        })

        result = plugin.generate(tmp_path)
        data = json.loads(result.output_path.read_text())

        # Recursively check that no __dunder__ members exist
        def check_no_special(obj: dict) -> None:
            members = obj.get("members", {})
            for name in members:
                if name.startswith("__") and name.endswith("__"):
                    pytest.fail(f"Special member {name} should have been filtered")
                if isinstance(members[name], dict):
                    check_no_special(members[name])

        check_no_special(data)


class TestPythonAPIPluginSorting:
    """Tests for member sorting in PythonAPIPlugin."""

    def test_sort_members(self):
        """_sort_members sorts members consistently."""
        plugin = PythonAPIPlugin()

        data = {
            "members": {
                "zebra": {"name": "zebra", "path": "mod.zebra"},
                "alpha": {"name": "alpha", "path": "mod.alpha"},
                "beta": {"name": "beta", "path": "mod.beta"},
            }
        }

        result = plugin._sort_members(data)
        member_names = list(result["members"].keys())

        # Should be sorted by path/name
        assert member_names == ["alpha", "beta", "zebra"]

    def test_sort_members_nested(self):
        """_sort_members sorts nested members recursively."""
        plugin = PythonAPIPlugin()

        data = {
            "members": {
                "module": {
                    "name": "module",
                    "members": {
                        "z_func": {"name": "z_func"},
                        "a_func": {"name": "a_func"},
                    }
                }
            }
        }

        result = plugin._sort_members(data)
        nested_names = list(result["members"]["module"]["members"].keys())

        assert nested_names == ["a_func", "z_func"]


class TestPythonAPIPluginFiltering:
    """Tests for member filtering in PythonAPIPlugin."""

    def test_filter_private_keeps_dunder(self):
        """_filter_private keeps __dunder__ methods."""
        plugin = PythonAPIPlugin()

        data = {
            "members": {
                "__init__": {"name": "__init__"},
                "_private": {"name": "_private"},
                "public": {"name": "public"},
            }
        }

        result = plugin._filter_private(data)

        assert "__init__" in result["members"]
        assert "public" in result["members"]
        assert "_private" not in result["members"]

    def test_filter_special_removes_dunder(self):
        """_filter_special removes __dunder__ methods."""
        plugin = PythonAPIPlugin()

        data = {
            "members": {
                "__init__": {"name": "__init__"},
                "__str__": {"name": "__str__"},
                "public": {"name": "public"},
            }
        }

        result = plugin._filter_special(data)

        assert "public" in result["members"]
        assert "__init__" not in result["members"]
        assert "__str__" not in result["members"]


class TestPythonAPIPluginNavigation:
    """Tests for navigation generation in PythonAPIPlugin."""

    def test_generate_nav_structure(self):
        """_generate_nav creates proper navigation structure."""
        plugin = PythonAPIPlugin()
        plugin.configure({"package": "mypackage", "prefix": "/api"})

        data = {
            "name": "mypackage",
            "members": {
                "config": {"kind": "module", "name": "config"},
                "utils": {"kind": "module", "name": "utils"},
                "SomeClass": {"kind": "alias", "name": "SomeClass"},
            }
        }

        nav = plugin._generate_nav(data)

        # Should have MODULES and ALIASES sections
        section_titles = [s["title"] for s in nav]
        assert "MODULES" in section_titles
        assert "ALIASES" in section_titles

    def test_generate_nav_skips_private(self):
        """_generate_nav skips private members."""
        plugin = PythonAPIPlugin()
        plugin.configure({"package": "mypackage"})

        data = {
            "name": "mypackage",
            "members": {
                "public": {"kind": "module", "name": "public"},
                "_private": {"kind": "module", "name": "_private"},
            }
        }

        nav = plugin._generate_nav(data)

        # Get all items from all sections
        all_items = []
        for section in nav:
            all_items.extend([item["title"] for item in section.get("items", [])])

        assert "public" in all_items
        assert "_private" not in all_items

    def test_generate_nav_sorts_alphabetically(self):
        """_generate_nav sorts items alphabetically."""
        plugin = PythonAPIPlugin()
        plugin.configure({"package": "mypackage"})

        data = {
            "name": "mypackage",
            "members": {
                "zebra": {"kind": "module", "name": "zebra"},
                "alpha": {"kind": "module", "name": "alpha"},
                "middle": {"kind": "module", "name": "middle"},
            }
        }

        nav = plugin._generate_nav(data)

        # Find MODULES section
        modules_section = next((s for s in nav if s["title"] == "MODULES"), None)
        assert modules_section is not None

        item_titles = [item["title"] for item in modules_section["items"]]
        assert item_titles == ["alpha", "middle", "zebra"]
