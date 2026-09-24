import React, { useRef, useEffect } from 'react';

export default function Fireworks({ active = true, intensity = 1.0 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let width = 0;
    let height = 0;

    const isMobile = window.innerWidth < 600;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const rockets = [];
    const particles = [];
    const confetti = [];

    const colors = ['#D4AF7A', '#F5EBDD', '#8C64DC', '#5C0F24', '#E2A9B8', '#FFD700'];

    // Spawn rockets
    let lastRocketTime = 0;
    const rocketInterval = isMobile ? 800 : 450;

    // Confetti initialization
    const confettiCount = isMobile ? 30 : 60;
    for (let i = 0; i < confettiCount; i++) {
      confetti.push({
        x: Math.random() * width,
        y: Math.random() * height - height,
        size: Math.random() * 6 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 1.5,
        vy: Math.random() * 2 + 1,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.1
      });
    }

    function createBurst(x, y) {
      const particleCount = isMobile ? 35 : 75;
      const baseColor = colors[Math.floor(Math.random() * colors.length)];

      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * (isMobile ? 5 : 8) + 1.5;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          decay: Math.random() * 0.015 + 0.01,
          gravity: 0.08,
          color: baseColor,
          size: Math.random() * 2.5 + 1.5
        });
      }
    }

    function loop(timestamp) {
      animId = requestAnimationFrame(loop);

      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = 'lighter';

      // Launch rockets
      if (timestamp - lastRocketTime > rocketInterval / intensity) {
        lastRocketTime = timestamp;
        if (rockets.length < (isMobile ? 3 : 6)) {
          const targetX = Math.random() * (width * 0.8) + width * 0.1;
          const targetY = Math.random() * (height * 0.4) + height * 0.1;
          rockets.push({
            x: targetX + (Math.random() - 0.5) * 100,
            y: height,
            targetY,
            vx: (Math.random() - 0.5) * 2,
            vy: -(Math.random() * 4 + 10),
            color: colors[Math.floor(Math.random() * colors.length)]
          });
        }
      }

      // Update & render rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.x += r.vx;
        r.y += r.vy;

        ctx.beginPath();
        ctx.arc(r.x, r.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = r.color;
        ctx.fill();

        if (r.y <= r.targetY || r.vy >= 0) {
          createBurst(r.x, r.y);
          rockets.splice(i, 1);
        }
      }

      // Update & render burst particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.restore();
      }

      // Update & render confetti
      ctx.globalCompositeOperation = 'source-over';
      for (let i = 0; i < confetti.length; i++) {
        const c = confetti[i];
        c.x += c.vx;
        c.y += c.vy;
        c.rotation += c.vRot;

        if (c.y > height) {
          c.y = -20;
          c.x = Math.random() * width;
        }

        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rotation);
        ctx.fillStyle = c.color;
        ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size * 0.6);
        ctx.restore();
      }
    }

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [active, intensity]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1
      }}
    />
  );
}
