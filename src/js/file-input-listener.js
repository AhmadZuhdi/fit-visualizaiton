import EzFit from 'easy-fit';
import { appState } from './config.js';
import { calculateStatistics, updateInfoPanel } from './data-utils.js';
import {showRoute} from './map-layers.js'
import { fitToBounds } from './map-init.js';

// Convert callback-based ezFit.parse to Promise
function parseFitFile(ezFit, uint8Array) {
    return new Promise((resolve, reject) => {
        ezFit.parse(uint8Array, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('file-input');
    if (!fileInput) return;

    const ezFit = new EzFit();

    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async function(e) {
            // e.target.result is an ArrayBuffer
            const arrayBuffer = e.target.result;
            // You can convert to Uint8Array if needed
            const uint8Array = new Uint8Array(arrayBuffer);
            // Do something with the file data here
            console.log('File loaded:', file.name, 'Size:', file.size, 'Bytes');            try {
                const data = await parseFitFile(ezFit, uint8Array);

                if (!data?.records) {
                    console.error('No records found in FIT file');
                    return;
                }

                console.log(data.records[0]);

                const geojson = {
                    type: "FeatureCollection",
                    features: data.records.map((record, i) => ({
                        type: "Feature",
                        properties: {
                            "timestamp": record.timestamp,
                            "time": record.timestamp,
                            "elapsed_time": record.elapsed_time,
                            "position_lat": record.position_lat,
                            "position_long": record.position_long,
                            "distance": record.distance,
                            "altitude": record.altitude,
                            "speed": record.speed * 3.6, // Convert m/s to km/h
                            "heart_rate": record.heart_rate,
                            "temperature": record.temperature,
                        },
                        geometry: {
                            type: "LineString",
                            coordinates: [
                                [data.records[i === 0 ? 0 : i - 1].position_lat, data.records[i === 0 ? 0 : i - 1].position_long],
                                [record.position_lat, record.position_long],
                            ]
                        }
                    }))
                };

                appState.geoJsonData = geojson;
                console.log('GeoJSON loaded:', geojson.features.length, 'features');

                const stats = calculateStatistics(geojson.features);
                updateInfoPanel(stats);
                showRoute()
                fitToBounds()
            } catch (err) {
                console.error('Error parsing FIT file:', err);
            }
        };
        reader.readAsArrayBuffer(file);
    });
});
