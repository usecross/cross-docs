"""Command-line interface for cross-docs.

Provides commands for generating API documentation and other utilities.

Usage:
    cross-docs generate-api                    # Use pyproject.toml config
    cross-docs generate-api --package mypackage
    cross-docs generate-api --plugin python --package mypackage
"""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Optional

try:
    import click
except ImportError:
    # Click is optional - provide helpful error if missing
    def main() -> None:
        print("Error: click is required for the CLI.", file=sys.stderr)
        print("Install it with: pip install click", file=sys.stderr)
        sys.exit(1)
else:
    @click.group()
    @click.version_option(package_name="cross-docs")
    def main() -> None:
        """Cross-Docs CLI - Documentation framework built on Cross-Inertia."""
        pass

    @main.command("generate-api")
    @click.option(
        "--plugin",
        "-p",
        multiple=True,
        help="Plugin(s) to run. If not specified, runs all configured plugins.",
    )
    @click.option(
        "--package",
        help="Package name to document (overrides config).",
    )
    @click.option(
        "--output",
        "-o",
        type=click.Path(path_type=Path),
        help="Output directory (overrides config).",
    )
    @click.option(
        "--parser",
        type=click.Choice(["google", "numpy", "sphinx"]),
        default=None,
        help="Docstring parser style (for Python plugin).",
    )
    @click.option(
        "--config",
        "-c",
        type=click.Path(exists=True, path_type=Path),
        help="Path to config file (pyproject.toml or cross-docs.toml).",
    )
    def generate_api(
        plugin: tuple[str, ...],
        package: Optional[str],
        output: Optional[Path],
        parser: Optional[str],
        config: Optional[Path],
    ) -> None:
        """Generate API documentation from source code.

        By default, reads configuration from pyproject.toml under [[tool.cross-docs.api]].
        You can override settings with command-line options.

        Examples:

            # Use pyproject.toml configuration
            cross-docs generate-api

            # Override package name
            cross-docs generate-api --package my_package

            # Use specific plugin
            cross-docs generate-api --plugin python --package my_package

            # Custom output directory
            cross-docs generate-api --output docs/api
        """
        from cross_docs.config import APIPluginConfig, load_config

        # Load configuration
        docs_config = load_config(config)

        # Handle case where no API config exists but CLI args provided
        api_configs = docs_config.api or []

        if not api_configs and package:
            # Create a config from CLI args
            api_configs = [
                APIPluginConfig(
                    plugin="python",
                    package=package,
                    docstring_parser=parser or "google",
                )
            ]

        if not api_configs:
            click.echo(
                "Error: No API plugins configured.",
                err=True,
            )
            click.echo(
                "Add [[tool.cross-docs.api]] to pyproject.toml or use --package.",
                err=True,
            )
            sys.exit(1)

        # Filter by plugin if specified
        if plugin:
            api_configs = [c for c in api_configs if c.plugin in plugin]
            if not api_configs:
                click.echo(
                    f"Error: No configuration found for plugin(s): {', '.join(plugin)}",
                    err=True,
                )
                sys.exit(1)

        # Override settings from CLI
        for api_config in api_configs:
            if package:
                api_config.package = package
            if parser:
                api_config.docstring_parser = parser

        # Import registry lazily to avoid import errors if griffe not installed
        try:
            from cross_docs.api.registry import registry
        except ImportError as e:
            click.echo(f"Error: {e}", err=True)
            sys.exit(1)

        # Generate docs for each plugin
        results = []
        for api_config in api_configs:
            click.echo(f"Generating API docs with {api_config.plugin} plugin...")

            # Determine output directory for this plugin
            # CLI --output flag overrides, otherwise use config's output_dir
            if output:
                plugin_output = output
            else:
                plugin_output = docs_config.content_dir / api_config.output_dir
            plugin_output.mkdir(parents=True, exist_ok=True)

            try:
                plugin_instance = registry.create(api_config.plugin, api_config.to_dict())
                result = plugin_instance.generate(plugin_output)
                results.append(result)
                click.echo(f"  ✓ Generated: {result.output_path}")
            except ValueError as e:
                click.echo(f"  ✗ Error: {e}", err=True)
                sys.exit(1)
            except ImportError as e:
                click.echo(f"  ✗ Error: {e}", err=True)
                click.echo(
                    "  Install the required dependencies with: pip install cross-docs[api]",
                    err=True,
                )
                sys.exit(1)

        click.echo(f"\nGenerated {len(results)} API documentation file(s).")

    @main.command("list-plugins")
    def list_plugins() -> None:
        """List available API documentation plugins."""
        try:
            from cross_docs.api.registry import registry

            plugins = registry.list_plugins()

            if not plugins:
                click.echo("No plugins available.")
                click.echo("Install cross-docs[api] for Python API documentation.")
            else:
                click.echo("Available plugins:")
                for name in plugins:
                    click.echo(f"  - {name}")
        except ImportError:
            click.echo("No plugins available.")
            click.echo("Install cross-docs[api] for Python API documentation.")


if __name__ == "__main__":
    main()
