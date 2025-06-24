// Map layers and visualization functions for OpenLayers
import { appState } from './config.js';
import { getSpeedColor, createTooltip } from './data-utils.js';

export function showRoute() {
    clearAllLayers();
    
    if (!appState.geoJsonData) return;
    
    const routeCoords = appState.geoJsonData.features.map(feature => {
        const coords = feature.geometry.coordinates;
        return ol.proj.fromLonLat([coords[1], coords[0]]);
    });
    
    const routeFeature = new ol.Feature({
        geometry: new ol.geom.LineString(routeCoords)
    });
    
    const routeStyle = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#2563eb',
            width: 4
        })
    });
    
    routeFeature.setStyle(routeStyle);
    
    appState.routeLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: [routeFeature]
        })
    });
    
    appState.map.addLayer(appState.routeLayer);
    appState.currentMode = 'route';
}

export function showPoints() {
    clearAllLayers();
    
    if (!appState.geoJsonData) return;
    
    const features = [];
    
    appState.geoJsonData.features.forEach((feature, index) => {
        const coords = feature.geometry.coordinates[0];
        const speed = feature.properties.speed || 0;
        
        const pointFeature = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat([coords[1], coords[0]])),
            properties: feature.properties,
            index: index
        });
        
        const pointStyle = new ol.style.Style({
            image: new ol.style.Circle({
                radius: 4,
                fill: new ol.style.Fill({
                    color: getSpeedColor(speed)
                }),
                stroke: new ol.style.Stroke({
                    color: '#000',
                    width: 1
                })
            })
        });
        
        pointFeature.setStyle(pointStyle);
        features.push(pointFeature);
    });
    
    appState.pointsLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: features
        })
    });
    
    appState.map.addLayer(appState.pointsLayer);
    appState.currentMode = 'points';
    
    // Add tooltip interaction if needed
    if (appState.showTooltips) {
        addTooltipInteraction();
    }
}

export function showHeatmap() {
    clearAllLayers();
    
    if (!appState.geoJsonData) return;
    
    const features = [];
    
    for (let i = 0; i < appState.geoJsonData.features.length - 1; i++) {
        const feature = appState.geoJsonData.features[i];
        const nextFeature = appState.geoJsonData.features[i + 1];
        const speed = feature.properties.speed || 0;
        
        const coords1 = feature.geometry.coordinates;
        const coords2 = nextFeature.geometry.coordinates;
        
        const segmentFeature = new ol.Feature({
            geometry: new ol.geom.LineString([
                ol.proj.fromLonLat([coords1[1], coords1[0]]),
                ol.proj.fromLonLat([coords2[1], coords2[0]])
            ])
        });
        
        const segmentStyle = new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: getSpeedColor(speed),
                width: 6
            })
        });
        
        segmentFeature.setStyle(segmentStyle);
        features.push(segmentFeature);
    }
    
    appState.routeLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: features
        })
    });
    
    appState.map.addLayer(appState.routeLayer);
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

function addTooltipInteraction() {
    // Create overlay for tooltip
    const tooltipElement = document.createElement('div');
    tooltipElement.className = 'ol-tooltip';
    
    const tooltip = new ol.Overlay({
        element: tooltipElement,
        offset: [10, 0],
        positioning: 'bottom-left'
    });
    
    appState.map.addOverlay(tooltip);
    
    // Add pointer move event
    appState.map.on('pointermove', function(evt) {
        const feature = appState.map.forEachFeatureAtPixel(evt.pixel, function(feature) {
            return feature;
        });
        
        if (feature && feature.get('properties')) {
            const properties = feature.get('properties');
            const index = feature.get('index');
            tooltipElement.innerHTML = createTooltip(properties, index);
            tooltip.setPosition(evt.coordinate);
            tooltipElement.style.display = 'block';
        } else {
            tooltipElement.style.display = 'none';
        }
    });
}
