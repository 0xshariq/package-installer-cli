# Installation Instructions

## Quick Start

After extracting the package:

```bash
# 1. Extract the package
tar -xzf package-installer-cli-1.4.0-linux-amd64.tar.gz
cd package-installer-cli-1.4.0-linux-amd64

# 2. Install dependencies (one-time setup)
npm install --production

# 3. Use the CLI
./package-installer-cli-linux-amd64 --help
# or
./pi --help  # for pi packages
```

## Alternative: Use Setup Script

```bash
# Run the setup script (does the npm install for you)
./setup.sh        # Linux/macOS
./setup.bat       # Windows
```

## Requirements

- Node.js 18.0.0 or higher
- npm (usually comes with Node.js)
- Internet connection (for initial dependency installation)

## Troubleshooting

**"Cannot find package 'commander'" error:**
- Run `npm install --production` in the package directory
- Ensure Node.js and npm are properly installed

**Permission errors:**
- Make sure the binary is executable: `chmod +x package-installer-cli-*`
- On macOS, you might need to approve the binary in Security preferences