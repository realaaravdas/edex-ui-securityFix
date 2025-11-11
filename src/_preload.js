const { contextBridge, ipcRenderer, remote, clipboard, shell, app } = require('electron');

// Expose safe APIs to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    // IPC communications
    send: (channel, ...args) => {
        // Whitelist allowed channels
        const validChannels = [
            'terminal_channel-3000', 'terminal_channel-3001', 'terminal_channel-3002', 
            'terminal_channel-3003', 'terminal_channel-3004', 'terminal_channel-3005',
            'ttyspawn', 'getAuthToken', 'getThemeOverride', 'setThemeOverride', 
            'getKbOverride', 'setKbOverride', 'log'
        ];
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, ...args);
        }
    },
    
    sendSync: (channel, ...args) => {
        const validChannels = ['getAuthToken'];
        if (validChannels.includes(channel)) {
            return ipcRenderer.sendSync(channel, ...args);
        }
        return null;
    },
    
    on: (channel, func) => {
        const validChannels = [
            'terminal_channel-3000', 'terminal_channel-3001', 'terminal_channel-3002', 
            'terminal_channel-3003', 'terminal_channel-3004', 'terminal_channel-3005',
            'ttyspawn-reply', 'auth-token-reply', 'getThemeOverride', 'getKbOverride'
        ];
        if (validChannels.includes(channel)) {
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
    },
    
    once: (channel, func) => {
        const validChannels = [
            'terminal_channel-3000', 'terminal_channel-3001', 'terminal_channel-3002', 
            'terminal_channel-3003', 'terminal_channel-3004', 'terminal_channel-3005',
            'ttyspawn-reply', 'auth-token-reply', 'getThemeOverride', 'getKbOverride'
        ];
        if (validChannels.includes(channel)) {
            ipcRenderer.once(channel, (event, ...args) => func(...args));
        }
    },
    
    // App info
    getVersion: () => app.getVersion(),
    getPath: (name) => app.getPath(name),
    
    // File system operations (sanitized)
    readFile: (filePath) => {
        // Sanitize file path to prevent directory traversal
        if (typeof filePath !== 'string') throw new Error('Invalid file path');
        if (filePath.includes('..') || filePath.includes('~')) {
            throw new Error('Directory traversal not allowed');
        }
        return require('fs').readFileSync(filePath, 'utf8');
    },
    
    // Clipboard access
    readText: () => clipboard.readText(),
    writeText: (text) => clipboard.writeText(text),
    
    // External URL opening
    openExternal: (url) => {
        try {
            // Validate URL format
            new URL(url);
            shell.openExternal(url);
        } catch (e) {
            throw new Error('Invalid URL format');
        }
    },
    
    // Remote module (limited access)
    getCurrentWindow: () => {
        const win = remote.getCurrentWindow();
        return {
            minimize: () => win.minimize(),
            maximize: () => win.maximize(),
            close: () => win.close(),
            setFullScreen: (flag) => win.setFullScreen(flag)
        };
    },
    
    // Get app directories safely
    getAppPath: () => app.getAppPath()
});

// Create a safe remote module interface
contextBridge.exposeInMainWorld('remote', {
    getCurrentWindow: () => {
        const win = remote.getCurrentWindow();
        return {
            minimize: () => win.minimize(),
            maximize: () => win.maximize(),
            close: () => win.close(),
            setFullScreen: (flag) => win.setFullScreen(flag),
            getSize: () => win.getSize(),
            setPosition: (x, y) => win.setPosition(x, y),
            getTitle: () => win.getTitle(),
            setAlwaysOnTop: (flag) => win.setAlwaysOnTop(flag)
        };
    },
    
    app: {
        getVersion: () => app.getVersion(),
        getPath: (name) => app.getPath(name),
        quit: () => app.quit(),
        getName: () => app.getName()
    },
    
    clipboard: {
        readText: () => clipboard.readText(),
        writeText: (text) => clipboard.writeText(text)
    },
    
    shell: {
        openExternal: (url) => {
            try {
                new URL(url);
                shell.openExternal(url);
            } catch (e) {
                throw new Error('Invalid URL format');
            }
        }
    },
    
    process: {
        platform: process.platform
    }
});

// Create a safe IPC interface that mimics the old behavior
contextBridge.exposeInMainWorld('ipcRenderer', {
    send: (channel, ...args) => window.electronAPI.send(channel, ...args),
    sendSync: (channel, ...args) => window.electronAPI.sendSync(channel, ...args),
    on: (channel, func) => window.electronAPI.on(channel, func),
    once: (channel, func) => window.electronAPI.once(channel, func)
});

// Log to console
window.addEventListener('DOMContentLoaded', () => {
    console.log('Security preload script loaded successfully');
    console.log('Context isolation enabled, using secure API bridge');
});
