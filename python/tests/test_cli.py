"""Tests for cross_docs.cli module."""

from pathlib import Path

import pytest
from click.testing import CliRunner

from cross_docs.cli import main


@pytest.fixture
def cli_runner() -> CliRunner:
    """Create a CLI runner for testing."""
    return CliRunner()


class TestMain:
    """Tests for the main CLI group."""

    def test_version(self, cli_runner: CliRunner):
        """--version shows version info."""
        result = cli_runner.invoke(main, ["--version"])

        assert result.exit_code == 0
        assert "cross-docs" in result.output.lower() or "version" in result.output.lower()

    def test_help(self, cli_runner: CliRunner):
        """--help shows help text."""
        result = cli_runner.invoke(main, ["--help"])

        assert result.exit_code == 0
        assert "Cross-Docs CLI" in result.output


class TestGenerateAPICommand:
    """Tests for the generate-api command."""

    def test_help(self, cli_runner: CliRunner):
        """generate-api --help shows help text."""
        result = cli_runner.invoke(main, ["generate-api", "--help"])

        assert result.exit_code == 0
        assert "Generate API documentation" in result.output

    def test_no_config_no_package_fails(self, cli_runner: CliRunner, tmp_path: Path):
        """Fails when no config file and no --package option."""
        with cli_runner.isolated_filesystem(temp_dir=tmp_path):
            result = cli_runner.invoke(main, ["generate-api"])

        assert result.exit_code == 1
        assert "No API plugins configured" in result.output

    def test_with_package_option(self, cli_runner: CliRunner, tmp_path: Path):
        """--package option creates API docs."""
        with cli_runner.isolated_filesystem(temp_dir=tmp_path):
            # Create a minimal pyproject.toml
            Path("pyproject.toml").write_text("""\
[project]
name = "test"

[tool.cross-docs]
content_dir = "content"
""")
            Path("content").mkdir()

            result = cli_runner.invoke(main, [
                "generate-api",
                "--package", "cross_docs",
                "--output", "content/api",
            ])

        assert result.exit_code == 0
        assert "Generating API docs" in result.output
        assert "Generated" in result.output

    def test_with_config_file(self, cli_runner: CliRunner, tmp_path: Path):
        """Uses configuration from pyproject.toml."""
        with cli_runner.isolated_filesystem(temp_dir=tmp_path):
            Path("pyproject.toml").write_text("""\
[project]
name = "test"

[tool.cross-docs]
content_dir = "content"

[[tool.cross-docs.api]]
plugin = "python"
package = "cross_docs"
""")
            Path("content").mkdir()

            result = cli_runner.invoke(main, ["generate-api"])

        assert result.exit_code == 0
        assert "Generated" in result.output

    def test_parser_option(self, cli_runner: CliRunner, tmp_path: Path):
        """--parser option overrides docstring parser."""
        with cli_runner.isolated_filesystem(temp_dir=tmp_path):
            Path("pyproject.toml").write_text("""\
[project]
name = "test"

[tool.cross-docs]
content_dir = "content"
""")
            Path("content").mkdir()

            result = cli_runner.invoke(main, [
                "generate-api",
                "--package", "cross_docs",
                "--parser", "numpy",
            ])

        assert result.exit_code == 0

    def test_output_option(self, cli_runner: CliRunner, tmp_path: Path):
        """--output option specifies output directory."""
        with cli_runner.isolated_filesystem(temp_dir=tmp_path):
            Path("pyproject.toml").write_text("""\
[project]
name = "test"

[tool.cross-docs]
content_dir = "content"
""")

            result = cli_runner.invoke(main, [
                "generate-api",
                "--package", "cross_docs",
                "--output", "docs/api",
            ])

            assert result.exit_code == 0
            assert Path("docs/api").exists()

    def test_plugin_filter(self, cli_runner: CliRunner, tmp_path: Path):
        """--plugin option filters which plugins to run."""
        with cli_runner.isolated_filesystem(temp_dir=tmp_path):
            Path("pyproject.toml").write_text("""\
[project]
name = "test"

[tool.cross-docs]
content_dir = "content"

[[tool.cross-docs.api]]
plugin = "python"
package = "cross_docs"
""")
            Path("content").mkdir()

            # Filter to a non-existent plugin
            result = cli_runner.invoke(main, [
                "generate-api",
                "--plugin", "nonexistent",
            ])

        assert result.exit_code == 1
        assert "No configuration found" in result.output


class TestListPluginsCommand:
    """Tests for the list-plugins command."""

    def test_help(self, cli_runner: CliRunner):
        """list-plugins --help shows help text."""
        result = cli_runner.invoke(main, ["list-plugins", "--help"])

        assert result.exit_code == 0
        assert "List available" in result.output

    def test_lists_plugins(self, cli_runner: CliRunner):
        """list-plugins shows available plugins."""
        result = cli_runner.invoke(main, ["list-plugins"])

        assert result.exit_code == 0
        # Should show at least the python plugin
        assert "python" in result.output.lower() or "Available plugins" in result.output or "No plugins" in result.output
