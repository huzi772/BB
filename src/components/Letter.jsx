import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import config from '../config';
import audioManager from '../audio/audioManager';

export default function Letter({ onClose }) {
  const [isOpen, setIsOpen] = useState(false);
  const flapRef = useRef(null);
  const paperRef = useRef(null);
  const paragraphsRef = useRef([]);

  // Store onClose callback in ref to prevent stale closures
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Ensure music is ALWAYS unducked when component unmounts
  useEffect(() => {
    return () => {
      audioManager.unduck(0.5);
    };
  }, []);

  const handleOpenEnvelope = () => {
    if (isOpen) return;
    setIsOpen(true);

    // Play envelope open SFX
    audioManager.playSound('envelope-open');

    // Duck background music for letter reading
    audioManager.duck(0.1, 0.5);

    const tl = gsap.timeline();

    // 1. Animate flap open
    if (flapRef.current) {
      tl.to(flapRef.current, {
        rotateX: -180,
        duration: 0.6,
        ease: 'power2.inOut',
        transformOrigin: 'top center'
      });
    }

    // 2. Slide letter paper up & expand
    if (paperRef.current) {
      tl.to(
        paperRef.current,
        {
          y: -40,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: 'back.out(1.2)'
        },
        '-=0.2'
      );
    }

    // 3. Stagger paragraph fade-in
    if (paragraphsRef.current.length > 0) {
      tl.to(
        paragraphsRef.current.filter(Boolean),
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.2,
          ease: 'power2.out'
        },
        '-=0.3'
      );
    }
  };

  const handleClose = () => {
    // Unduck music when closing
    audioManager.unduck(0.5);
    if (onCloseRef.current) {
      onCloseRef.current();
    }
  };

  const paragraphs = (config.letterText || '').split('\n\n').filter(Boolean);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justify: 'center',
        width: '100%',
        maxWidth: '650px',
        margin: '0 auto',
        padding: '1rem',
        perspective: '1000px'
      }}
    >
      {!isOpen ? (
        /* CLOSED ENVELOPE */
        <div
          onClick={handleOpenEnvelope}
          style={{
            position: 'relative',
            width: 'min(88vw, 360px)',
            height: '240px',
            backgroundColor: 'var(--wine)',
            borderRadius: '12px',
            border: '2px solid var(--gold)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.7), 0 0 20px rgba(212, 175, 122, 0.3)',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justify: 'center',
            overflow: 'hidden',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}
          className="envelope-hover"
        >
          {/* Flap SVG/CSS */}
          <div
            ref={flapRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '120px',
              backgroundColor: '#430B1A',
              clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
              borderBottom: '1px solid var(--gold)',
              transformStyle: 'preserve-3d',
              zIndex: 3
            }}
          />

          {/* Gold Wax Seal / Icon */}
          <div
            style={{
              position: 'relative',
              zIndex: 4,
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--gold)',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              color: 'var(--wine)',
              fontSize: '1.4rem',
              fontWeight: 'bold',
              marginTop: '20px'
            }}
          >
            ✉
          </div>

          <p
            style={{
              position: 'relative',
              zIndex: 4,
              fontFamily: 'Cormorant Garamond, serif',
              color: 'var(--ivory)',
              fontSize: '1.2rem',
              marginTop: '1rem',
              letterSpacing: '1px',
              textAlign: 'center'
            }}
          >
            Click to Open Letter
          </p>
        </div>
      ) : (
        /* OPENED LETTER PAPER */
        <div
          ref={paperRef}
          style={{
            position: 'relative',
            width: 'min(92vw, 540px)',
            backgroundColor: 'var(--ivory)',
            color: '#1a1625',
            borderRadius: '12px',
            padding: 'clamp(1.5rem, 5vw, 2.5rem)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.8), 0 0 25px rgba(212, 175, 122, 0.4)',
            border: '2px solid var(--gold)',
            opacity: 0,
            transform: 'scale(0.95) translateY(20px)'
          }}
        >
          {/* Letter Header */}
          <div
            style={{
              textAlign: 'center',
              borderBottom: '1px solid rgba(212, 175, 122, 0.5)',
              paddingBottom: '1rem',
              marginBottom: '1.5rem'
            }}
          >
            <h3
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
                color: 'var(--wine)',
                margin: 0,
                fontWeight: 600
              }}
            >
              Dear {config.recipientName},
            </h3>
          </div>

          {/* Letter Content Paragraphs */}
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.05rem, 2.8vw, 1.25rem)', lineHeight: 1.7 }}>
            {paragraphs.map((p, idx) => (
              <p
                key={idx}
                ref={(el) => (paragraphsRef.current[idx] = el)}
                style={{
                  margin: '0 0 1.2rem 0',
                  opacity: 0,
                  transform: 'translateY(12px)',
                  color: '#2a2238'
                }}
              >
                {p}
              </p>
            ))}

            {/* Letter Signoff */}
            <div
              ref={(el) => (paragraphsRef.current[paragraphs.length] = el)}
              style={{
                marginTop: '2rem',
                textAlign: 'right',
                opacity: 0,
                transform: 'translateY(12px)'
              }}
            >
              <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--wine)' }}>
                {config.letterClosing}
              </p>
              <p style={{ margin: '0.4rem 0 0 0', fontWeight: 'bold', color: 'var(--wine)', fontSize: '1.3rem' }}>
                {config.letterSignature}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
