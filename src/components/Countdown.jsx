import React, { useRef, useLayoutEffect, useState } from 'react';
import gsap from 'gsap';
import audioManager from '../audio/audioManager';

export default function Countdown({ onComplete }) {
  const containerRef = useRef(null);
  const numberRef = useRef(null);
  const ringRef = useRef(null);
  const flashRef = useRef(null);
  const [currentNum, setCurrentNum] = useState(3);

  useLayoutEffect(() => {
    let isCompleted = false;

    const ctx = gsap.context(() => {
      const masterTl = gsap.timeline();

      [3, 2, 1].forEach((num) => {
        const numStepTl = gsap.timeline();

        numStepTl
          .call(() => {
            setCurrentNum(num);
            audioManager.play('countdown-hit');
          })

          // 0.35s Animate In
          .fromTo(
            numberRef.current,
            { opacity: 0, scale: 1.5, filter: 'blur(8px)' },
            { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.35, ease: 'power3.out' },
            0
          )
          .fromTo(
            ringRef.current,
            { opacity: 0, scale: 0.5 },
            { opacity: 0.8, scale: 1.8, duration: 0.35, ease: 'power2.out' },
            0
          )

          // 0.40s Hold
          .to(ringRef.current, { opacity: 0, scale: 2.2, duration: 0.4, ease: 'power1.out' }, 0.35)

          // 0.25s Animate Out
          .to(
            numberRef.current,
            { opacity: 0, scale: 0.7, filter: 'blur(6px)', duration: 0.25, ease: 'power2.in' },
            0.75
          );

        masterTl.add(numStepTl);
      });

      // Gold flash and completion trigger
      masterTl
        .call(() => {
          audioManager.play('transition-whoosh');
        })
        .to(flashRef.current, { opacity: 0.8, duration: 0.15, ease: 'power2.in' })
        .to(flashRef.current, {
          opacity: 0,
          duration: 0.15,
          ease: 'power2.out',
          onComplete: () => {
            if (!isCompleted && onComplete) {
              isCompleted = true;
              onComplete();
            }
          }
        });
    }, containerRef);

    return () => {
      isCompleted = true;
      ctx.revert();
    };
  }, []);

  return (
    <div ref={containerRef} className="scene">
      {/* Background Flash Overlay */}
      <div
        ref={flashRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'var(--gold)',
          opacity: 0,
          pointerEvents: 'none',
          zIndex: 3
        }}
      />

      {/* Radial Pulse Ring */}
      <div
        ref={ringRef}
        style={{
          position: 'absolute',
          width: '250px',
          height: '250px',
          borderRadius: '50%',
          border: '2px solid var(--gold)',
          boxShadow: '0 0 30px var(--gold)',
          opacity: 0,
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      {/* Numerals */}
      <div
        ref={numberRef}
        className="glow-gold-text"
        style={{
          position: 'relative',
          zIndex: 2,
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(7rem, 20vw, 14rem)',
          fontWeight: 700,
          color: 'var(--ivory)',
          lineHeight: 1,
          userSelect: 'none'
        }}
      >
        {currentNum}
      </div>
    </div>
  );
}
