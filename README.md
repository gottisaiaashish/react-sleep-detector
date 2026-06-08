# 😴 React Sleep Detector

An advanced, AI-powered React component that leverages computer vision and facial landmark detection (`face-api.js`) to monitor user focus in real-time. It calculates the Eye Aspect Ratio (EAR) to detect drowsiness and instantly triggers customizable audio-visual alerts.

Perfect for Ed-Tech platforms, productivity tools, e-learning environments, and driver-monitoring dashboards.

---

## 🚀 Features

- **Real-Time Monitoring**: Uses a lightweight AI model directly in the browser.
- **Privacy First**: All facial detection happens locally on the user's device. No video is ever recorded or sent to a server.
- **Audio-Visual Alerts**: Built-in siren using the Web Audio API and a customizable "Wake Up" modal.
- **Highly Customizable**: Override default thresholds, popup styles, and behaviors with simple props.
- **Zero-Config Option**: Works out-of-the-box with sensible defaults.

---

## 📦 Installation

Installing the package is a simple two-step process to ensure all peer dependencies and AI models are correctly set up.

### Step 1: Install the NPM Package
Run the following command in your terminal to install the package and its required dependencies:

```bash
npm install react-sleep-detector react react-dom @vladmandic/face-api lucide-react
```

### Step 2: Setup the AI Models (Crucial Step)
Because this package runs Machine Learning models in the browser, it needs access to the pre-trained weights. 

1. Create a folder named `models` inside your project's `public` directory (e.g., `public/models`).
2. Download the following required model files from the [face-api.js weights repository](https://github.com/justadudewhohacks/face-api.js/tree/master/weights):
   - `tiny_face_detector_model-weights_manifest.json`
   - `tiny_face_detector_model-shard1`
   - `face_landmark_68_model-weights_manifest.json`
   - `face_landmark_68_model-shard1`
3. Place all 4 downloaded files inside your newly created `public/models` directory.

---

## 💻 Usage

Import the component and render it anywhere in your app. It runs invisibly in the background.

```jsx
import React from 'react';
import { SleepDetector } from 'react-sleep-detector';

function App() {
  return (
    <div>
      <h1>My Learning Dashboard</h1>
      
      {/* Renders invisibly and monitors the user */}
      <SleepDetector 
        isActive={true} 
        modelsUrl="/models" 
      />
      
    </div>
  );
}

export default App;
```

---

## ⚙️ Configuration / Props

You have complete control over how the sleep detector behaves. Here are the props you can pass:

| Prop Name | Type | Default | Description |
|-----------|------|---------|-------------|
| `isActive` | `boolean` | `true` | Turns the webcam and monitoring on or off. |
| `modelsUrl` | `string` | `'/models'` | The path to your public models folder. |
| `sleepThresholdMs` | `number` | `3000` | How long the eyes must be closed (in ms) before the alarm triggers. |
| `earThreshold` | `number` | `0.28` | The Eye Aspect Ratio below which eyes are considered "closed". |
| `alarmTimeoutMs` | `number` | `10000` | How long the alarm sounds before auto-dismissing (in ms). |
| `onSleepDetected` | `function`| `null` | Optional callback triggered exactly when the user falls asleep. |

### Example: Fully Custom UI

If you want to use your own custom popup instead of the default one:

```jsx
<SleepDetector 
  isActive={true}
  modelsUrl="/models"
  customAlarmPopup={({ onDismiss }) => (
    <div style={{ background: 'red', padding: '20px', color: 'white' }}>
      <h2>Hey! Wake up and focus!</h2>
      <button onClick={onDismiss}>I am Awake!</button>
    </div>
  )}
/>
```

---

## 👨‍💻 Credits
Created by **Ashish**.
