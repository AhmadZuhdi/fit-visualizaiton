// Event listeners and user interaction handlers
import { showRoute, showPoints, showHeatmap } from './map-layers.js';
import { showAnimatedRoute, stopAnimation, pauseAnimation, restartAnimation, animateStep, getAnimationInterval } from './animation.js';
import { toggleSpeedUnit, toggleTooltips, toggleSizeControls, toggleRecordingControls, selectSizePreset, applyCustomSize } from './controls.js';
import { toggleRecording, setRecordingOptions, recordAnimationSequence } from './recording.js';
import { fitToBounds } from './map-init.js';
import { appState } from './config.js';
import './file-input-listener.js';

export function initializeEventListeners() {
    // Main control buttons
    document.getElementById('show-route').addEventListener('click', function() {
        stopAnimation();
        showRoute();
        document.querySelectorAll('.controls button').forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
    });

    document.getElementById('show-points').addEventListener('click', function() {
        stopAnimation();
        showPoints();
        document.querySelectorAll('.controls button').forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
    });

    document.getElementById('show-heatmap').addEventListener('click', function() {
        stopAnimation();
        showHeatmap();
        document.querySelectorAll('.controls button').forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
    });

    document.getElementById('animate-route').addEventListener('click', function() {
        showAnimatedRoute();
        document.querySelectorAll('.controls button').forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
    });

    document.getElementById('fit-bounds').addEventListener('click', fitToBounds);
    
    // Toggle buttons
    document.getElementById('speed-unit-toggle').addEventListener('click', toggleSpeedUnit);
    document.getElementById('tooltip-toggle').addEventListener('click', toggleTooltips);
    document.getElementById('size-toggle').addEventListener('click', toggleSizeControls);
    document.getElementById('record-toggle').addEventListener('click', toggleRecordingControls);
    
    // Size preset event listeners
    document.getElementById('preset-fullscreen').addEventListener('click', () => selectSizePreset('fullscreen'));
    document.getElementById('preset-youtube').addEventListener('click', () => selectSizePreset('youtube'));
    document.getElementById('preset-instagram-square').addEventListener('click', () => selectSizePreset('instagram-square'));
    document.getElementById('preset-instagram-story').addEventListener('click', () => selectSizePreset('instagram-story'));
    document.getElementById('preset-tiktok').addEventListener('click', () => selectSizePreset('tiktok'));
    document.getElementById('preset-twitter').addEventListener('click', () => selectSizePreset('twitter'));
    document.getElementById('preset-facebook').addEventListener('click', () => selectSizePreset('facebook'));
    document.getElementById('preset-custom').addEventListener('click', () => selectSizePreset('custom'));
    
    // Apply custom size button
    document.getElementById('apply-size').addEventListener('click', applyCustomSize);
    
    // Auto-apply custom size on input change
    document.getElementById('custom-width').addEventListener('input', () => {
        if (appState.currentSizePreset === 'custom') {
            applyCustomSize();
        }
    });
    document.getElementById('custom-height').addEventListener('input', () => {
        if (appState.currentSizePreset === 'custom') {
            applyCustomSize();
        }
    });
    
    // Animation control event listeners
    document.getElementById('play-pause').addEventListener('click', function() {
        if (appState.animationRunning) {
            pauseAnimation();
        } else if (appState.animationIndex >= appState.animationCoords.length) {
            restartAnimation();
        } else {
            appState.animationInterval = setInterval(animateStep, getAnimationInterval());
            appState.animationRunning = true;
            this.textContent = '⏸ Pause';
            this.classList.remove('play');
        }
    });
    
    document.getElementById('next-step').addEventListener('click', function() {
        if (!appState.animationRunning) {
            animateStep();
        }
    });
    
    document.getElementById('stop-animation').addEventListener('click', stopAnimation);
    document.getElementById('restart-animation').addEventListener('click', restartAnimation);
    
    document.getElementById('toggle-follow').addEventListener('click', function() {
        appState.followMarker = !appState.followMarker;
        if (appState.followMarker) {
            this.classList.add('active');
            this.textContent = '📍 Follow';
            if (appState.animationRunning && appState.animationMarker) {
                appState.map.setView(appState.animationMarker.getLatLng(), appState.map.getZoom(), {
                    animate: true,
                    duration: 1
                });
            }
        } else {
            this.classList.remove('active');
            this.textContent = '📍 Free View';
        }
    });
    
    document.getElementById('animation-speed').addEventListener('input', function() {
        const speed = parseInt(this.value);
        document.getElementById('speed-value').textContent = `ms`;
        
        if (appState.animationRunning && appState.animationInterval) {
            clearInterval(appState.animationInterval);
            appState.animationInterval = setInterval(animateStep, speed);
        }
    });
    
    // Recording controls event listeners
    document.getElementById('record-button').addEventListener('click', async function() {
        try {
            await toggleRecording();
        } catch (error) {
            console.error('Recording error:', error);
            alert('Recording failed: ' + error.message);
        }
    });
    
    document.getElementById('recording-duration').addEventListener('change', function() {
        setRecordingOptions({ duration: parseInt(this.value) });
    });
    
    document.getElementById('recording-framerate').addEventListener('change', function() {
        setRecordingOptions({ frameRate: parseInt(this.value) });
    });
    
    document.getElementById('recording-format').addEventListener('change', function() {
        setRecordingOptions({ format: this.value });
    });
    
    document.getElementById('recording-quality').addEventListener('change', function() {
        console.log('Quality changed to:', this.value);
    });
    
    document.getElementById('record-animation').addEventListener('click', async function() {
        try {
            await recordAnimationSequence();
        } catch (error) {
            console.error('Animation recording error:', error);            alert('Animation recording failed: ' + error.message);
        }
    });
}
