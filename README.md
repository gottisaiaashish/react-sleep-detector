# react-sleep-detector 😴🚨

A plug-and-play React component that uses computer vision (`face-api.js`) to detect if a user has fallen asleep in front of their webcam. If their eyes remain closed for a specified threshold, it triggers a loud web audio siren and displays a customizable "WAKE UP" popup.

Perfect for Ed-Tech platforms, productivity tools, and focus monitoring apps.

## Features
- **Real-time Eye Aspect Ratio (EAR) calculation** using `face-api.js`
- **Built-in Audio Context Siren** to wake the user up
- **Customizable thresholds** for eye closeness and sleep duration
- **Fully customizable UI** (Override the default popup or pass your own styles)
- **Zero-config setup** available

## Installation

```bash
npm install react-sleep-detector
```

> **Note**: You must also install the peer dependencies if you haven't already:
> `npm install react react-dom @vladmandic/face-api lucide-react`

## Model Files Required
Since this package relies on `face-api.js`, you need to serve the neural network models from your public directory.
1. Download the `tiny_face_detector` and `face_landmark_68` model weights from the [face-api.js weights repository](https://github.com/justadudewhohacks/face-api.js/tree/master/weights).
2. Place them in your project's `public/models` directory.

## Basic Usage

```jsx
import React from 'react';
import { SleepDetector } from 'react-sleep-detector';

function App() {
  return (
    <div>
      <h1>My Study App</h1>
      
      {/* Renders invisibly in the background and monitors user */}
      <SleepDetector 
        isActive={true} 
        modelsUrl="/models" 
      />
      
    </div>
  );
}

export default App;
```

## Advanced Customization

You can control exactly how the detector behaves:

```jsx
<SleepDetector 
  isActive={true}
  modelsUrl="/models"
  sleepThresholdMs={4000} // Wait 4 seconds before triggering alarm (Default: 3000)
  earThreshold={0.25} // Sensitivity of eye closure (Default: 0.28)
  alarmTimeoutMs={15000} // Auto-dismiss alarm after 15s (Default: 10000)
  onSleepDetected={() => console.log("User fell asleep!")} // Callback function
  customStyles={{
    overlay: { backgroundColor: 'rgba(255,0,0,0.5)' },
    title: { fontSize: '2rem' }
  }}
/>
```

### Complete Custom UI
If you don't like the default popup, you can render your own:

```jsx
<SleepDetector 
  customAlarmPopup={({ onDismiss }) => (
    <div className="my-custom-alarm">
      <h2>Hey! Wake up!</h2>
      <button onClick={onDismiss}>I'm awake!</button>
    </div>
  )}
/>
```

## Credits
Created by Developer Ashish.
