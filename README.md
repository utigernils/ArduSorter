# ArduSorter

A web-based machine learning sorting system that combines computer vision with Arduino control. ArduSorter uses TensorFlow.js to classify objects in real-time through your webcam and sends commands to an Arduino for automated sorting.
> [!NOTE]  
> This project is inspired by the "Tiny Sorter" from "experiments.withgoogle.com"

## Features

- **Real-time Object Classification**: Uses TensorFlow.js models to classify objects from webcam feed
- **Arduino Integration**: Communicates with Arduino via Web Serial API for hardware control
- **Custom Model Support**: Load your own trained models (JSON + weights format)
- **Configurable Class Mapping**: Map classification results to custom Arduino commands
- **Live Serial Monitor**: Monitor communication between the web app and Arduino
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS

> [!TIP]
> Heres a sorter i also designed: (LINK NOT READY YET)

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **ML Framework**: TensorFlow.js
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Hardware Communication**: Web Serial API
- **Icons**: Lucide React

## Prerequisites

- **Browser**: Chrome or Edge (Web Serial API support required)
- **Arduino**: Compatible Arduino (Usb serial interface required) board connected via USB
- **Model Files**: TensorFlow.js model in JSON format with corresponding weight files

## Installation
> [!TIP]
> Installation is not actually needed, I host the newest build of ArduSorter [here](https://ardu-sorter.utigernils.ch/)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/utigernils/ArduSorter.git
   cd ArduSorter
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to `http://localhost:5173` in Chrome or Edge

## Usage

### 1. Prepare Your Model

Ensure you have:
- `model.json` file (TensorFlow.js model architecture)
- Weight files (`.bin` files or shards)
- List of class labels for your model

### 2. Connect Arduino

1. Connect your Arduino to your computer via USB
2. Make sure your Arduino sketch is configured to receive serial commands
3. Click "Connect Arduino" in the web interface
4. Select your Arduino's COM port from the browser dialog
> [!TIP]
> A matching .ino is also contained in the repository.  

### 3. Load Your Model

1. Click "Select Model Files"
2. Choose your `model.json` and all weight files
3. Enter your class labels (comma-separated, e.g., "red,green,blue,nothing")
4. Click "Load Model from Files"

### 4. Configure Class Mapping (Optional)

Map classification results to specific Arduino commands:
- Enter the class name and corresponding command
- Commands will be sent to Arduino when that class is detected

### 5. Start Classification

1. Ensure your webcam is accessible
2. Click "Start Classification"
3. The system will classify objects every second
4. Commands are automatically sent to Arduino based on predictions

## Model Requirements

Your TensorFlow.js model should:
- Accept 224x224 RGB images as input
- Output probabilities for each class
- Be in the standard TensorFlow.js format (model.json + weights)

## Troubleshooting

### Serial Connection Issues
- Ensure you're using Chrome or Edge browser
- Check that your Arduino is properly connected
- Verify the correct baud rate (115200)
- Make sure no other applications are using the serial port

### Model Loading Issues
- Verify all model files are selected (JSON + weights)
- Check that your model is in TensorFlow.js format
- Ensure file names match the expected pattern

### Webcam Issues
- Grant camera permissions when prompted
- Check that no other applications are using the camera
- Ensure your browser supports WebRTC

## Browser Compatibility

- ✅ Chrome (recommended)
- ✅ Edge
- ❌ Firefox (Web Serial API not supported)
- ❌ Safari (Web Serial API not supported)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

[MIT License](LICENSE)

## Acknowledgments

- TensorFlow.js team for the machine learning framework
- Web Serial API for enabling browser-hardware communication
- React and Vite communities for the excellent development tools
