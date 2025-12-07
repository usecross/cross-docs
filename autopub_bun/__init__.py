from __future__ import annotations

import json
import os
import pathlib
import re
import subprocess
from typing import Any

import tomlkit
from dunamai import Version
from pydantic import BaseModel

from autopub.plugins import AutopubPackageManagerPlugin, AutopubPlugin
from autopub.types import ReleaseInfo

__all__ = ["BunPlugin", "UvMonorepoPlugin"]


class BunPluginConfig(BaseModel):
    """Configuration for the Bun plugin."""

    package_path: str = "."
    """Path to the package directory containing package.json."""

    build_command: str = "build"
    """The npm script to run for building (e.g., 'build' runs 'bun run build')."""

    registry: str | None = None
    """Optional registry URL for publishing."""


class BunPlugin(AutopubPlugin, AutopubPackageManagerPlugin):
    """Autopub plugin for building and publishing npm packages using Bun."""

    id = "bun"
    Config = BunPluginConfig

    @property
    def package_json_path(self) -> pathlib.Path:
        """Get the path to package.json."""
        return pathlib.Path(self.config.package_path) / "package.json"

    @property
    def package_json(self) -> dict[str, Any]:
        """Read and parse package.json."""
        content = self.package_json_path.read_text()
        return json.loads(content)

    def _get_version(self) -> str:
        """Get the current version from package.json."""
        return self.package_json["version"]

    def _update_version(self, new_version: str) -> None:
        """Update the version in package.json."""
        package = self.package_json
        package["version"] = new_version

        self.package_json_path.write_text(
            json.dumps(package, indent=2) + "\n"
        )

    def post_check(self, release_info: ReleaseInfo) -> None:
        """Calculate the new version based on release type."""
        bump_type = {"major": 0, "minor": 1, "patch": 2}[release_info.release_type]

        current_version = self._get_version()
        version = Version(current_version)

        release_info.previous_version = str(version)
        release_info.version = version.bump(bump_type).serialize()

    def post_prepare(self, release_info: ReleaseInfo) -> None:
        """Update package.json with the new version and regenerate lockfile."""
        assert release_info.version is not None

        self._update_version(release_info.version)

        # Regenerate bun.lock after version bump (only if bun is available)
        cwd = pathlib.Path(self.config.package_path).resolve()
        if self._is_bun_available():
            subprocess.run(["bun", "install"], check=True, cwd=cwd)

    def _is_bun_available(self) -> bool:
        """Check if bun is available in PATH."""
        try:
            subprocess.run(
                ["bun", "--version"],
                check=True,
                capture_output=True,
            )
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            return False

    def build(self) -> None:
        """Build the package using Bun."""
        cwd = pathlib.Path(self.config.package_path).resolve()
        self.run_command_in_dir(["bun", "run", self.config.build_command], cwd)

    def publish(self, repository: str | None = None, **kwargs: Any) -> None:
        """Publish the package to npm using Bun."""
        cwd = pathlib.Path(self.config.package_path).resolve()
        cmd = ["bun", "publish", "--access", "public"]

        if repository or self.config.registry:
            registry = repository or self.config.registry
            cmd.extend(["--registry", registry])

        self.run_command_in_dir(cmd, cwd)

    def run_command_in_dir(self, command: list[str], cwd: pathlib.Path) -> None:
        """Run a command in a specific directory."""
        try:
            subprocess.run(command, check=True, env=os.environ.copy(), cwd=cwd)
        except subprocess.CalledProcessError as e:
            from autopub.exceptions import CommandFailed
            raise CommandFailed(command=command, returncode=e.returncode) from e


class UvMonorepoPluginConfig(BaseModel):
    """Configuration for the UV monorepo plugin."""

    package_path: str = "."
    """Path to the package directory containing pyproject.toml."""


class UvMonorepoPlugin(AutopubPlugin, AutopubPackageManagerPlugin):
    """Autopub plugin for building and publishing Python packages in a monorepo using uv."""

    id = "uv_monorepo"
    Config = UvMonorepoPluginConfig

    @property
    def pyproject_path(self) -> pathlib.Path:
        """Get the path to pyproject.toml."""
        return pathlib.Path(self.config.package_path) / "pyproject.toml"

    @property
    def pyproject_config(self) -> tomlkit.TOMLDocument:
        """Read and parse pyproject.toml."""
        content = self.pyproject_path.read_text()
        return tomlkit.parse(content)

    def _get_version(self, config: tomlkit.TOMLDocument) -> str:
        """Get the current version from pyproject.toml."""
        try:
            return config["tool"]["poetry"]["version"]  # type: ignore
        except KeyError:
            return config["project"]["version"]  # type: ignore

    def _update_version(self, config: tomlkit.TOMLDocument, new_version: str) -> None:
        """Update the version in pyproject.toml."""
        try:
            config["tool"]["poetry"]["version"] = new_version  # type: ignore
        except KeyError:
            config["project"]["version"] = new_version  # type: ignore

    def _get_package_name(self, config: tomlkit.TOMLDocument) -> str | None:
        """Get the package name from pyproject.toml."""
        try:
            return config["tool"]["poetry"]["name"]  # type: ignore
        except KeyError:
            try:
                return config["project"]["name"]  # type: ignore
            except KeyError:
                return None

    def _find_package_init(self, package_name: str) -> pathlib.Path | None:
        """Find the package's __init__.py file."""
        package_dir = package_name.replace("-", "_")
        base_path = pathlib.Path(self.config.package_path)

        possible_paths = [
            base_path / "src" / package_dir / "__init__.py",
            base_path / package_dir / "__init__.py",
            base_path / "src" / "__init__.py",
        ]

        for path in possible_paths:
            if path.exists():
                return path

        return None

    def _update_init_version(self, new_version: str) -> None:
        """Update __version__ in the package's __init__.py file if it exists."""
        config = self.pyproject_config
        package_name = self._get_package_name(config)

        if not package_name:
            return

        init_file = self._find_package_init(package_name)

        if not init_file:
            return

        content = init_file.read_text()

        pattern = r'__version__\s*=\s*["\'][\d.]+["\']'

        if not re.search(pattern, content):
            return

        new_content = re.sub(pattern, f'__version__ = "{new_version}"', content)
        init_file.write_text(new_content)

    def post_check(self, release_info: ReleaseInfo) -> None:
        """Calculate the new version based on release type."""
        config = self.pyproject_config

        bump_type = {"major": 0, "minor": 1, "patch": 2}[release_info.release_type]

        version = Version(self._get_version(config))

        release_info.previous_version = str(version)
        release_info.version = version.bump(bump_type).serialize()

    def post_prepare(self, release_info: ReleaseInfo) -> None:
        """Update pyproject.toml with the new version and regenerate lockfile."""
        config = self.pyproject_config

        assert release_info.version is not None

        self._update_version(config, release_info.version)

        self.pyproject_path.write_text(tomlkit.dumps(config))

        # Update __version__ in __init__.py if it exists
        self._update_init_version(release_info.version)

        # Regenerate uv.lock after version bump (only if uv is available)
        cwd = pathlib.Path(self.config.package_path).resolve()
        if self._is_uv_available():
            subprocess.run(["uv", "lock"], check=True, cwd=cwd)

    def _is_uv_available(self) -> bool:
        """Check if uv is available in PATH."""
        try:
            subprocess.run(
                ["uv", "--version"],
                check=True,
                capture_output=True,
            )
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            return False

    def build(self) -> None:
        """Build the package using uv."""
        cwd = pathlib.Path(self.config.package_path).resolve()
        self.run_command_in_dir(["uv", "build"], cwd)

    def publish(self, repository: str | None = None, **kwargs: Any) -> None:
        """Publish the package to PyPI using uv."""
        cwd = pathlib.Path(self.config.package_path).resolve()
        additional_args: list[str] = []

        if repository:
            raise ValueError("Custom repository not yet implemented")

        if publish_url := kwargs.get("publish_url"):
            additional_args.extend(["--publish-url", publish_url])

        if username := kwargs.get("username"):
            additional_args.extend(["--username", username])

        if password := kwargs.get("password"):
            additional_args.extend(["--password", password])

        if token := kwargs.get("token"):
            additional_args.extend(["--token", token])

        self.run_command_in_dir(["uv", "publish", *additional_args], cwd)

    def run_command_in_dir(self, command: list[str], cwd: pathlib.Path) -> None:
        """Run a command in a specific directory."""
        try:
            subprocess.run(command, check=True, env=os.environ.copy(), cwd=cwd)
        except subprocess.CalledProcessError as e:
            from autopub.exceptions import CommandFailed
            raise CommandFailed(command=command, returncode=e.returncode) from e
