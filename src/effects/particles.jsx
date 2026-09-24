import React, { useEffect, useRef } from 'react';

export default function ParticleField({
  count = 60,
  color = '#D4AF7A',
  speed = 0.5,
  size = 2,
  style = {},
  className = ''
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId;
    let width = 0;
    let height = 0;
    let particles = [];

    const isMobile = window.innerWidth < 600;
    const effectiveCount = Math.floor(isMobile ? count * 0.4 : count);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const parent = canvas.parentElement;
      width = parent ? parent.clientWidth : window.innerWidth;
      height = parent ? parent.clientHeight : window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
    };

    const createParticles = () => {
      particles = [];
      for (let i = 0; i < effectiveCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: (Math.random() * 0.8 + 0.4) * size,
          alpha: Math.random() * 0.6 + 0.2,
          speedY: -(Math.random() * 0.4 + 0.1) * speed,
          speedX: (Math.random() - 0.5) * 0.2 * speed,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: 0.02 + Math.random() * 0.02
        });
      }
    };

    resize();
    createParticles();

    const handleResize = () => {
      resize();
      createParticles();
    };

    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.y += p.speedY;
        p.x += p.speedX;
        p.pulse += p.pulseSpeed;

        if (p.y < -10) p.y = height + 10;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const currentAlpha = Math.max(0, p.alpha + Math.sin(p.pulse) * 0.2);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = currentAlpha;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      animFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
      }
    };
  }, [count, color, speed, size]);

  return (
    <canvas
      ref={canvasRef}
      className={`particle-field ${className}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        ...style
      }}
    />
  );
}
