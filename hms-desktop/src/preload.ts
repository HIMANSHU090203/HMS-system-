// Preload script for Electron
// This script runs in a context that has access to both the DOM and Node.js APIs
// but is isolated from the main renderer process for security.

// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge } from 'electron';

// Expose protected methods that allow the renderer process to use
// the APIs in a safe way. This is optional but recommended for security.
contextBridge.exposeInMainWorld('electronAPI', {
  // Add any APIs you want to expose to the renderer process here
  // Example:
  // platform: process.platform,
  // versions: process.versions,
});

// Log that preload script has loaded (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('[Preload] Preload script loaded successfully');
}
