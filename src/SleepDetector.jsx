import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from '@vladmandic/face-api';
import { ShieldAlert } from 'lucide-react';

const SleepDetector = ({
  isActive = true,
  modelsUrl = '/models',
  sleepThresholdMs = 3000,
  earThreshold = 0.28,
  onSleepDetected = null,
  alarmTimeoutMs = 10000,
  customAlarmPopup = null,
  customStyles = {}
}) => {
  const videoRef = useRef(null);
  const [isModelsLoaded, setIsModelsLoaded] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  
  const closedEyesStartTimeRef = useRef(null);
  const isPlayingSirenRef = useRef(false);
  const audioCtxRef = useRef(null);
  const sirenIntervalRef = useRef(null);
  const popupTimeoutRef = useRef(null);

  // Load models on mount
  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(modelsUrl),
          faceapi.nets.faceLandmark68Net.loadFromUri(modelsUrl),
        ]);
        setIsModelsLoaded(true);
      } catch (err) {
        console.error("react-sleep-detector: Failed to load face-api models. Ensure modelsUrl is correct.", err);
      }
    };
    loadModels();
  }, [modelsUrl]);

  // Manage camera
  useEffect(() => {
    let stream = null;

    const startCamera = async () => {
      if (!isModelsLoaded || !isActive) return;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraActive(true);
        }
      } catch (err) {
        console.error("react-sleep-detector: Camera error:", err);
      }
    };

    const stopCamera = () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
      setIsCameraActive(false);
      stopSiren();
      setShowPopup(false);
      if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current);
    };

    if (isActive && isModelsLoaded) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isActive, isModelsLoaded]);

  // AudioContext Siren
  const playSiren = () => {
    if (isPlayingSirenRef.current) return;
    isPlayingSirenRef.current = true;
    
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    let high = true;
    sirenIntervalRef.current = setInterval(() => {
      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();
      osc.type = 'square';
      osc.frequency.value = high ? 800 : 400;
      high = !high;
      
      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);
      
      gain.gain.setValueAtTime(0.5, audioCtxRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtxRef.current.currentTime + 0.4);
      
      osc.start(audioCtxRef.current.currentTime);
      osc.stop(audioCtxRef.current.currentTime + 0.4);
    }, 400);
  };

  const stopSiren = () => {
    isPlayingSirenRef.current = false;
    if (sirenIntervalRef.current) {
      clearInterval(sirenIntervalRef.current);
    }
  };

  const getEuclideanDistance = (p1, p2) => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  };

  const calculateEAR = (eye) => {
    const p1_p5 = getEuclideanDistance(eye[1], eye[5]);
    const p2_p4 = getEuclideanDistance(eye[2], eye[4]);
    const p0_p3 = getEuclideanDistance(eye[0], eye[3]);
    return (p1_p5 + p2_p4) / (2.0 * p0_p3);
  };

  const handleVideoPlay = () => {
    const loop = setInterval(async () => {
      if (!videoRef.current || !isCameraActive || !isActive) {
        clearInterval(loop);
        return;
      }

      if (showPopup) return; // Don't process while popup is showing

      const detection = await faceapi.detectSingleFace(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions()
      ).withFaceLandmarks();

      if (detection) {
        const landmarks = detection.landmarks;
        const leftEye = landmarks.getLeftEye();
        const rightEye = landmarks.getRightEye();

        const leftEAR = calculateEAR(leftEye);
        const rightEAR = calculateEAR(rightEye);
        const avgEAR = (leftEAR + rightEAR) / 2;

        if (avgEAR < earThreshold) {
          // Eyes are closed
          if (!closedEyesStartTimeRef.current) {
            closedEyesStartTimeRef.current = Date.now();
          } else {
            const closedDuration = Date.now() - closedEyesStartTimeRef.current;
            if (closedDuration >= sleepThresholdMs) {
              triggerWakeUp();
            }
          }
        } else {
          // Eyes are open
          closedEyesStartTimeRef.current = null;
        }
      }
    }, 200);
  };

  const triggerWakeUp = () => {
    setShowPopup(true);
    playSiren();
    closedEyesStartTimeRef.current = null; // reset

    if (onSleepDetected) {
      onSleepDetected();
    }

    if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current);
    popupTimeoutRef.current = setTimeout(() => {
      setShowPopup(false);
      stopSiren();
    }, alarmTimeoutMs);
  };

  const handleDismissAlarm = () => {
    setShowPopup(false);
    stopSiren();
    if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current);
  };

  if (!isActive) return null;

  return (
    <>
      <video 
        ref={videoRef}
        onPlay={handleVideoPlay}
        autoPlay
        muted
        playsInline
        style={{ display: 'none' }}
      />
      
      {showPopup && (
        customAlarmPopup ? (
          // Render custom popup if provided, passing dismiss handler
          customAlarmPopup({ onDismiss: handleDismissAlarm })
        ) : (
          // Default popup
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            ...customStyles.overlay
          }}>
            <div style={{
              background: '#18181b', // dark surface
              border: '2px solid #ef4444', // danger red
              padding: '2rem 1.5rem',
              borderRadius: '20px',
              textAlign: 'center',
              maxWidth: '90%',
              width: '320px',
              boxShadow: '0 0 40px rgba(239, 68, 68, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '15px',
              ...customStyles.popup
            }}>
              <ShieldAlert size={48} color="#ef4444" />
              <h1 style={{ color: '#ef4444', fontSize: '1.5rem', margin: 0, ...customStyles.title }}>WAKE UP!</h1>
              <p style={{ color: '#fff', fontSize: '1rem', lineHeight: 1.4, ...customStyles.message }}>
                You seem tired. Take a 15-minute nap, sleep well, and study fresh later!
              </p>
              <button 
                onClick={handleDismissAlarm}
                style={{
                  marginTop: '15px',
                  padding: '12px 24px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  width: '100%',
                  ...customStyles.button
                }}
              >
                Stop Alarm
              </button>
            </div>
          </div>
        )
      )}
    </>
  );
};

export default SleepDetector;
