"""Cross-docs autopub plugin for releasing both Python and JS packages."""

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

__all__ = ["CrossDocsPlugin"]


class CrossDocsPluginConfig(BaseModel):
    """Configuration for the cross-docs monorepo plugin."""

    python_path: str = "python"
    """Path to the Python package directory."""

    js_path: str = "js"
    """Path to the JS package directory."""

    build_command: str = "build"
    """The npm script to run for building JS."""


class CrossDocsPlugin(AutopubPlugin, AutopubPackageManagerPlugin):
    """Autopub plugin for cross-docs monorepo.

    Handles both Python (PyPI) and JS (npm) package releases with
    OIDC trusted publishing support.
    """

    id = "cross_docs"
    Config = CrossDocsPluginConfig

    # -------------------------------------------------------------------------
    # Path helpers
    # -------------------------------------------------------------------------

    @property
    def python_path(self) -> pathlib.Path:
        return pathlib.Path(self.config.python_path)

    @property
    def js_path(self) -> pathlib.Path:
        return pathlib.Path(self.config.js_path)

    @property
    def pyproject_path(self) -> pathlib.Path:
        return self.python_path / "pyproject.toml"

    @property
    def package_json_path(self) -> pathlib.Path:
        return self.js_path / "package.json"

    # -------------------------------------------------------------------------
    # Version reading
    # -------------------------------------------------------------------------

    def _get_python_version(self) -> str:
        """Get version from pyproject.toml."""
        content = self.pyproject_path.read_text()
        config = tomlkit.parse(content)
        try:
            return config["tool"]["poetry"]["version"]  # type: ignore
        except KeyError:
            return config["project"]["version"]  # type: ignore

    def _get_js_version(self) -> str:
        """Get version from package.json."""
        content = self.package_json_path.read_text()
        return json.loads(content)["version"]

    # -------------------------------------------------------------------------
    # Version updating
    # -------------------------------------------------------------------------

    def _update_python_version(self, new_version: str) -> None:
        """Update version in pyproject.toml and __init__.py."""
        # Update pyproject.toml
        content = self.pyproject_path.read_text()
        config = tomlkit.parse(content)
        try:
            config["tool"]["poetry"]["version"] = new_version  # type: ignore
        except KeyError:
            config["project"]["version"] = new_version  # type: ignore
        self.pyproject_path.write_text(tomlkit.dumps(config))

        # Update __init__.py
        init_path = self.python_path / "cross_docs" / "__init__.py"
        if init_path.exists():
            content = init_path.read_text()
            pattern = r'__version__\s*=\s*["\'][\d.]+["\']'
            if re.search(pattern, content):
                new_content = re.sub(pattern, f'__version__ = "{new_version}"', content)
                init_path.write_text(new_content)

    def _update_js_version(self, new_version: str) -> None:
        """Update version in package.json."""
        content = self.package_json_path.read_text()
        package = json.loads(content)
        package["version"] = new_version
        self.package_json_path.write_text(json.dumps(package, indent=2) + "\n")

    def _update_root_version(self, new_version: str) -> None:
        """Update version in root pyproject.toml."""
        root_pyproject = pathlib.Path("pyproject.toml")
        if root_pyproject.exists():
            content = root_pyproject.read_text()
            config = tomlkit.parse(content)
            try:
                config["project"]["version"] = new_version  # type: ignore
                root_pyproject.write_text(tomlkit.dumps(config))
            except KeyError:
                pass

    # -------------------------------------------------------------------------
    # Autopub hooks
    # -------------------------------------------------------------------------

    def post_check(self, release_info: ReleaseInfo) -> None:
        """Calculate the new version based on release type."""
        bump_type = {"major": 0, "minor": 1, "patch": 2}[release_info.release_type]

        # Use Python version as source of truth
        current_version = self._get_python_version()
        version = Version(current_version)

        release_info.previous_version = str(version)
        release_info.version = version.bump(bump_type).serialize()

    def post_prepare(self, release_info: ReleaseInfo) -> None:
        """Update all version files."""
        assert release_info.version is not None
        new_version = release_info.version

        # Update all version files
        self._update_python_version(new_version)
        self._update_js_version(new_version)
        self._update_root_version(new_version)

        # Regenerate lockfiles if tools are available
        if self._is_uv_available():
            subprocess.run(
                ["uv", "lock"],
                check=True,
                cwd=self.python_path.resolve(),
            )

        if self._is_bun_available():
            subprocess.run(
                ["bun", "install"],
                check=True,
                cwd=self.js_path.resolve(),
            )

    # -------------------------------------------------------------------------
    # Build and publish
    # -------------------------------------------------------------------------

    def build(self) -> None:
        """Build both Python and JS packages."""
        # Build Python with explicit output directory to avoid workspace issues
        self._run_command(["uv", "build", "--out-dir", "dist"], cwd=self.python_path)

        # Build JS
        self._run_command(
            ["bun", "run", self.config.build_command],
            cwd=self.js_path,
        )

    def publish(self, repository: str | None = None, **kwargs: Any) -> None:
        """Publish both packages with OIDC trusted publishing."""
        # Publish Python to PyPI with trusted publishing
        self._run_command(
            ["uv", "publish", "--trusted-publishing", "always"],
            cwd=self.python_path,
        )

        # Publish JS to npm with provenance (OIDC)
        # Use npm instead of bun for OIDC provenance support
        env = os.environ.copy()
        env["NPM_CONFIG_PROVENANCE"] = "true"
        self._run_command(
            ["npm", "publish", "--provenance", "--access", "public"],
            cwd=self.js_path,
            env=env,
        )

    # -------------------------------------------------------------------------
    # Helpers
    # -------------------------------------------------------------------------

    def _is_uv_available(self) -> bool:
        try:
            subprocess.run(["uv", "--version"], check=True, capture_output=True)
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            return False

    def _is_bun_available(self) -> bool:
        try:
            subprocess.run(["bun", "--version"], check=True, capture_output=True)
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            return False

    def _run_command(
        self,
        command: list[str],
        cwd: pathlib.Path,
        env: dict[str, str] | None = None,
    ) -> None:
        """Run a command in a directory."""
        try:
            subprocess.run(
                command,
                check=True,
                cwd=cwd.resolve(),
                env=env or os.environ.copy(),
            )
        except subprocess.CalledProcessError as e:
            from autopub.exceptions import CommandFailed

            raise CommandFailed(command=command, returncode=e.returncode) from e
