// Data utilities and statistics calculations
import { features } from 'process';
import { appState } from './config.js';

export function getSpeedColor(speed) {
    const speedKmh = convertSpeed(speed);
    if (speedKmh < 5) return '#0066cc';
    if (speedKmh < 15) return '#00cc66';
    if (speedKmh < 25) return '#cccc00';
    if (speedKmh < 35) return '#cc6600';
    return '#cc0000';
}

export function convertSpeed(speedMs) {
    const speedKmh = speedMs * 3.6;
    return appState.speedUnit === 'mph' ? speedKmh * 0.621371 : speedKmh;
}

export function getSpeedUnitLabel() {
    return appState.speedUnit === 'kmh' ? 'km/h' : 'mph';
}

export function formatSpeed(speedMs) {
    const converted = convertSpeed(speedMs);
    return `${converted.toFixed(1)} ${getSpeedUnitLabel()}`;
}

export function calculateStatistics(features) {
    if (!features || features.length === 0) return {};

    let totalDistance = 0;
    let totalTime = 0;
    let speeds = [];
    let heartRates = [];
    let minTime = Infinity;
    let maxTime = -Infinity;

    features.forEach((feature, index) => {
        const props = feature.properties;
        const coords = feature.geometry.coordinates;
        
        if (props.time) {
            const time = new Date(props.time).getTime();
            minTime = Math.min(minTime, time);
            maxTime = Math.max(maxTime, time);
        }
        
        if (props.speed !== undefined) {
            speeds.push(props.speed);
        }
        
        if (props.heart_rate !== undefined) {
            heartRates.push(props.heart_rate);
        }
        
        if (index > 0) {
            const prevCoords = features[index - 1].geometry.coordinates;
            const distance = getDistance(
                [prevCoords[1], prevCoords[0]],
                [coords[1], coords[0]]
            );
            totalDistance += distance;
        }
    });

    totalTime = (maxTime - minTime) / 1000;
    const avgSpeed = speeds.length > 0 ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 0;
    const maxSpeed = speeds.length > 0 ? Math.max(...speeds) : 0;
    const avgHeartRate = heartRates.length > 0 ? heartRates.reduce((a, b) => a + b, 0) / heartRates.length : 0;

    return {
        totalPoints: features.length,
        totalDistance: totalDistance,
        duration: totalTime,
        avgSpeed: avgSpeed,
        maxSpeed: maxSpeed,
        avgHeartRate: avgHeartRate
    };
}

export function getDistance(coords1, coords2) {
    const R = 6371e3;
    const φ1 = coords1[0] * Math.PI/180;
    const φ2 = coords2[0] * Math.PI/180;
    const Δφ = (coords2[0]-coords1[0]) * Math.PI/180;
    const Δλ = (coords2[1]-coords1[1]) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
}

export function updateInfoPanel(stats) {
    document.getElementById('total-points').textContent = `Total Points: ${stats.totalPoints}`;
    document.getElementById('total-distance').textContent = `Total Distance: ${(stats.totalDistance / 1000).toFixed(2)} km`;
    
    const hours = Math.floor(stats.duration / 3600);
    const minutes = Math.floor((stats.duration % 3600) / 60);
    const seconds = Math.floor(stats.duration % 60);
    document.getElementById('duration').textContent = `Duration: ${hours}h ${minutes}m ${seconds}s`;
    
    document.getElementById('avg-speed').textContent = `Avg Speed: ${formatSpeed(stats.avgSpeed)}`;
    document.getElementById('max-speed').textContent = `Max Speed: ${formatSpeed(stats.maxSpeed)}`;
    document.getElementById('avg-heart-rate').textContent = `Avg Heart Rate: ${stats.avgHeartRate.toFixed(0)} bpm`;
}

export function createTooltip(properties, index) {
    const time = properties.time ? new Date(properties.time).toLocaleTimeString() : 'Unknown';
    const speed = properties.speed !== undefined ? formatSpeed(properties.speed) : 'N/A';
    const heartRate = properties.heart_rate !== undefined ? `${properties.heart_rate} bpm` : 'N/A';
    const elevation = properties.ele !== undefined ? `${properties.ele.toFixed(1)}m` : 'N/A';
    
    return `
        <div style="font-size: 12px;">
            <strong>Point ${index + 1}</strong><br>
            Time: ${time}<br>
            Speed: ${speed}<br>
            Heart Rate: ${heartRate}<br>
            Elevation: ${elevation}
        </div>
    `;
}

export async function loadGeoJsonData() {
    try {
        // const geoJsonDataUrl = await import('../data/Morning_Ride.geojson');
        // const response = await fetch(geoJsonDataUrl.default);
        const data = {features: []}; // Placeholder for actual GeoJSON data loading logic
        appState.geoJsonData = data;
        console.log('GeoJSON loaded:', data.features.length, 'features');
        
        // const stats = calculateStatistics(data.features);
        // updateInfoPanel(stats);
        
        return data;
    } catch (error) {
        console.error('Error loading GeoJSON:', error);
        document.getElementById('total-points').textContent = 'Error loading data';
        return null;
    }
}
