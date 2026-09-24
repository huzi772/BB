import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import config from '../config';
import audioManager from '../audio/audioManager';

export default function CandleInteraction({ visible = false, onBlow, onComplete }) {
  const [isBlowing, setIsBlowing] = useState(false);
  const containerRef = useRef(null);
  const wishTextRef = useRef(null);
  const blowBtnRef = useRef(null);

  useEffect(() => {
    if (!visible || !containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        wishTextRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out' }
      );

      gsap.fromTo(
        blowBtnRef.current,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 1, delay: 0.8, ease: 'back.out(1.5)' }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [visible]);

  const handleBlowClick = () => {
    if (isBlowing) return;
    setIsBlowing(true);

    audioManager.playSound('candle-blow');

    // Notify 3D CakeScene to start flame wavering and extinguishing
    if (onBlow) {
      onBlow();
    }

    // Duck background audio to near-silence
    audioManager.duck(0.05, 0.5);

    // Fade out wish text and button
    gsap.to([wishTextRef.current, blowBtnRef.current], {
      opacity: 0,
      y: -15,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.in'
    });

    // Play extinguish SFX shortly after blow starts
    setTimeout(() => {
      audioManager.playSound('candle-extinguish');
    }, 800);

    // Transition to next scene after extinguishment and pause
    setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, 2500);
  };

  if (!visible) return null;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 'clamp(32px, 8vh, 80px)'
      }}
    >
      <div
        ref={wishTextRef}
        className="gold-glow"
        style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontStyle: 'italic',
          fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
          color: 'var(--ivory)',
          marginBottom: 'var(--space-4)',
          textShadow: '0 2px 12px rgba(0,0,0,0.8)',
          pointerEvents: 'none'
        }}
      >
        {config.wishText}
      </div>

      <button
        ref={blowBtnRef}
        className="btn-gold glow-pulse"
        onClick={handleBlowClick}
        disabled={isBlowing}
        style={{
          pointerEvents: 'auto',
          cursor: isBlowing ? 'default' : 'pointer'
        }}
      >
        {config.blowButton}
      </button>
    </div>
  );
}
