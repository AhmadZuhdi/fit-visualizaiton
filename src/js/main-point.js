// Main entry point for the flyover effect video application
import { initializeMap, fitToBounds } from './map-init.js';
import { loadGeoJsonData } from './data-utils.js';
import { initializeEventListeners } from './event-listeners.js';
import { initializeCanvasRecording } from './recording.js';

// Global state object to share between modules
window.appState = {
    map: null,
    geoJsonData: null,
    routeLayer: null,
    pointsLayer: null,
    currentMode: 'route',
    speedUnit: 'kmh',
    showTooltips: true,
    currentSizePreset: 'fullscreen',
    animationRunning: false,
    animationInterval: null,
    animationIndex: 0,
    animationCoords: [],
    animationMarker: null,
    animationStartTime: null,
    followMarker: true,
    // Recording state
    canvasRecorder: null,
    recordingCanvas: null,
    recordingContext: null,
    isRecording: false,
    recordingFrameCount: 0,
    recordingDuration: 10,
    recordingFrameRate: 30,
    recordingFormat: 'mp4',
    recordingStatus: 'idle'
};

// =======================
// INITIALIZATION
// =======================

document.addEventListener('DOMContentLoaded', async function() {
    initializeMap();
    await loadGeoJsonData();
    initializeEventListeners();
    await initializeCanvasRecording();
});
