// Map initialization and basic setup
import { appState } from './config.js';

export function initializeMap() {
    appState.map = L.map('map', { preferCanvas: true }).setView([-7.9050484,112.90805], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(appState.map);
}

export function fitToBounds() {
    if (!appState.geoJsonData) return;
    
    const group = new L.featureGroup();
    console.log(appState.geoJsonData.features[0], 'features to display');
    
    // If we're in animation mode and have trimmed coords, use those
    if (appState.animationCoords && appState.animationCoords.length > 0) {
        console.log('Using trimmed animation coordinates for fit bounds');
        appState.animationCoords.forEach(point => {
            const marker = L.marker(point.latlng);
            group.addLayer(marker);
        });
    } else {
        // Use all coordinates
        appState.geoJsonData.features.forEach(feature => {
            const coords = feature.geometry.coordinates[0];
            const marker = L.marker([coords[0], coords[1]]);
            group.addLayer(marker);
        });
    }
    
    appState.map.fitBounds(group.getBounds().pad(0.1));
}
