// Animation functionality for route playback
import { appState } from './config.js';
import { formatSpeed, getSpeedColor } from './data-utils.js';
import { clearAllLayers } from './map-layers.js';

const IMAGE_TIMESTAMP_THRESHOLD = 322; // ms threshold for matching image to animation point

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
    
    const allCoords = appState.geoJsonData.features.map(feature => {
        const coords = feature.geometry.coordinates[0];
        return {
            latlng: [coords[0], coords[1]],
            properties: feature.properties
        };
    });
    
    // Calculate 5% boundaries
    const totalPoints = allCoords.length;
    const startIndex = Math.floor(totalPoints * 0.01);
    const endIndex = totalPoints - startIndex;
    
    // Use only the middle 90% of the route
    appState.animationCoords = allCoords.slice(startIndex, endIndex);
    
    console.log(`Animation data prepared: ${appState.animationCoords.length} points (${totalPoints} total, trimmed ${startIndex} from start, ${totalPoints - endIndex} from end)`);
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
    
    console.log('Preparing route layer for animation (middle 90% of route)');
    const routeCoords = appState.animationCoords.map(point => point.latlng);
    appState.routeLayer = L.layerGroup();
    appState.routeLayer.addLayer(L.polyline(routeCoords, {
        color: 'grey',   
        weight: 4,
        opacity: 0.8,
        smoothFactor: 1
    })).addTo(appState.map);
    console.log('Route layer added to map (trimmed route):', appState.routeLayer);
    
    appState.animationIndex = 0;
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
    
    // Show animation status display
    const statusDisplay = document.getElementById('animation-status');
    if (statusDisplay) {
        statusDisplay.style.display = 'flex';
        updateAnimationStatus(currentPoint);
        initializeDragFunctionality();
    }
    
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
    
    // Hide animation status display
    const statusDisplay = document.getElementById('animation-status');
    if (statusDisplay) {
        statusDisplay.style.display = 'none';
        // Reset position to default
        statusDisplay.style.left = '50%';
        statusDisplay.style.top = 'auto';
        statusDisplay.style.bottom = '20px';
        statusDisplay.style.transform = 'translateX(-50%)';
    }
    
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

export function animateStep() {
    if (!appState.animationRunning || appState.animationIndex >= appState.animationCoords.length) {
        stopAnimation();
        return;
    }
      const currentPoint = appState.animationCoords[appState.animationIndex];
    const prevPoint = appState.animationIndex > 0 ? appState.animationCoords[appState.animationIndex - 1] : null;
    
    // Update animation status display
    updateAnimationStatus(currentPoint);
    
    // Update marker position

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
        if (Math.abs(currentPoint.properties.timestamp - selectedImage.timestamp) < IMAGE_TIMESTAMP_THRESHOLD) {

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

// Make animation status display draggable
export function initializeDragFunctionality() {
    const statusDisplay = document.getElementById('animation-status');
    if (!statusDisplay) return;
    
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;
    
    statusDisplay.addEventListener('mousedown', (e) => {
        isDragging = true;
        statusDisplay.classList.add('dragging');
        
        // Get initial mouse position
        startX = e.clientX;
        startY = e.clientY;
        
        // Get initial element position
        const rect = statusDisplay.getBoundingClientRect();
        startLeft = rect.left;
        startTop = rect.top;
        
        // Remove transform to use absolute positioning
        statusDisplay.style.transform = 'none';
        statusDisplay.style.left = startLeft + 'px';
        statusDisplay.style.top = startTop + 'px';
        statusDisplay.style.bottom = 'auto';
        
        // Prevent text selection
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        // Calculate new position
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        let newLeft = startLeft + deltaX;
        let newTop = startTop + deltaY;
        
        // Constrain to viewport
        const rect = statusDisplay.getBoundingClientRect();
        const maxLeft = window.innerWidth - rect.width;
        const maxTop = window.innerHeight - rect.height;
        
        newLeft = Math.max(0, Math.min(newLeft, maxLeft));
        newTop = Math.max(0, Math.min(newTop, maxTop));
        
        statusDisplay.style.left = newLeft + 'px';
        statusDisplay.style.top = newTop + 'px';
    });
    
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            statusDisplay.classList.remove('dragging');
        }
    });
    
    // Touch events for mobile
    statusDisplay.addEventListener('touchstart', (e) => {
        isDragging = true;
        statusDisplay.classList.add('dragging');
        
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        
        const rect = statusDisplay.getBoundingClientRect();
        startLeft = rect.left;
        startTop = rect.top;
        
        statusDisplay.style.transform = 'none';
        statusDisplay.style.left = startLeft + 'px';
        statusDisplay.style.top = startTop + 'px';
        statusDisplay.style.bottom = 'auto';
        
        e.preventDefault();
    });
    
    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        
        const touch = e.touches[0];
        const deltaX = touch.clientX - startX;
        const deltaY = touch.clientY - startY;
        
        let newLeft = startLeft + deltaX;
        let newTop = startTop + deltaY;
        
        const rect = statusDisplay.getBoundingClientRect();
        const maxLeft = window.innerWidth - rect.width;
        const maxTop = window.innerHeight - rect.height;
        
        newLeft = Math.max(0, Math.min(newLeft, maxLeft));
        newTop = Math.max(0, Math.min(newTop, maxTop));
        
        statusDisplay.style.left = newLeft + 'px';
        statusDisplay.style.top = newTop + 'px';
        
        e.preventDefault();
    });
    
    document.addEventListener('touchend', () => {
        if (isDragging) {
            isDragging = false;
            statusDisplay.classList.remove('dragging');
        }
    });
}

// Update animation status display
export function updateAnimationStatus(currentPoint) {
    if (!currentPoint) return;
    
    const speedElement = document.getElementById('current-speed');
    const timeElement = document.getElementById('current-time');
    const distanceElement = document.getElementById('current-distance');
    const progressElement = document.getElementById('current-progress');
    
    if (speedElement) {
        const speed = currentPoint.properties.speed !== undefined ? formatSpeed(currentPoint.properties.speed) : 'N/A';
        speedElement.textContent = speed;
    }
    
    if (timeElement) {
        const time = currentPoint.properties.timestamp ? 
            new Date(currentPoint.properties.timestamp).toLocaleTimeString() : 'Unknown';
        timeElement.textContent = time;
    }
    
    if (distanceElement) {
        const distance = currentPoint.properties.distance !== undefined ? 
            `${(currentPoint.properties.distance / 1000).toFixed(1)} km` : 'N/A';
        distanceElement.textContent = distance;
    }
    
    if (progressElement) {
        const progress = appState.animationCoords.length > 0 ? 
            Math.round((appState.animationIndex / appState.animationCoords.length) * 100) : 0;
        progressElement.textContent = `${progress}%`;
    }
}
