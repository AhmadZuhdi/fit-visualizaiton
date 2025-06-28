// Configuration constants and settings

// Size presets configuration
export const sizePresets = {
    fullscreen: { width: '100%', height: '100vh' },
    youtube: { width: '1280px', height: '720px' },
    'instagram-square': { width: '600px', height: '600px' },
    'instagram-story': { width: '405px', height: '720px' },
    tiktok: { width: '405px', height: '720px' },
    twitter: { width: '800px', height: '450px' },
    facebook: { width: '1200px', height: '630px' },
    custom: { width: '1280px', height: '720px' }
};

// Recording status constants
export const RecordingWorkflowStatus = {
    IDLE: 'idle',
    RECORDING: 'recording',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    ERROR: 'error'
};

// Global state object
export const appState = {
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
    recordingStatus: 'idle',

    // images state
    images: [],
};

// Make appState available globally for compatibility
window.appState = appState;
