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
            coordinate: ol.proj.fromLonLat([coords[1], coords[0]]),
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
    console.log('Clearing previous layers and starting animation');
    clearAllLayers();
    
    console.log('Preparing route layer for animation');
    const routeCoords = appState.animationCoords.map(point => point.coordinate);
    
    const routeFeature = new ol.Feature({
        geometry: new ol.geom.LineString(routeCoords)
    });
    
    const routeStyle = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#94a3b8',
            width: 3
        })
    });
    
    routeFeature.setStyle(routeStyle);
    
    appState.routeLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: [routeFeature]
        })
    });
    
    appState.map.addLayer(appState.routeLayer);
    console.log('Route layer added to map', appState.routeLayer);
    
    appState.animationIndex = 0;
    appState.animationStartTime = Date.now();
    
    if (appState.animationMarker) {
        appState.map.removeLayer(appState.animationMarker);
    }
    
    console.log('Creating animation marker at the first point');
    const currentPoint = appState.animationCoords[0];
    console.log('Current point:', currentPoint);
    
    // Create marker feature for OpenLayers
    const markerFeature = new ol.Feature({
        geometry: new ol.geom.Point(currentPoint.coordinate)
    });
    
    const markerStyle = new ol.style.Style({
        image: new ol.style.Circle({
            radius: 8,
            fill: new ol.style.Fill({
                color: '#ef4444'
            }),
            stroke: new ol.style.Stroke({
                color: 'white',
                width: 2
            })
        })
    });
    
    markerFeature.setStyle(markerStyle);
    
    appState.animationMarker = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: [markerFeature]
        })
    });
    
    appState.map.addLayer(appState.animationMarker);
    
    console.log('Setting map view to the first point');
    if (appState.followMarker) {
        appState.map.getView().animate({
            center: currentPoint.coordinate,
            duration: 1000
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
    appState.animationInterval = setInterval(animateStep, getAnimationInterval());
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
    
    if (appState.animationMarker) {
        // Update marker position for OpenLayers
        const markerSource = appState.animationMarker.getSource();
        const markerFeature = markerSource.getFeatures()[0];
        markerFeature.getGeometry().setCoordinates(currentPoint.coordinate);
        
        if (appState.followMarker) {
            appState.map.getView().animate({
                center: currentPoint.coordinate,
                duration: 500
            });
        }    }

    const progress = ((appState.animationIndex + 1) / appState.animationCoords.length) * 100;
    document.getElementById('animation-progress').textContent = `${progress.toFixed(1)}%`;
    
    const elapsedTime = Date.now() - appState.animationStartTime;
    const hours = Math.floor(elapsedTime / 3600000);
    const minutes = Math.floor((elapsedTime % 3600000) / 60000);
    const seconds = Math.floor((elapsedTime % 60000) / 1000);
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('animation-time').textContent = timeString;
    
    appState.animationIndex++;
}

export function showAnimatedRoute() {
    startAnimation();
    document.querySelectorAll('.controls button').forEach(btn => btn.classList.remove('active'));
    document.getElementById('animate-route').classList.add('active');
}
