#!/usr/bin/env python3
import subprocess
import sys
import os
import platform
from pathlib import Path

def find_bundle_standalone():
    """Find the bundle-standalone directory in various installation scenarios"""
    # Get the directory where this script is located
    script_dir = Path(__file__).parent.resolve()
    
    # Try different paths for bundle-standalone
    possible_paths = [
        # For local development and pip install -e . (editable install)
        script_dir / "bundle-standalone",
        
        # For global pip install (when installed as a package)
        script_dir / "bundle-standalone",
        
        # For site-packages installation
        script_dir.parent / "bundle-standalone",
        
        # For user installation
        Path.home() / ".local" / "lib" / "python*" / "site-packages" / "bundle-standalone",
    ]
    
    # Check each possible path
    for path in possible_paths:
        if path.exists() and (path / "pi").exists():
            return path
    
    # If not found, try to find it recursively from the script directory
    for parent in [script_dir] + list(script_dir.parents):
        bundle_path = parent / "bundle-standalone"
        if bundle_path.exists() and (bundle_path / "pi").exists():
            return bundle_path
    
    return None

def main():
    """Main entry point for the CLI (runs the standalone bundled executable)"""
    standalone_dir = find_bundle_standalone()
    
    if standalone_dir is None:
        print("Error: bundle-standalone directory not found.")
        print("The package may be corrupted or not properly installed.")
        print("Please reinstall the package:")
        print("  pip install --upgrade --force-reinstall package-installer-cli")
        sys.exit(1)
    
    pi_executable = standalone_dir / "pi"
    
    if not pi_executable.exists():
        print(f"Error: pi executable not found in {standalone_dir}")
        print("The package may be corrupted. Please reinstall:")
        print("  pip install --upgrade --force-reinstall package-installer-cli")
        sys.exit(1)
    
    try:
        # Make sure the binary is executable (for Unix systems)
        system = platform.system().lower()
        if system in ("linux", "darwin"):
            # Set executable permissions
            current_mode = pi_executable.stat().st_mode
            pi_executable.chmod(current_mode | 0o111)
        
        # Run the standalone executable with all arguments passed to this script
        result = subprocess.run([str(pi_executable)] + sys.argv[1:])
        sys.exit(result.returncode)
        
    except KeyboardInterrupt:
        # Handle Ctrl+C gracefully
        sys.exit(1)
        
    except FileNotFoundError:
        print(f"Error: Could not execute {pi_executable}")
        print("The executable may be corrupted or incompatible with your system.")
        sys.exit(1)
        
    except PermissionError:
        print(f"Error: Permission denied when trying to execute {pi_executable}")
        print("Please check file permissions or run with appropriate privileges.")
        sys.exit(1)
        
    except Exception as e:
        print(f"Error: Failed to run the CLI: {e}")
        print("Please check your installation and try again.")
        sys.exit(1)

if __name__ == "__main__":
    main()