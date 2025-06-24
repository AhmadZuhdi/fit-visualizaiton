// Video recording functionality using canvas-record
import { Recorder, RecorderStatus } from 'canvas-record';
import { appState, RecordingWorkflowStatus } from './config.js';
import { getAnimationInterval, stopAnimation, showAnimatedRoute } from './animation.js';

export async function initializeCanvasRecording() {
    console.log('Initializing canvas recording...');
    try {
        const testCanvas = document.createElement('canvas');
        testCanvas.width = 100;
        testCanvas.height = 100;
        const testContext = testCanvas.getContext('2d');
        
        const testRecorder = new Recorder(testContext, {
            name: 'test',
            duration: 1
        });
        
        await testRecorder.dispose();
        
        console.log('Canvas recording initialized successfully');
        return true;
    } catch (error) {
        console.error('Failed to initialize canvas recording:', error);
        return false;
    }
}

function createCompositeCanvas() {
    const mapContainer = document.getElementById('map');
    const rect = mapContainer.getBoundingClientRect();
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = rect.width * pixelRatio;
    canvas.height = rect.height * pixelRatio;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    
    context.scale(pixelRatio, pixelRatio);
    
    return { canvas, context };
}

function captureMapFrame(context) {
    const mapContainer = document.getElementById('map');
    const rect = mapContainer.getBoundingClientRect();
    
    context.clearRect(0, 0, rect.width, rect.height);
    
    const canvases = mapContainer.querySelectorAll('canvas');
    
    canvases.forEach(canvas => {
        if (canvas.width > 0 && canvas.height > 0) {
            try {
                const canvasRect = canvas.getBoundingClientRect();
                const x = canvasRect.left - rect.left;
                const y = canvasRect.top - rect.top;
                
                context.drawImage(canvas, x, y, canvasRect.width, canvasRect.height);
            } catch (error) {
                console.warn('Could not draw canvas:', error);
            }
        }
    });
}

async function createRecorder(options = {}) {
    const { canvas, context } = createCompositeCanvas();
    appState.recordingCanvas = canvas;
    appState.recordingContext = context;
    
    const defaultOptions = {
        name: `map-recording-${Date.now()}`,
        duration: appState.recordingDuration,
        frameRate: appState.recordingFrameRate,
        extension: appState.recordingFormat,
        download: true,
        target: 'in-browser',
        ...options
    };
    
    appState.canvasRecorder = new Recorder(context, defaultOptions);
    return appState.canvasRecorder;
}

export async function startRecording(options = {}) {
    try {
        appState.recordingStatus = RecordingWorkflowStatus.RECORDING;
        updateRecordingUI();
        
        if (!appState.canvasRecorder) {
            await createRecorder(options);
        }
        
        await appState.canvasRecorder.start();
        appState.isRecording = true;
        appState.recordingFrameCount = 0;
        
        console.log('Recording started');
        recordFrame();
        
    } catch (error) {
        console.error('Failed to start recording:', error);
        appState.recordingStatus = RecordingWorkflowStatus.ERROR;
        updateRecordingUI();
        throw error;
    }
}

async function recordFrame() {
    if (!appState.isRecording || !appState.canvasRecorder || !appState.recordingContext) {
        return;
    }
    
    try {
        captureMapFrame(appState.recordingContext);
        
        await appState.canvasRecorder.step();
        appState.recordingFrameCount++;
        
        updateRecordingProgress();
        
        if (appState.canvasRecorder.status === RecorderStatus.Recording) {
            requestAnimationFrame(() => recordFrame());
        } else {
            await stopRecording();
        }
        
    } catch (error) {
        console.error('Error recording frame:', error);
        await stopRecording();
        appState.recordingStatus = RecordingWorkflowStatus.ERROR;
        updateRecordingUI();
    }
}

export async function stopRecording() {
    try {
        appState.recordingStatus = RecordingWorkflowStatus.PROCESSING;
        updateRecordingUI();
        
        appState.isRecording = false;
        
        if (appState.canvasRecorder) {
            const result = await appState.canvasRecorder.stop();
            console.log('Recording completed:', result);
            
            appState.canvasRecorder.dispose();
            appState.canvasRecorder = null;
        }
        
        appState.recordingStatus = RecordingWorkflowStatus.COMPLETED;
        updateRecordingUI();
        
        setTimeout(() => {
            appState.recordingStatus = RecordingWorkflowStatus.IDLE;
            updateRecordingUI();
        }, 3000);
        
    } catch (error) {
        console.error('Failed to stop recording:', error);
        appState.recordingStatus = RecordingWorkflowStatus.ERROR;
        updateRecordingUI();
        throw error;
    }
}

function updateRecordingUI() {
    const recordButton = document.getElementById('record-button');
    const recordingIndicator = document.getElementById('recording-indicator');
    const recordingProgress = document.getElementById('recording-progress');
    
    if (!recordButton) return;
    
    const buttonStates = {
        [RecordingWorkflowStatus.IDLE]: { text: '🎥 Record', disabled: false, className: 'record-button' },
        [RecordingWorkflowStatus.RECORDING]: { text: '⏹ Stop Recording', disabled: false, className: 'record-button recording' },
        [RecordingWorkflowStatus.PROCESSING]: { text: '⏳ Processing...', disabled: true, className: 'record-button processing' },
        [RecordingWorkflowStatus.COMPLETED]: { text: '✅ Completed', disabled: true, className: 'record-button completed' },
        [RecordingWorkflowStatus.ERROR]: { text: '❌ Error', disabled: false, className: 'record-button error' }
    };
    
    const state = buttonStates[appState.recordingStatus];
    if (state) {
        recordButton.textContent = state.text;
        recordButton.disabled = state.disabled;
        recordButton.className = state.className;
    }
    
    if (recordingIndicator) {
        const indicatorStates = {
            [RecordingWorkflowStatus.IDLE]: { display: 'none', text: '' },
            [RecordingWorkflowStatus.RECORDING]: { display: 'block', text: '🔴 Recording...' },
            [RecordingWorkflowStatus.PROCESSING]: { display: 'block', text: '⏳ Processing video...' },
            [RecordingWorkflowStatus.COMPLETED]: { display: 'block', text: '✅ Recording saved!' },
            [RecordingWorkflowStatus.ERROR]: { display: 'block', text: '❌ Recording failed' }
        };
        
        const indicatorState = indicatorStates[appState.recordingStatus];
        if (indicatorState) {
            recordingIndicator.style.display = indicatorState.display;
            recordingIndicator.textContent = indicatorState.text;
        }
    }
    
    if (recordingProgress) {
        const showProgress = appState.recordingStatus === RecordingWorkflowStatus.RECORDING;
        recordingProgress.style.display = showProgress ? 'block' : 'none';
    }
}

function updateRecordingProgress() {
    const progressElement = document.getElementById('recording-progress');
    if (!progressElement || !appState.canvasRecorder) return;
    
    const totalFrames = appState.recordingDuration * appState.recordingFrameRate;
    const progress = (appState.recordingFrameCount / totalFrames) * 100;
    const timeRemaining = Math.max(0, (totalFrames - appState.recordingFrameCount) / appState.recordingFrameRate);
    
    progressElement.innerHTML = `
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
        <div class="progress-text">
            ${appState.recordingFrameCount}/${totalFrames} frames | ${timeRemaining.toFixed(1)}s remaining
        </div>
    `;
}

export function setRecordingOptions(options) {
    if (options.duration !== undefined) appState.recordingDuration = options.duration;
    if (options.frameRate !== undefined) appState.recordingFrameRate = options.frameRate;
    if (options.format !== undefined) appState.recordingFormat = options.format;
}

export async function toggleRecording() {
    if (appState.isRecording) {
        await stopRecording();
    } else {
        await startRecording();
    }
}

export async function recordAnimationSequence(options = {}) {
    if (!appState.geoJsonData || !appState.animationCoords) {
        throw new Error('No animation data available');
    }
    
    try {
        const animationSpeedMs = getAnimationInterval();
        const totalFrames = appState.animationCoords.length;
        const animationDurationSeconds = (totalFrames * animationSpeedMs) / 1000;
        
        const recordingOptions = {
            duration: animationDurationSeconds,
            frameRate: appState.recordingFrameRate,
            name: `animation-${Date.now()}`,
            ...options
        };
        
        await startRecording(recordingOptions);
        
        stopAnimation();
        await new Promise(resolve => setTimeout(resolve, 100));
        
        showAnimatedRoute();
        
        console.log(`Recording animation for ${animationDurationSeconds} seconds`);
        
    } catch (error) {
        console.error('Failed to record animation:', error);
        throw error;
    }
}
