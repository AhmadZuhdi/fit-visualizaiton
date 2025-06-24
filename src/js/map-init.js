// Map initialization and basic setup with OpenLayers
import { appState } from './config.js';

export function initializeMap() {
    // Create OpenLayers map with tilt and rotation capabilities
    appState.map = new ol.Map({
        target: 'map',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([106.91896677017212, -6.298276036977768]),
            zoom: 15,
            rotation: 0, // Can be rotated
            // enableRotation: true // Allow rotation
        }),
        controls: ol.control.defaults.defaults().extend([
            new ol.control.FullScreen()
        ])
    });
    
    // Add rotation control (optional)
    const rotationControl = new ol.control.Control({
        element: createRotationControl()
    });
    appState.map.addControl(rotationControl);
}

function createRotationControl() {
    const element = document.createElement('div');
    element.className = 'rotation-control ol-unselectable ol-control';
    element.innerHTML = `
        <button title="Rotate Left" id="rotate-left">↺</button>
        <button title="Reset Rotation" id="reset-rotation">⌂</button>
        <button title="Rotate Right" id="rotate-right">↻</button>
    `;
    
    element.addEventListener('click', function(e) {
        const view = appState.map.getView();
        const currentRotation = view.getRotation();
        
        if (e.target.id === 'rotate-left') {
            view.setRotation(currentRotation - Math.PI / 8);
        } else if (e.target.id === 'rotate-right') {
            view.setRotation(currentRotation + Math.PI / 8);
        } else if (e.target.id === 'reset-rotation') {
            view.setRotation(0);
        }
    });
    
    return element;
}

export function fitToBounds() {
    if (!appState.geoJsonData) return;
    
    console.log(appState.geoJsonData.features[0], 'features to display');
    
    // Calculate extent for OpenLayers
    const coordinates = [];
    appState.geoJsonData.features.forEach(feature => {
        const coords = feature.geometry.coordinates[0];
        const transformedCoord = ol.proj.fromLonLat([coords[1], coords[0]]);
        coordinates.push(transformedCoord);
    });
    
    if (coordinates.length > 0) {
        const extent = ol.extent.boundingExtent(coordinates);
        appState.map.getView().fit(extent, { padding: [20, 20, 20, 20] });
    }
}
