import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import config from '../config';
import audioManager from '../audio/audioManager';
import Fireworks from '../effects/fireworks';

export default function FinalScene({ goTo }) {
  const [showFireworks, setShowFireworks] = useState(false);
  const [showWatchAgain, setShowWatchAgain] = useState(false);

  const introRef = useRef(null);
  const finalMsgRef = useRef(null);
  const celebrationRef = useRef(null);
  const watchAgainRef = useRef(null);
  const timelineRef = useRef(null);

  const goToRef = useRef(goTo);
  useEffect(() => {
    goToRef.current = goTo;
  }, [goTo]);

  useEffect(() => {
    // Start fireworks SFX when fireworks visual activates
    const tl = gsap.timeline();
    timelineRef.current = tl;

    // Step a & b: Intro line fades in, holds ~2s, fades out
    if (introRef.current) {
      tl.to(introRef.current, {
        opacity: 1,
        duration: 1.2,
        ease: 'power2.out'
      })
      .to(introRef.current, {
        opacity: 1,
        duration: 2.0
      })
      .to(introRef.current, {
        opacity: 0,
        duration: 1.0,
        ease: 'power2.in'
      });
    }

    // Step c: Final message fades in, holds ~2.5s, fades out
    if (finalMsgRef.current) {
      tl.to(finalMsgRef.current, {
        opacity: 1,
        duration: 1.2,
        ease: 'power2.out'
      })
      .to(finalMsgRef.current, {
        opacity: 1,
        duration: 2.5
      })
      .to(finalMsgRef.current, {
        opacity: 0,
        duration: 1.0,
        ease: 'power2.in'
      });
    }

    // Step d: Fireworks start + celebration text appears
    tl.call(() => {
      setShowFireworks(true);
      audioManager.playSound('fireworks');
    });

    if (celebrationRef.current) {
      tl.to(celebrationRef.current, {
        opacity: 1,
        scale: 1,
        duration: 1.5,
        ease: 'power2.out'
      });
    }

    // Hold celebration for ~6s
    tl.to({}, { duration: 6 });

    // Step e: Fade music out and fade celebration text out slowly
    tl.call(() => {
      audioManager.fadeOut(2.5);
    });

    if (celebrationRef.current) {
      tl.to(celebrationRef.current, {
        opacity: 0.15,
        duration: 2.5,
        ease: 'power2.inOut'
      });
    }

    // Step f: Show "Watch Again" button
    tl.call(() => {
      setShowWatchAgain(true);
    });

    if (watchAgainRef.current) {
      tl.to(watchAgainRef.current, {
        opacity: 1,
        y: 0,
        duration: 1.0,
        ease: 'power2.out'
      });
    }

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, []);

  const handleWatchAgain = () => {
    audioManager.playSound('transition-whoosh');
    if (goToRef.current) {
      goToRef.current('entry');
    } else {
      window.location.reload();
    }
  };

  return (
    <div
      className="scene"
      style={{
        backgroundColor: '#030306',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justify: 'center',
        textAlign: 'center',
        padding: '2rem'
      }}
    >
      {/* Reusable Canvas Fireworks Overlay */}
      <Fireworks active={showFireworks} intensity={1.5} />

      {/* Intro Line */}
      <div
        ref={introRef}
        style={{
          position: 'absolute',
          opacity: 0,
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 'clamp(1.8rem, 4vw, 3rem)',
          color: 'var(--gold)',
          fontStyle: 'italic',
          letterSpacing: '2px',
          zIndex: 10
        }}
      >
        {config.finalIntroLine}
      </div>

      {/* Final Message */}
      <div
        ref={finalMsgRef}
        style={{
          position: 'absolute',
          opacity: 0,
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          color: 'var(--ivory)',
          lineHeight: 1.3,
          letterSpacing: '1px',
          maxWidth: '700px',
          padding: '0 1rem',
          zIndex: 10
        }}
      >
        "{config.finalMessage}"
      </div>

      {/* Celebratory Banner (Happy Birthday + Heart + Name + Date) */}
      <div
        ref={celebrationRef}
        style={{
          position: 'absolute',
          opacity: 0,
          transform: 'scale(0.95)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justify: 'center',
          gap: '1rem',
          zIndex: 10,
          padding: '0 1rem'
        }}
      >
        <h1
          className="glow-gold-text"
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(2.5rem, 7vw, 5rem)',
            color: 'var(--ivory)',
            letterSpacing: '4px',
            margin: 0,
            fontWeight: 700
          }}
        >
          HAPPY BIRTHDAY
        </h1>

        <div style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'var(--wine)', textShadow: '0 0 15px var(--wine)' }}>
          ❤
        </div>

        <h2
          className="glow-gold-text"
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(2rem, 6vw, 4rem)',
            color: 'var(--gold)',
            letterSpacing: '2px',
            margin: 0,
            fontWeight: 400
          }}
        >
          {config.recipientName}
        </h2>

        <p
          style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
            color: 'var(--ivory)',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            opacity: 0.85,
            marginTop: '0.5rem'
          }}
        >
          {config.birthdayDate}
        </p>
      </div>

      {/* Watch Again Button */}
      {showWatchAgain && (
        <div
          ref={watchAgainRef}
          style={{
            position: 'absolute',
            bottom: '3rem',
            opacity: 0,
            transform: 'translateY(15px)',
            zIndex: 20
          }}
        >
          <button
            className="btn-gold"
            onClick={handleWatchAgain}
            style={{
              padding: '0.75rem 1.8rem',
              fontSize: '0.85rem',
              letterSpacing: '2px',
              backgroundColor: 'rgba(5, 5, 9, 0.6)',
              backdropFilter: 'blur(4px)'
            }}
          >
            Watch Again ↻
          </button>
        </div>
      )}
    </div>
  );
}
