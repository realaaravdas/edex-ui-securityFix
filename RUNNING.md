# How to Run eDEX-UI

## Quick Start

### Windows

1. **Install Visual Studio Build Tools** (first time only)
   - Download and install "Build Tools for Visual Studio" from https://visualstudio.microsoft.com/downloads/
   - During installation, select the "C++ build tools" workload
   - Make sure "Windows 10/11 SDK" and "CMake tools" are also selected
   - Or alternatively install "Visual Studio Community" with "Desktop development with C++" workload

2. **Open Command Prompt or PowerShell as Administrator**
   - Right-click on Command Prompt/PowerShell
   - Select "Run as administrator"

3. **Navigate to the project directory**
   ```bash
   cd C:\Users\r2d2d\Documents\Dev\edex-ui-securityFix
   ```

4. **Install dependencies**
   ```bash
   npm run install-windows
   ```
   This will take several minutes as it installs dependencies and rebuilds native modules.

5. **Run the application**
   ```bash
   npm run start
   ```

### Linux/macOS

1. **Open a terminal**

2. **Navigate to the project directory**
   ```bash
   cd /path/to/edex-ui-securityFix
   ```

3. **Install dependencies** (first time only)
   ```bash
   npm run install-linux
   ```
   This will take several minutes as it installs dependencies and rebuilds native modules.

4. **Run the application**
   ```bash
   npm run start
   ```

## What to Expect

- The application will launch in fullscreen mode with a sci-fi terminal interface
- You'll see a working terminal, system monitors, file browser, and on-screen keyboard
- The intro animation is skipped when using `npm run start`

## Troubleshooting

**"Cannot find module" errors:**
- Make sure you ran the install command (`install-windows` or `install-linux`)
- Do NOT use `npm install` directly - it won't rebuild the native modules correctly

**Windows: Permission errors:**
- Make sure you're running as Administrator
- The install script needs admin rights to install build tools

**Windows: Visual Studio Build Tools errors:**
- If you get "Could not find any Visual Studio installation to use" errors:
  - Ensure you installed the "Desktop development with C++" workload during Visual Studio installation
  - You can modify your Visual Studio installation to add this workload if needed
  - Or alternatively install "Build Tools for Visual Studio" standalone package with just the C++ build tools

**Application doesn't start:**
- Check that port 3000 is not already in use by another application
- Look at the console output for error messages

## Configuration

After first launch, configuration files are created in:
- **Windows:** `C:\Users\YourName\AppData\Roaming\eDEX-UI\`
- **Linux:** `~/.config/eDEX-UI/`
- **macOS:** `~/Library/Application Support/eDEX-UI/`

You can edit `settings.json` in that directory to customize:
- Shell (bash, powershell, zsh, etc.)
- Theme
- Keyboard layout
- Audio settings
- And more

## Exiting

- Press `Ctrl+C` in the terminal where you ran `npm run start`
- Or close the terminal tab within the eDEX-UI interface (this will exit the app)
