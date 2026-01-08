"""Tests for cross_docs.config module."""

from pathlib import Path

from cross_docs.config import (
    APIPluginConfig,
    DocsConfig,
    HomeConfig,
    DocSet,
    load_config,
)


class TestLoadConfig:
    """Tests for the load_config function."""

    def test_from_pyproject(self, sample_pyproject: Path):
        """Loads config from pyproject.toml."""
        config = load_config(sample_pyproject)

        assert config.prefix == "/documentation"
        assert config.index_page == "intro"
        assert config.github_url == "https://github.com/test/repo"
        # content_dir is relative to config file
        assert config.content_dir == sample_pyproject.parent / "docs"

    def test_with_defaults(self, tmp_path: Path):
        """Default values are used when config file doesn't exist."""
        config = load_config(
            tmp_path / "nonexistent.toml",
            defaults={"prefix": "/custom", "index_page": "home"},
        )

        assert config.prefix == "/custom"
        assert config.index_page == "home"

    def test_home_config_loaded(self, sample_pyproject: Path):
        """Home config is loaded as HomeConfig object."""
        config = load_config(sample_pyproject)

        assert isinstance(config.home, HomeConfig)
        assert config.home.enabled is True
        assert config.home.title == "Test Project"
        assert config.home.tagline == "A test project"

    def test_missing_file_returns_defaults(self, tmp_path: Path):
        """Missing config file returns default DocsConfig."""
        config = load_config(tmp_path / "missing.toml")

        assert config.prefix == "/docs"
        assert config.index_page == "introduction"
        assert config.content_dir == Path("content")


class TestDocsConfig:
    """Tests for the DocsConfig dataclass."""

    def test_default_values(self):
        """Default values are set correctly."""
        config = DocsConfig()

        assert config.content_dir == Path("content")
        assert config.prefix == "/docs"
        assert config.index_page == "introduction"
        assert config.section_order is None
        assert config.logo_url is None
        assert config.github_url is None
        assert config.component == "docs/DocsPage"
        assert config.enable_markdown_response is True
        assert config.doc_sets is None

    def test_custom_values(self):
        """Custom values override defaults."""
        config = DocsConfig(
            content_dir=Path("/custom/path"),
            prefix="/api",
            index_page="getting-started",
            github_url="https://github.com/org/repo",
        )

        assert config.content_dir == Path("/custom/path")
        assert config.prefix == "/api"
        assert config.index_page == "getting-started"
        assert config.github_url == "https://github.com/org/repo"


class TestHomeConfig:
    """Tests for the HomeConfig dataclass."""

    def test_default_values(self):
        """Default values are set correctly."""
        config = HomeConfig()

        assert config.enabled is False
        assert config.component == "HomePage"
        assert config.title == ""
        assert config.tagline == ""
        assert config.cta_text == "Get Started"
        assert config.cta_href == "/docs/"
        assert config.features == []

    def test_custom_values(self):
        """Custom values override defaults."""
        config = HomeConfig(
            enabled=True,
            title="My Project",
            tagline="Build great things",
            features=[{"title": "Fast", "description": "Very fast"}],
        )

        assert config.enabled is True
        assert config.title == "My Project"
        assert config.tagline == "Build great things"
        assert len(config.features) == 1


class TestDocSet:
    """Tests for the DocSet dataclass."""

    def test_default_values(self):
        """Default values are set correctly."""
        docset = DocSet(name="Main")

        assert docset.name == "Main"
        assert docset.slug == ""
        assert docset.description == ""
        assert docset.icon is None
        assert docset.icon_url is None
        assert docset.content_subdir == ""
        assert docset.index_page == "introduction"
        assert docset.section_order is None

    def test_custom_values(self):
        """Custom values override defaults."""
        docset = DocSet(
            name="Django",
            slug="django",
            description="Django integration",
            icon="🎸",
            content_subdir="django-docs",
            index_page="overview",
            section_order=["Guide", "API"],
        )

        assert docset.name == "Django"
        assert docset.slug == "django"
        assert docset.description == "Django integration"
        assert docset.icon == "🎸"
        assert docset.content_subdir == "django-docs"
        assert docset.section_order == ["Guide", "API"]


class TestAPIPluginConfig:
    """Tests for the APIPluginConfig dataclass."""

    def test_default_values(self):
        """Default values are set correctly."""
        config = APIPluginConfig(plugin="python")

        assert config.plugin == "python"
        assert config.package is None
        assert config.output_dir == "api"
        assert config.prefix == "/api"
        assert config.docstring_parser == "google"
        assert config.include_private is False
        assert config.include_special is True
        assert config.search_paths is None
        assert config.component == "api/APIPage"

    def test_custom_values(self):
        """Custom values override defaults."""
        config = APIPluginConfig(
            plugin="python",
            package="my_package",
            output_dir="docs/api",
            prefix="/api/python",
            docstring_parser="numpy",
            include_private=True,
            include_special=False,
            search_paths=["src"],
            component="CustomAPIPage",
        )

        assert config.plugin == "python"
        assert config.package == "my_package"
        assert config.output_dir == "docs/api"
        assert config.prefix == "/api/python"
        assert config.docstring_parser == "numpy"
        assert config.include_private is True
        assert config.include_special is False
        assert config.search_paths == ["src"]
        assert config.component == "CustomAPIPage"

    def test_to_dict(self):
        """to_dict returns all configuration options."""
        config = APIPluginConfig(
            plugin="python",
            package="my_package",
            docstring_parser="numpy",
        )

        result = config.to_dict()

        assert result["plugin"] == "python"
        assert result["package"] == "my_package"
        assert result["docstring_parser"] == "numpy"
        assert result["include_private"] is False
        assert result["include_special"] is True
        assert "prefix" in result
        assert "output_dir" in result


class TestLoadConfigWithAPI:
    """Tests for load_config with API configuration."""

    def test_api_config_loaded(self, tmp_path: Path):
        """API config is loaded as list of APIPluginConfig objects."""
        pyproject = tmp_path / "pyproject.toml"
        pyproject.write_text("""\
[project]
name = "test-project"

[tool.cross-docs]
content_dir = "content"

[[tool.cross-docs.api]]
plugin = "python"
package = "my_package"
docstring_parser = "google"
""")

        config = load_config(pyproject)

        assert config.api is not None
        assert len(config.api) == 1
        assert isinstance(config.api[0], APIPluginConfig)
        assert config.api[0].plugin == "python"
        assert config.api[0].package == "my_package"
        assert config.api[0].docstring_parser == "google"

    def test_multiple_api_configs(self, tmp_path: Path):
        """Multiple API configs can be loaded."""
        pyproject = tmp_path / "pyproject.toml"
        pyproject.write_text("""\
[project]
name = "test-project"

[tool.cross-docs]
content_dir = "content"

[[tool.cross-docs.api]]
plugin = "python"
package = "package_one"

[[tool.cross-docs.api]]
plugin = "python"
package = "package_two"
prefix = "/api/v2"
""")

        config = load_config(pyproject)

        assert config.api is not None
        assert len(config.api) == 2
        assert config.api[0].package == "package_one"
        assert config.api[1].package == "package_two"
        assert config.api[1].prefix == "/api/v2"
