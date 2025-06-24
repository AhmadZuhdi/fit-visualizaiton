// Map layers and visualization functions
import { appState } from './config.js';
import { getSpeedColor, createTooltip } from './data-utils.js';

export function showRoute() {
    clearAllLayers();
    
    if (!appState.geoJsonData) return;
    
    const routeCoords = appState.geoJsonData.features.map(feature => {
        const coords = feature.geometry.coordinates;
        return [coords[1], coords[0]];
    });
    
    appState.routeLayer = L.polyline(routeCoords, {
        color: '#2563eb',
        weight: 4,
        opacity: 0.8,
        smoothFactor: 1
    }).addTo(appState.map);
    
    appState.currentMode = 'route';
}

export function showPoints() {
    clearAllLayers();
    
    if (!appState.geoJsonData) return;
    
    const pointsGroup = L.layerGroup();
    
    appState.geoJsonData.features.forEach((feature, index) => {
        const coords = feature.geometry.coordinates[0];
        const speed = feature.properties.speed || 0;
        
        const marker = L.circleMarker([coords[0], coords[1]], {
            radius: 4,
            fillColor: getSpeedColor(speed),
            color: '#000',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        });
        
        if (appState.showTooltips) {
            marker.bindTooltip(createTooltip(feature.properties, index), {
                permanent: false,
                direction: 'top',
                className: 'custom-tooltip'
            });
        }
        
        pointsGroup.addLayer(marker);
    });
    
    appState.pointsLayer = pointsGroup.addTo(appState.map);
    appState.currentMode = 'points';
}

export function showHeatmap() {
    clearAllLayers();
    
    if (!appState.geoJsonData) return;
    
    const routeCoords = appState.geoJsonData.features.map(feature => {
        const coords = feature.geometry.coordinates;
        return [coords[1], coords[0]];
    });
    
    const segments = [];
    for (let i = 0; i < routeCoords.length - 1; i++) {
        const feature = appState.geoJsonData.features[i];
        const speed = feature.properties.speed || 0;
        
        const segment = L.polyline([routeCoords[i], routeCoords[i + 1]], {
            color: getSpeedColor(speed),
            weight: 6,
            opacity: 0.8
        });
        
        segments.push(segment);
    }
    
    appState.routeLayer = L.layerGroup(segments).addTo(appState.map);
    appState.currentMode = 'heatmap';
}

export function clearAllLayers() {
    if (appState.routeLayer) {
        appState.map.removeLayer(appState.routeLayer);
        appState.routeLayer = null;
    }
    if (appState.pointsLayer) {
        appState.map.removeLayer(appState.pointsLayer);
        appState.pointsLayer = null;
    }
}
