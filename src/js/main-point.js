// Main entry point for the flyover effect video application
import { initializeMap, fitToBounds } from './map-init.js';
import { loadGeoJsonData } from './data-utils.js';
import { initializeEventListeners } from './event-listeners.js';
import { initializeCanvasRecording } from './recording.js';
import { appState } from './config.js';

// Make appState globally available for backward compatibility
window.appState = appState;

// =======================
// INITIALIZATION
// =======================

document.addEventListener('DOMContentLoaded', async function() {
    initializeMap();
    await loadGeoJsonData();
    initializeEventListeners();
    await initializeCanvasRecording();
});
