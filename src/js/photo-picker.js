import { appState } from './config.js';
import exif from 'exifreader'

// Convert DMS (Degrees, Minutes, Seconds) to decimal degrees
function convertDMSToDecimal(dmsData, direction) {
    // Handle EXIF array format: [[degrees_num, degrees_den], [minutes_num, minutes_den], [seconds_num, seconds_den]]
    // Example: [[6, 1], [15, 1], [383522400, 10000000]]
    console.log('Converting DMS:', dmsData, 'Direction:', direction);
    
    let decimal = 0;
    
    // Handle array format (EXIF standard)
    if (Array.isArray(dmsData) && dmsData.length === 3) {
        const degrees = dmsData[0][0] / dmsData[0][1];  // degrees numerator / denominator
        const minutes = dmsData[1][0] / dmsData[1][1];  // minutes numerator / denominator
        const seconds = dmsData[2][0] / dmsData[2][1];  // seconds numerator / denominator
        
        decimal = degrees + (minutes / 60) + (seconds / 3600);
        console.log(`Converted: ${degrees}° ${minutes}' ${seconds}" = ${decimal}`);
    } else if (typeof dmsData === 'number') {
        // Handle single number
        decimal = dmsData;
    } else {
        console.warn('Could not parse DMS data:', dmsData);
        return null;
    }
    
    // Apply direction (South and West are negative)
    return (direction === 'S' || direction === 'W') ? -decimal : decimal;
}

// Parse EXIF date format "YYYY:MM:DD HH:MM:SS" to JavaScript Date
function parseExifDate(exifDateString) {
    // EXIF date format: "2024:12:25 14:30:45"
    console.log('Parsing EXIF date:', exifDateString);
    
    if (!exifDateString || typeof exifDateString !== 'string') {
        return new Date();
    }
    
    // Replace colons in date part with dashes for proper parsing
    // "2024:12:25 14:30:45" becomes "2024-12-25 14:30:45"
    const standardFormat = exifDateString.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3');
    
    const parsedDate = new Date(standardFormat);
    
    // Check if the date is valid
    if (isNaN(parsedDate.getTime())) {
        console.warn('Invalid EXIF date format:', exifDateString);
        return new Date();
    }
    
    console.log('Parsed date:', parsedDate);
    return parsedDate;
}

document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('photo-picker');
    if (!fileInput) return;

    fileInput.addEventListener('change', function(event) {

        appState.images = []; // Reset images array

        Object.values(event.target.files).forEach(file => {
            console.log('File selected:', file.name, 'Size:', file.size, 'Bytes');
            const reader = new FileReader();
            reader.onload = async function(e) {
                const arrayBuffer = e.target.result;
                const tags = await exif.load(arrayBuffer);
                console.log('EXIF Tags:', tags);
                
                if (tags.GPSLatitude && tags.GPSLongitude) {
                    console.log('GPS Coordinates:', tags.GPSLatitude.description, tags.GPSLongitude.description);
                    
                    // Convert DMS to decimal degrees
                    const lat = convertDMSToDecimal(tags.GPSLatitude.value, tags.GPSLatitudeRef?.value[0] || 'N');
                    const lng = convertDMSToDecimal(tags.GPSLongitude.value, tags.GPSLongitudeRef?.value[0] || 'E');
                    console.log('Converted to decimal:', lat, lng);
                    
                    const coor = [lat, lng];                    

                    const marker = L.marker(coor, {
                        icon: L.divIcon({
                            className: 'photo-marker',
                            html: `<div style="background: rgba(255, 255, 255, 0.8); padding: 4px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                            <img src="${URL.createObjectURL(file)}" style="width: 100%; height: auto; border-radius: 4px;">
                            </div>`,
                            iconSize: [60, 60],
                            iconAnchor: [30, 30]
                        })                
                    })
                    .addTo(appState.map);

                    appState.images.push({
                        marker,
                        timestamp: tags.DateTimeOriginal ? parseExifDate(tags.DateTimeOriginal.description) : new Date()
                    });
                }
            };
            reader.readAsArrayBuffer(file);
        });
    });
});