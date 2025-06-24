# Flyover Effect Video

A modern web application for visualizing GPS tracking data from FIT files with animated route playback and video recording capabilities (WIP). Create stunning flyover-style videos of your bike rides, runs, or other GPS activities.

## Features

### 🗺️ Interactive Map Visualization
- **Multiple Display Modes**: Route lines, individual points, and speed-based heatmaps
- **Real-time Animation**: Smooth playback of your GPS track with customizable speed
- **Interactive Controls**: Play, pause, step-through, and restart animations
- **Follow Mode**: Camera automatically follows the animated marker
- **Tooltips**: Detailed information on hover (speed, heart rate, elevation, time)

### 📊 Data Analysis
- **Comprehensive Statistics**: Total distance, duration, average/max speed, heart rate
- **Speed Visualization**: Color-coded segments based on speed zones
- **Multi-unit Support**: Switch between km/h and mph (WIP)
- **Real-time Updates**: Live progress tracking during animation

### 🎥 Video Recording (WIP)
- **Browser-based Recording**: No external software required
- **Multiple Formats**: MP4, WebM, and GIF export
- **Customizable Settings**: Frame rate (24-60 fps), duration, quality
- **Animation Recording**: Automatically record the entire route animation
- **Progress Tracking**: Real-time recording progress with frame counting

### 📱 Social Media Ready
- **Preset Sizes**: Optimized for YouTube, Instagram, TikTok, Twitter, Facebook
- **Custom Dimensions**: Set any width/height for specific requirements
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Clean, intuitive interface with emoji icons

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Setup
1. Clone the repository:
```bash
git clone <repository-url>
cd flyover-effect-video
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

### Loading Data
1. Click the file input in the info panel
2. Select a FIT file from your device
3. The app will automatically convert and load your GPS data

### Visualization Modes
- **Show Route**: Display the complete route as a colored line
- **Show Points**: Show individual GPS points with speed-based colors
- **Speed Heatmap**: Color-coded route segments based on speed
- **Animate Route**: Playback the route with a moving marker

### Recording Videos
1. Set your desired map size using the Size controls
2. Configure recording settings (duration, frame rate, format)
3. Click "Start Recording" for manual recording
4. Or use "Record Animation" to automatically record the route playback

### Customization
- **Speed Units**: Toggle between km/h and mph
- **Tooltips**: Enable/disable information popups
- **Animation Speed**: Adjust playback speed (5-1000ms intervals)
- **Map Size**: Choose from social media presets or set custom dimensions

## File Structure

```
src/
├── geojson-map-refactored.html    # Main HTML file
├── css/
│   ├── map-styles.css             # Styling for map and UI components
│   └── style.css                  # Additional styles
├── js/
│   ├── main-point.js              # Main entry point and initialization
│   ├── config.js                  # Configuration and global state
│   ├── data-utils.js              # Data processing and statistics
│   ├── map-init.js                # Map initialization
│   ├── map-layers.js              # Map visualization layers
│   ├── animation.js               # Route animation functionality
│   ├── controls.js                # UI controls and interactions
│   ├── event-listeners.js         # Event handling
│   └── recording.js               # Video recording capabilities
```

## Architecture

The application follows a modular architecture with clear separation of concerns:

- **Config Module**: Centralized state management and configuration
- **Data Utils**: GPS data processing, statistics, and conversions
- **Map Modules**: Leaflet.js integration for map rendering and layers
- **Animation Module**: Route playback with smooth transitions
- **Recording Module**: Browser-based video capture using canvas-record
- **Event Handlers**: User interaction and control management

## Dependencies

### Core Libraries
- **Leaflet.js**: Interactive maps and geospatial visualization
- **canvas-record**: Browser-based video recording
- **fit-geojson-converter**: FIT file parsing and conversion

### Development Tools
- **Parcel**: Fast, zero-configuration build tool
- **Puppeteer**: Headless browser automation for video export
- **FFmpeg**: Video processing for server-side exports

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production bundle
- `npm run export-video` - Export video using headless browser (Node.js)
- `npm run clean` - Clean build artifacts

## Browser Compatibility

- Chrome/Chromium 88+
- Firefox 85+
- Safari 14+
- Edge 88+

*Note: Video recording requires modern browser APIs and may have limited support on older browsers.*

## Performance Considerations

- **Large Files**: Files with 10,000+ GPS points may impact performance
- **Animation Speed**: Lower intervals (faster animation) require more CPU
- **Recording Quality**: Higher frame rates and resolutions increase memory usage
- **Browser Memory**: Long recordings may consume significant RAM

## Troubleshooting

### Common Issues

**File won't load**: Ensure the file is a valid FIT format from a GPS device
**Slow animation**: Increase the interval value in animation controls
**Recording fails**: Check browser compatibility and available memory
**Map not displaying**: Verify internet connection for tile loading

### Browser Console
Check the browser console (F12) for detailed error messages and debugging information.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Acknowledgments

- Leaflet.js community for excellent mapping libraries
- OpenStreetMap contributors for map data
- GPS device manufacturers for FIT file specifications
- Browser vendors for advancing web APIs that make this possible

---

**Made with ❤️ for the cycling and fitness community**