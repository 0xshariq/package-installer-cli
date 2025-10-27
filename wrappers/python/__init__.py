"""
@0xshariq/package-installer

A powerful CLI tool to bootstrap projects with pre-configured templates and features.
Supports multiple frameworks including React, Next.js, Express.js, Django, Flask, and more.
"""

__version__ = "1.0.0"
__author__ = "0xshariq"
__email__ = "khanshariq92213@gmail.com"
__description__ = "A powerful CLI tool to bootstrap projects with pre-configured templates and features"
__url__ = "https://github.com/0xshariq/py-package-installer-cli"

from .cli import PackageInstaller, main

__all__ = ["PackageInstaller", "main", "__version__"]
