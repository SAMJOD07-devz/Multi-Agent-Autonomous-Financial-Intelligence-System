// src/components/common/ColorBends.tsx
import React, { useEffect, useRef } from 'react';

interface ColorBendsProps {
  rotation?: number;
  speed?: number;
  colors?: string[];
  transparent?: boolean;
  autoRotate?: number;
  scale?: number;
  frequency?: number;
  warpStrength?: number;
  mouseInfluence?: number;
  parallax?: number;
  noise?: number;
  iterations?: number;
  intensity?: number;
  bandWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const ColorBends: React.FC<ColorBendsProps> = ({
  rotation = 90,
  speed = 0.2,
  colors = ["#5227FF", "#FF9FFC", "#7cff67"],
  transparent = true,
  scale = 1,
  frequency = 1,
  bandWidth = 6,
  intensity = 1.5,
  className = '',
  style
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resizeCanvas = () => {
      if (!canvas.parentElement) return;
      canvas.width = canvas.parentElement.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement.clientHeight || window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const render = () => {
      time += speed * 0.015;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      if (!transparent) {
        ctx.fillStyle = '#fff0f5';
        ctx.fillRect(0, 0, width, height);
      }

      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(scale, scale);

      // Create flowing color bends using wave curves
      const numBands = bandWidth * 4;
      for (let i = 0; i < numBands; i++) {
        const t = time + i * 0.15 * frequency;
        const colorIndex = i % colors.length;
        const color = colors[colorIndex];

        ctx.beginPath();
        const startX = -width;
        const startY = Math.sin(t * 0.8 + i * 0.3) * 120 + (i - numBands / 2) * 28;
        ctx.moveTo(startX, startY);

        for (let x = -width; x <= width; x += 40) {
          const wave1 = Math.sin(x * 0.003 * frequency + t) * 140 * intensity;
          const wave2 = Math.cos(x * 0.005 - t * 0.7) * 90;
          const y = (i - numBands / 2) * 32 + wave1 + wave2;
          ctx.lineTo(x, y);
        }

        ctx.strokeStyle = color;
        ctx.globalAlpha = (0.22 - (i / numBands) * 0.12) * intensity;
        ctx.lineWidth = 45 + Math.sin(t + i) * 15;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.filter = 'blur(35px)';
        ctx.stroke();
      }

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [rotation, speed, colors, transparent, scale, frequency, bandWidth, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full pointer-events-none ${className}`}
      style={{ opacity: 0.85, ...style }}
    />
  );
};
