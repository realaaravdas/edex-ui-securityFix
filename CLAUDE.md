# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

eDEX-UI is a fullscreen, cross-platform terminal emulator and system monitor with a sci-fi themed interface, inspired by TRON Legacy. This is an **archived project** (as of Oct 18th 2021) built with Electron 12.x. The codebase is currently undergoing security fixes.

**Important:** This project uses native modules (`node-pty`) that require rebuilding with `electron-rebuild`. Always use the platform-specific install commands rather than plain `npm install`.

## Development Commands

### Installation & Setup

**Linux/macOS:**
```bash
npm run install-linux
```

**Windows (requires admin privileges):**
```bash
npm run install-windows
```

### Running

Start the application (skips intro animation):
```bash
npm run start
```

### Building

Platform-specific builds (can only build for the host OS due to native modules):

```bash
npm run build-linux    # Creates AppImage for multiple architectures
npm run build-darwin   # Creates DMG for macOS
npm run build-windows  # Creates NSIS installer
```

The build process automatically:
1. Copies `src/` to `prebuild-src/`
2. Minifies code via `prebuild-minify.js`
3. Installs dependencies in prebuild directory
4. Creates distributable in `dist/` folder
5. Cleans up `prebuild-src/` afterwards

### Other Commands

```bash
npm run init-file-icons      # Initialize file icons submodule
npm run update-file-icons    # Update file icons from submodule
npm test                     # Run minify + snyk security test
```

## Architecture Overview

### Process Model

eDEX-UI uses Electron's multi-process architecture with an important security-focused design:

**Main Process (`src/_boot.js`):**
- Initializes Electron app with single-instance lock
- Creates BrowserWindow with `contextIsolation: true` and `nodeIntegration: false`
- Manages Terminal backend instances via node-pty
- Spawns WebSocket servers (port 3000 + extras for tabs) for PTY communication
- Handles IPC communication for theme/keyboard hotswitch and TTY spawning
- **Security:** Implements authentication tokens for WebSocket connections

**Renderer Process (`src/_renderer.js`):**
- Bootstraps the UI with security measures (`eval()` disabled, HTML escaping utilities)
- Loads themes, settings, and keyboard layouts from userData directory
- Initializes all UI modules/classes
- **Security:** Uses preload script (`src/_preload.js`) for controlled main-renderer communication

**Preload Script (`src/_preload.js`):**
- Creates secure bridge between main and renderer with `contextBridge`
- Exposes minimal, controlled API surface to renderer

### Core Classes (src/classes/)

All UI components are implemented as ES6 classes instantiated in the renderer:

- **`terminal.class.js`**: Dual-mode class (client/server)
  - Client: xterm.js frontend with WebGL rendering, ligature support, custom color filters
  - Server: node-pty backend with WebSocket server, CWD tracking (Linux/macOS only), process name tracking
  - **Security features:** Token-based WebSocket auth, origin validation, rate limiting, connection limits, input sanitization

- **`filesystem.class.js`**: Directory viewer that tracks terminal CWD and displays file tree with icons

- **`keyboard.class.js`**: On-screen keyboard with customizable layouts, supports touch displays

- **`toplist.class.js`**: Process list monitor using systeminformation library

- **`netstat.class.js`**: Network connections monitor with geographic visualization

- **`locationGlobe.class.js`**: 3D globe (ENCOM Globe) showing network connection locations via GeoIP

- **`cpuinfo.class.js`**, **`ramwatcher.class.js`**, **`sysinfo.class.js`**: System monitoring widgets with SmoothieCharts

- **`audiofx.class.js`**: Sound effects manager using Howler.js

- **`modal.class.js`**: In-app settings and keyboard shortcut editors

- **`mediaPlayer.class.js`**: Audio file player

- **`docReader.class.js`**: PDF viewer using pdf.js

### Multi-Threading for System Info

The `_multithread.js` module creates worker processes to handle expensive systeminformation calls without blocking the main process, improving performance for system monitoring widgets.

### Configuration & User Data

User settings stored in Electron's userData directory:

- `settings.json`: Main configuration (shell, theme, keyboard layout, audio, port, etc.)
- `shortcuts.json`: Keyboard shortcuts configuration
- `lastWindowState.json`: Window state persistence
- `themes/`: Theme JSON files (copied from `src/assets/themes/`)
- `keyboards/`: Keyboard layout files (copied from `src/assets/kb_layouts/`)
- `fonts/`: Font files (copied from `src/assets/fonts/`)

Settings are created with defaults on first launch if missing.

### Terminal Tab Support

The app supports up to 4 additional terminal tabs beyond the main terminal:
- Each tab gets its own PTY process and WebSocket server (ports 3002-3005)
- Tabs share the same shell configuration from settings
- Created dynamically via `ttyspawn` IPC event

### Security Architecture

Recent security improvements include:

1. **WebSocket Authentication**: Cryptographically secure tokens (32 random bytes) required for WS connections
2. **Origin Validation**: Only allows connections from `file://`, `app://`, and localhost origins
3. **Rate Limiting**: Max 10 connection attempts per IP per minute
4. **Connection Limits**: Maximum 1 client per WebSocket server
5. **Input Sanitization**: Shell path and argument validation to prevent command injection
6. **Directory Traversal Prevention**: Path validation for shell and CWD
7. **Context Isolation**: Renderer has no direct Node.js access
8. **Disabled eval()**: Runtime code execution blocked in renderer

## Important Notes

### Platform-Specific Behaviors

- **CWD Tracking**: Only works on Linux/macOS (reads `/proc/{pid}/cwd` or uses `lsof`). Windows uses "detached" mode for file browser.
- **Fullscreen**: Default behavior; can be disabled via `allowWindowed` setting
- **Native Dependencies**: `node-pty` requires native compilation; use `electron-rebuild` after install

### Theme System

Themes are JSON files that control:
- CSS variables (colors, fonts)
- Terminal color scheme with optional color filters (using `color` npm package)
- UI layout visibility options

The theme system supports runtime hotswitch without restart via IPC.

### Working with Modified Security Code

When modifying security-sensitive areas:

- **Terminal WebSocket auth** (terminal.class.js:481-546): Always maintain token validation
- **Shell argument parsing** (terminal.class.js:434-456): Strict regex validation prevents injection
- **Origin checks** (terminal.class.js:506-522): Never allow external origins
- **Preload context** (_preload.js): Minimal exposure principle - only expose what's necessary
