import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import config from '../config';
import audioManager from '../audio/audioManager';
import Fireworks from '../effects/fireworks';

export default function BirthdayReveal({ onComplete }) {
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const nameRef = useRef(null);
  const dateRef = useRef(null);
  const buttonRef = useRef(null);

  const [showFireworks, setShowFireworks] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // a) ~1s darkness hold
      tl.to({}, { duration: 0.8 });

      // Trigger birthday-reveal sound and fireworks burst
      tl.add(() => {
        audioManager.playSound('birthday-reveal');
        setShowFireworks(true);
        audioManager.unduck(1.0, 1.2);
        audioManager.playSound('fireworks');
      });

      // b) config.birthdayTitle fades in with letter-spacing expansion
      tl.fromTo(
        titleRef.current,
        { opacity: 0, y: 30, letterSpacing: '2px' },
        {
          opacity: 1,
          y: 0,
          letterSpacing: '8px',
          duration: 1.4,
          ease: 'power3.out'
        }
      );

      // c) config.recipientName appears glowing gold with soft reveal
      tl.fromTo(
        nameRef.current,
        { opacity: 0, scale: 0.85, filter: 'blur(12px)' },
        {
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          duration: 1.6,
          ease: 'power2.out'
        },
        '-=0.6'
      );

      // d) config.birthdayDate appears below
      tl.fromTo(
        dateRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 1.0,
          ease: 'power2.out'
        },
        '-=0.8'
      );

      // e) ~5s after date appears, config.continueButton fades in
      tl.to({}, { duration: 4.5 });
      tl.add(() => {
        setShowButton(true);
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (showButton && buttonRef.current) {
      gsap.fromTo(
        buttonRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1.0, ease: 'power2.out' }
      );
    }
  }, [showButton]);

  const handleContinue = () => {
    audioManager.playSound('transition-whoosh');
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div
      ref={containerRef}
      className="scene"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '0 var(--space-4)',
        position: 'relative'
      }}
    >
      {/* 2D Fireworks & Confetti Canvas in background */}
      <Fireworks active={showFireworks} intensity={1.2} />

      {/* Foreground Content */}
      <div style={{ zIndex: 10, maxWidth: '90vw' }}>
        <h2
          ref={titleRef}
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(1.8rem, 5vw, 3.8rem)',
            fontWeight: 600,
            color: 'var(--ivory)',
            textTransform: 'uppercase',
            marginBottom: 'var(--space-3)',
            textShadow: '0 4px 20px rgba(0,0,0,0.9), 0 0 15px rgba(212,175,122,0.4)',
            wordBreak: 'break-word'
          }}
        >
          {config.birthdayTitle}
        </h2>

        <h1
          ref={nameRef}
          className="gold-glow"
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(2.8rem, 9vw, 6.5rem)',
            fontWeight: 700,
            color: 'var(--gold)',
            lineHeight: 1.1,
            marginBottom: 'var(--space-4)',
            textShadow: '0 4px 30px rgba(0,0,0,0.9), 0 0 25px rgba(212,175,122,0.6)',
            wordBreak: 'break-word'
          }}
        >
          {config.recipientName}
        </h1>

        <div
          ref={dateRef}
          style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: 'clamp(0.9rem, 2.5vw, 1.3rem)',
            letterSpacing: '4px',
            color: 'var(--ivory)',
            opacity: 0.9,
            marginBottom: 'var(--space-8)',
            textShadow: '0 2px 10px rgba(0,0,0,0.8)'
          }}
        >
          {config.birthdayDate}
        </div>

        {showButton && (
          <button
            ref={buttonRef}
            className="btn-gold glow-pulse"
            onClick={handleContinue}
            style={{
              cursor: 'pointer',
              marginTop: 'var(--space-2)'
            }}
          >
            {config.continueButton}
          </button>
        )}
      </div>
    </div>
  );
}
