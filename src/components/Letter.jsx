import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import config from '../config';
import audioManager from '../audio/audioManager';
import ParticleField from '../effects/particles';

export default function Letter({ onClose }) {
  const [isOpen, setIsOpen] = useState(false);
  const introRef = useRef(null);
  const envelopeCardRef = useRef(null);
  const floatAnimRef = useRef(null);
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

  // Closed envelope intro & floating animation
  useEffect(() => {
    if (isOpen) return;

    const ctx = gsap.context(() => {
      const introTl = gsap.timeline();

      if (introRef.current) {
        introTl.fromTo(
          introRef.current,
          { opacity: 0, y: -15 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
        );
      }

      if (envelopeCardRef.current) {
        introTl.fromTo(
          envelopeCardRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
          '-=0.4'
        );

        // Gentle floating/breathing loop after initial reveal
        floatAnimRef.current = gsap.to(envelopeCardRef.current, {
          y: -8,
          duration: 2.6,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut'
        });
      }
    });

    return () => {
      ctx.revert();
    };
  }, [isOpen]);

  // Opened paper entrance animation
  useEffect(() => {
    if (!isOpen) return;

    const ctx = gsap.context(() => {
      if (paperRef.current) {
        gsap.fromTo(
          paperRef.current,
          { opacity: 0, y: 25, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.2)' }
        );
      }

      const validParagraphs = paragraphsRef.current.filter(Boolean);
      if (validParagraphs.length > 0) {
        gsap.fromTo(
          validParagraphs,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.15, delay: 0.2, ease: 'power2.out' }
        );
      }
    });

    return () => {
      ctx.revert();
    };
  }, [isOpen]);

  const handleOpenEnvelope = () => {
    if (isOpen) return;

    if (floatAnimRef.current) {
      floatAnimRef.current.kill();
    }

    setIsOpen(true);
    audioManager.playSound('envelope-open');
    audioManager.duck(0.1, 0.5);
  };

  const handleClose = () => {
    audioManager.unduck(0.5);
    if (onCloseRef.current) {
      onCloseRef.current();
    }
  };

  const paragraphs = (config.letterText || '').split('\n\n').filter(Boolean);
  const recipientInitial = config.recipientName ? config.recipientName.trim()[0].toUpperCase() : 'S';

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
        perspective: '1000px',
        position: 'relative'
      }}
    >
      {!isOpen ? (
        /* CLOSED ENVELOPE SCREEN */
        <div
          style={{
            position: 'relative',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justify: 'center',
            minHeight: '380px',
            padding: '1rem 0'
          }}
        >
          {/* Subtle gold particle field ambiance */}
          <ParticleField count={25} color="var(--gold)" speed={0.35} size={2} />

          {/* Intro Heading */}
          <h3
            ref={introRef}
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontStyle: 'italic',
              fontSize: 'clamp(1.5rem, 4.5vw, 2.2rem)',
              color: 'var(--gold)',
              marginBottom: '1.8rem',
              textAlign: 'center',
              opacity: 0,
              zIndex: 2,
              fontWeight: 400,
              letterSpacing: '1px'
            }}
          >
            {config.letterIntro || "A little something for you..."}
          </h3>

          {/* Envelope Card */}
          <div
            ref={envelopeCardRef}
            onClick={handleOpenEnvelope}
            style={{
              position: 'relative',
              width: 'min(88vw, 380px)',
              height: '230px',
              backgroundColor: 'var(--wine)',
              borderRadius: '14px',
              border: '2px solid var(--gold)',
              boxShadow: '0 16px 36px rgba(0,0,0,0.8), 0 0 25px rgba(212, 175, 122, 0.35)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justify: 'center',
              overflow: 'hidden',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              zIndex: 2,
              opacity: 0
            }}
            className="envelope-hover"
          >
            {/* Flap SVG/CSS */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '95px',
                backgroundColor: '#430B1A',
                clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                borderBottom: '1px solid var(--gold)',
                zIndex: 3
              }}
            />

            {/* Premium Gold Wax Seal positioned at flap tip */}
            <div
              style={{
                position: 'absolute',
                top: '67px',
                zIndex: 4,
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: 'radial-gradient(circle at 40% 40%, #EADBCE 0%, #D4AF7A 45%, #9A7338 95%)',
                border: '2px solid #7D5C23',
                boxShadow: '0 6px 16px rgba(0,0,0,0.65), inset 0 1px 2px rgba(255,255,255,0.2), inset 0 -2px 4px rgba(0,0,0,0.25), 0 0 16px rgba(212, 175, 122, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                color: '#3B0A17',
                fontSize: '1.45rem',
                fontFamily: 'Cormorant Garamond, serif',
                fontWeight: '700',
                userSelect: 'none'
              }}
            >
              <span
                style={{
                  textShadow: '0 1px 1px rgba(255,255,255,0.4), 0 -1px 1px rgba(0,0,0,0.5)',
                  transform: 'translateY(-1px)'
                }}
              >
                {recipientInitial}
              </span>
            </div>

            {/* Pulsing prompt text positioned in lower envelope body */}
            <p
              className="glow-text-pulse"
              style={{
                position: 'absolute',
                bottom: '24px',
                zIndex: 4,
                fontFamily: 'Cormorant Garamond, serif',
                color: 'var(--ivory)',
                fontSize: '1.25rem',
                letterSpacing: '1.5px',
                textAlign: 'center',
                margin: 0
              }}
            >
              Click to Open Letter
            </p>
          </div>
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
            zIndex: 2
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
                textAlign: 'right'
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
