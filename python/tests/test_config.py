"""Tests for cross_docs.config module."""

from pathlib import Path

from cross_docs.config import (
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
