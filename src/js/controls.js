// UI controls and user interactions
import { appState, sizePresets } from './config.js';
import { calculateStatistics, updateInfoPanel } from './data-utils.js';
import { showPoints, showHeatmap } from './map-layers.js';

export function toggleSpeedUnit() {
    appState.speedUnit = appState.speedUnit === 'kmh' ? 'mph' : 'kmh';
    
    const button = document.getElementById('speed-unit-toggle');
    button.textContent = `Speed: ${appState.speedUnit === 'kmh' ? 'km/h' : 'mph'}`;
    
    updateAllSpeedDisplays();
    updateAllTooltipDisplays();
    
    if (appState.geoJsonData) {
        const stats = calculateStatistics(appState.geoJsonData.features);
        updateInfoPanel(stats);
    }
}

export function toggleTooltips() {
    appState.showTooltips = !appState.showTooltips;
    
    const button = document.getElementById('tooltip-toggle');
    button.textContent = `Tooltips: ${appState.showTooltips ? 'ON' : 'OFF'}`;
    button.classList.toggle('active', appState.showTooltips);
    
    updateAllTooltipDisplays();
    updateAnimationTooltipDisplay();
}

export function toggleSizeControls() {
    const sizeControls = document.getElementById('size-controls');
    const isVisible = sizeControls.style.display === 'block';
    
    sizeControls.style.display = isVisible ? 'none' : 'block';
    
    const button = document.getElementById('size-toggle');
    button.classList.toggle('active', !isVisible);
}

export function toggleRecordingControls() {
    const recordingControls = document.getElementById('recording-controls');
    const isVisible = recordingControls.style.display === 'block';
    
    recordingControls.style.display = isVisible ? 'none' : 'block';
    
    const button = document.getElementById('record-toggle');
    button.classList.toggle('active', !isVisible);
}

export function updateAnimationTooltipDisplay() {
    if (appState.animationMarker) {
        if (appState.showTooltips) {
            const currentPoint = appState.animationCoords[appState.animationIndex - 1] || appState.animationCoords[0];
            if (currentPoint) {
                // Import createAnimationTooltipContent function when needed
                import('./animation.js').then(({ createAnimationTooltipContent }) => {
                    appState.animationMarker.bindTooltip(createAnimationTooltipContent(currentPoint), {
                        permanent: true,
                        direction: 'top',
                        className: 'animation-tooltip'
                    });
                });
            }
        } else {
            appState.animationMarker.unbindTooltip();
        }
    }
}

export function updateAllTooltipDisplays() {
    if (appState.currentMode === 'points' && appState.pointsLayer) {
        showPoints();
    }
}

export function updateAllSpeedDisplays() {
    if (appState.currentMode === 'points' && appState.pointsLayer) {
        showPoints();
    } else if (appState.currentMode === 'heatmap' && appState.routeLayer) {
        showHeatmap();
    }
}

export function applyMapSize(preset, width = null, height = null) {
    const mapElement = document.getElementById('map');
    
    if (preset === 'custom' && width && height) {
        mapElement.style.width = width + 'px';
        mapElement.style.height = height + 'px';
    } else if (sizePresets[preset]) {
        mapElement.style.width = sizePresets[preset].width;
        mapElement.style.height = sizePresets[preset].height;
    }
    
    mapElement.style.margin = '0 auto';
    mapElement.style.display = 'block';
    
    setTimeout(() => {
        if (appState.map) {
            appState.map.invalidateSize();
        }
    }, 100);
    
    appState.currentSizePreset = preset;
    
    document.querySelectorAll('.preset-buttons button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`preset-${preset}`).classList.add('active');
}

export function selectSizePreset(preset) {
    if (preset === 'custom') {
        document.getElementById('custom-size').style.display = 'block';
        applyCustomSize();
    } else {
        document.getElementById('custom-size').style.display = 'none';
        applyMapSize(preset);
    }
}

export function applyCustomSize() {
    const width = parseInt(document.getElementById('custom-width').value);
    const height = parseInt(document.getElementById('custom-height').value);
    applyMapSize('custom', width, height);
}
