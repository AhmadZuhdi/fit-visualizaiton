// Animation functionality for route playback
import { appState } from './config.js';
import { formatSpeed } from './data-utils.js';
import { clearAllLayers } from './map-layers.js';

export function getAnimationInterval() {
    const speedControl = document.getElementById('animation-speed');
    return speedControl ? parseInt(speedControl.value) : 100;
}

export function createAnimationTooltipContent(animationPoint) {
    const speed = animationPoint.properties.speed !== undefined ? formatSpeed(animationPoint.properties.speed) : 'N/A';
    const heartRate = animationPoint.properties.heart_rate !== undefined ? `${animationPoint.properties.heart_rate} bpm` : 'N/A';
    const time = animationPoint.properties.time ? new Date(animationPoint.properties.time).toLocaleTimeString() : 'Unknown';
    
    return `<div style="font-size: 12px;">
        <strong>Current Position</strong><br>
        Time: ${time}<br>
        Speed: ${speed}<br>
        Heart Rate: ${heartRate}
    </div>`;
}

export function prepareAnimationData() {
    if (!appState.geoJsonData) return;
    
    appState.animationCoords = appState.geoJsonData.features.map(feature => {
        const coords = feature.geometry.coordinates[0];
        return {
            latlng: [coords[0], coords[1]],
            properties: feature.properties
        };
    });
    
    console.log('Animation data prepared:', appState.animationCoords.length, 'points');
}

export function startAnimation() {
    if (!appState.geoJsonData) {
        alert('No data loaded for animation');
        return;
    }
    
    prepareAnimationData();
    
    if (appState.animationCoords.length === 0) {
        alert('No animation data available');
        return;
    }

    if (appState.images.length > 0) {
        appState.images = appState.images.toSorted((a, b) => a.timestamp - b.timestamp);
    }
    
    console.log('Clearing previous layers and starting animation');
    clearAllLayers();
    
    console.log('Preparing route layer for animation');
    const routeCoords = appState.animationCoords.map(point => point.latlng);
    appState.routeLayer = L.layerGroup();
    appState.routeLayer.addLayer(L.polyline(routeCoords, {
        color: 'grey',   
        weight: 4,
        opacity: 0.8,
        smoothFactor: 1
    })).addTo(appState.map);
    console.log('Route layer added to map', appState.routeLayer);
    
    appState.animationIndex = 8600;
    appState.animationStartTime = Date.now();
    
    if (appState.animationMarker) {
        appState.map.removeLayer(appState.animationMarker);
    }
    
    console.log('Creating animation marker at the first point');
    const currentPoint = appState.animationCoords[0];
    console.log('Current point:', currentPoint);
    appState.animationMarker = L.marker(currentPoint.latlng, {
        icon: L.divIcon({
            className: 'current-position-marker',
            html: '<div style="background: #ef4444; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
            iconSize: [16, 16],
            iconAnchor: [8, 8]
        })
    })
    .addTo(appState.map);
    
    console.log('Binding tooltip to animation marker');
    if (appState.showTooltips) {
        appState.animationMarker.bindTooltip(createAnimationTooltipContent(currentPoint), {
            permanent: true,
            direction: 'top',
            className: 'animation-tooltip'
        });
    }
    
    console.log('Setting map view to the first point');
    if (appState.followMarker) {
        appState.map.setView(currentPoint.latlng, appState.map.getZoom(), {
            animate: false,
            duration: 1
        });
    }
    
    appState.animationRunning = true;
    const playPauseBtn = document.getElementById('play-pause');
    if (playPauseBtn) {
        playPauseBtn.textContent = '⏸ Pause';
        playPauseBtn.classList.remove('play');
    }
    
    document.getElementById('animation-controls').style.display = 'block';
    
    console.log('Starting animation interval');
    startInterval();
}

export function pauseAnimation() {
    appState.animationRunning = false;
    if (appState.animationInterval) {
        clearInterval(appState.animationInterval);
        appState.animationInterval = null;
    }
    
    const playPauseBtn = document.getElementById('play-pause');
    if (playPauseBtn) {
        playPauseBtn.textContent = '▶ Play';
        playPauseBtn.classList.add('play');
    }
}

export function stopAnimation() {
    appState.animationRunning = false;
    if (appState.animationInterval) {
        clearInterval(appState.animationInterval);
        appState.animationInterval = null;
    }
    
    if (appState.animationMarker) {
        appState.map.removeLayer(appState.animationMarker);
        appState.animationMarker = null;
    }
    
    appState.animationIndex = 0;
    
    const playPauseBtn = document.getElementById('play-pause');
    if (playPauseBtn) {
        playPauseBtn.textContent = '▶ Play';
        playPauseBtn.classList.add('play');
    }
    
    document.getElementById('animation-controls').style.display = 'none';
    appState.currentMode = 'route';
}

export function restartAnimation() {
    stopAnimation();
    startAnimation();
}

export function getSpeedColor(speed) {
    // Speed color scale (converting to a consistent unit for color mapping)
    // Always use km/h for consistent color scaling regardless of display unit
    const kmh = speed * 3.6;
    if (kmh < 5) return '#313695';
    if (kmh < 10) return '#4575b4';
    if (kmh < 15) return '#74add1';
    if (kmh < 20) return '#abd9e9';
    if (kmh < 25) return '#e0f3f8';
    if (kmh < 30) return '#fee090';
    if (kmh < 35) return '#fdae61';
    if (kmh < 40) return '#f46d43';
    return '#d73027';
}

export function animateStep() {
    if (!appState.animationRunning || appState.animationIndex >= appState.animationCoords.length) {
        stopAnimation();
        return;
    }
    
    const currentPoint = appState.animationCoords[appState.animationIndex];

    const prevPoint = appState.animationIndex > 0 ? appState.animationCoords[appState.animationIndex - 1] : null;              // Update marker position

    if (appState.animationMarker) {
        appState.animationMarker.setLatLng(currentPoint.latlng);
        
        if (appState.showTooltips) {
            appState.animationMarker.setTooltipContent(createAnimationTooltipContent(currentPoint));
        }
        
        if (appState.followMarker) {
            appState.map.panTo(currentPoint.latlng, {
                animate: true,
                duration: 0.5
            });
        }
    }

    // Add route segment
    if (prevPoint) {
        const segment = L.polyline([prevPoint.latlng, currentPoint.latlng], {
            color: getSpeedColor(currentPoint.properties.speed || 0),
            weight: 4,
            opacity: 0.7
        });
        
        appState.routeLayer.addLayer(segment);
    }
    
    const progress = ((appState.animationIndex + 1) / appState.animationCoords.length) * 100;
    document.getElementById('animation-progress').textContent = `${progress.toFixed(1)}%`;
    
    const elapsedTime = Date.now() - appState.animationStartTime;
    const hours = Math.floor(elapsedTime / 3600000);
    const minutes = Math.floor((elapsedTime % 3600000) / 60000);
    const seconds = Math.floor((elapsedTime % 60000) / 1000);
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('animation-time').textContent = timeString;
    
    if (appState.images.length > 0) {
        const selectedImage = appState.images[0]
        
        // Check if the current point's timestamp is close to the image's timestamp
        if (Math.abs(currentPoint.properties.timestamp - selectedImage.timestamp) < 322) {

            appState.map.removeLayer(selectedImage.marker); // Remove the image marker if it exists

            appState.images.shift(); // Remove the image after displaying it
        }
    }

    appState.animationIndex++;
}

export function startInterval() {
    appState.animationInterval = setInterval(animateStep, getAnimationInterval());
}

export function showAnimatedRoute() {
    startAnimation();
    document.querySelectorAll('.controls button').forEach(btn => btn.classList.remove('active'));
    document.getElementById('animate-route').classList.add('active');
}
