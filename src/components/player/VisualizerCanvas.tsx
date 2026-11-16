import React, { useRef, useEffect } from 'react';

export type VisualizerMode = 'BARS' | 'WAVE' | 'RADIAL' | 'PARTICLES';

interface VisualizerCanvasProps {
  isPlaying: boolean;
  getFrequencyData: () => Uint8Array;
  getWaveformData: () => Uint8Array;
  mode?: VisualizerMode;
  accentColor?: string;
  className?: string;
}

export const VisualizerCanvas: React.FC<VisualizerCanvasProps> = ({
  isPlaying,
  getFrequencyData,
  getWaveformData,
  mode = 'BARS',
  accentColor = '#DC2626',
  className = 'w-full h-24',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: { x: number; y: number; size: number; speedX: number; speedY: number; opacity: number }[] = [];
    if (mode === 'PARTICLES') {
      particles = Array.from({ length: 40 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 1.5,
        speedY: (Math.random() - 0.5) * 1.5,
        opacity: Math.random() * 0.7 + 0.3,
      }));
    }

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const freq = getFrequencyData();
      const wave = getWaveformData();

      if (mode === 'BARS') {
        const barCount = 32;
        const barWidth = (width / barCount) * 0.65;
        const gap = (width - barCount * barWidth) / (barCount - 1);

        for (let i = 0; i < barCount; i++) {
          const index = Math.floor((i / barCount) * freq.length);
          const rawVal = isPlaying ? freq[index] || 0 : Math.sin(Date.now() / 400 + i) * 15 + 20;
          const barHeight = Math.max(4, (rawVal / 255) * height * 0.9);
          const x = i * (barWidth + gap);
          const y = height - barHeight;

          // Gradient
          const gradient = ctx.createLinearGradient(0, height, 0, 0);
          gradient.addColorStop(0, `${accentColor}30`);
          gradient.addColorStop(0.5, accentColor);
          gradient.addColorStop(1, '#FCA5A5');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
          ctx.fill();
        }
      } else if (mode === 'WAVE') {
        ctx.lineWidth = 2.5;
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, '#7F1D1D');
        gradient.addColorStop(0.5, '#DC2626');
        gradient.addColorStop(1, '#FCA5A5');
        ctx.strokeStyle = gradient;

        ctx.beginPath();
        const sliceWidth = width / wave.length;
        let x = 0;

        for (let i = 0; i < wave.length; i++) {
          const v = isPlaying ? wave[i] / 128.0 : 1.0 + Math.sin(Date.now() / 300 + i * 0.1) * 0.08;
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
      } else if (mode === 'RADIAL') {
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(centerX, centerY) * 0.55;
        const bars = 48;

        for (let i = 0; i < bars; i++) {
          const rad = (i / bars) * Math.PI * 2;
          const val = isPlaying ? (freq[i % freq.length] / 255) : 0.2 + Math.sin(Date.now() / 500 + i) * 0.1;
          const barLen = val * (radius * 0.85);

          const x1 = centerX + Math.cos(rad) * radius;
          const y1 = centerY + Math.sin(rad) * radius;
          const x2 = centerX + Math.cos(rad) * (radius + barLen);
          const y2 = centerY + Math.sin(rad) * (radius + barLen);

          ctx.strokeStyle = i % 2 === 0 ? accentColor : '#EF4444';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      } else if (mode === 'PARTICLES') {
        const bassLevel = isPlaying ? (freq[2] || 0) / 255 : 0.2;
        particles.forEach((p) => {
          p.x += p.speedX * (1 + bassLevel * 2);
          p.y += p.speedY * (1 + bassLevel * 2);

          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          ctx.fillStyle = accentColor;
          ctx.globalAlpha = p.opacity * (0.4 + bassLevel * 0.6);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (1 + bassLevel), 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1.0;
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isPlaying, mode, accentColor, getFrequencyData, getWaveformData]);

  return (
    <div className={`relative flex items-center justify-center overflow-hidden rounded-xl ${className}`}>
      <canvas
        ref={canvasRef}
        width={360}
        height={100}
        className="w-full h-full object-contain"
      />
    </div>
  );
};
