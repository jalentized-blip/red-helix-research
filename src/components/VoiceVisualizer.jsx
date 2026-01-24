import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function VoiceVisualizer({ isActive, audioRef }) {
  const canvasRef = useRef(null);
  const analyzerRef = useRef(null);
  const animationIdRef = useRef(null);
  const audioContextRef = useRef(null);
  const [audioInitialized, setAudioInitialized] = useState(false);

  useEffect(() => {
    if (!isActive || !audioRef?.current) {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Initialize audio context and analyzer
    if (!audioContextRef.current) {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = audioContext;

        const analyzer = audioContext.createAnalyser();
        analyzer.fftSize = 256;
        const source = audioContext.createMediaElementAudioSource(audioRef.current);
        source.connect(analyzer);
        analyzer.connect(audioContext.destination);

        analyzerRef.current = analyzer;
        setAudioInitialized(true);
      } catch (err) {
        console.error('Error initializing audio context:', err);
      }
    }

    const analyzer = analyzerRef.current;
    if (!analyzer) return;

    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      analyzer.getByteFrequencyData(dataArray);

      // Clear canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, width, height);

      // Draw waveform
      const sliceWidth = width / bufferLength;
      let x = 0;

      ctx.strokeStyle = 'rgba(217, 119, 6, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Draw frequency bars
      ctx.fillStyle = 'rgba(217, 119, 6, 0.6)';
      const barWidth = (width / bufferLength) * 2.5;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height;

        ctx.fillRect(
          i * barWidth,
          height - barHeight,
          barWidth - 1,
          barHeight
        );
      }

      animationIdRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [isActive, audioRef]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0.95 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        className="absolute inset-0 w-full h-full"
      />
    </motion.div>
  );
}