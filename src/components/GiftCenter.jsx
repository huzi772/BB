import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import config from '../config';
import audioManager from '../audio/audioManager';

import MemoryGallery from './MemoryGallery';
import Letter from './Letter';

export default function GiftCenter({ onComplete }) {
  const [activeGiftIndex, setActiveGiftIndex] = useState(null);
  const [modalKey, setModalKey] = useState(0);

  const headingRef = useRef(null);
  const cardsRef = useRef([]);
  const continueBtnRef = useRef(null);

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Initial GSAP reveal on mount
  useEffect(() => {
    const tl = gsap.timeline();

    if (headingRef.current) {
      tl.fromTo(
        headingRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
      );
    }

    if (cardsRef.current.length > 0) {
      tl.fromTo(
        cardsRef.current.filter(Boolean),
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.15, ease: 'back.out(1.2)' },
        '-=0.4'
      );
    }

    if (continueBtnRef.current) {
      tl.fromTo(
        continueBtnRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
        '-=0.2'
      );
    }

    return () => {
      tl.kill();
    };
  }, []);

  // Lock/unlock background body scroll when overlay opens/closes
  useEffect(() => {
    if (activeGiftIndex !== null) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [activeGiftIndex]);

  const handleOpenGift = (index) => {
    audioManager.playSound('gift-open');
    setModalKey((prev) => prev + 1); // Force fresh state reset on reopen
    setActiveGiftIndex(index);
  };

  const handleCloseOverlay = () => {
    audioManager.playSound('transition-whoosh');
    setActiveGiftIndex(null);
  };

  const handleContinue = () => {
    audioManager.playSound('transition-whoosh');
    if (onCompleteRef.current) {
      onCompleteRef.current();
    }
  };

  const giftLabels = config.giftLabels || ["A Little Message", "Memories", "Something From Me"];

  const renderGiftIcon = (index) => {
    const iconStyle = {
      width: '40px',
      height: '40px',
      filter: 'drop-shadow(0 0 6px rgba(212, 175, 122, 0.4))'
    };

    switch (index) {
      case 0:
        return (
          <svg
            style={iconStyle}
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--gold)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        );
      case 1:
        return (
          <svg
            style={iconStyle}
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--gold)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
        );
      case 2:
        return (
          <svg
            style={iconStyle}
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--gold)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="8" width="18" height="13" rx="1" />
            <path d="M12 8v13" />
            <path d="M3 12h18" />
            <path d="M12 8C12 8 8 3.5 5.5 5.5C3.8 7 7 8 12 8Z" />
            <path d="M12 8C12 8 16 3.5 18.5 5.5C20.2 7 17 8 12 8Z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="scene" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'clamp(1rem, 3vw, 2rem)', textAlign: 'center', width: '100%', height: '100%', minHeight: '100dvh', boxSizing: 'border-box' }}>
      {/* Header */}
      <h2
        ref={headingRef}
        className="glow-gold-text"
        style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 'clamp(1.6rem, 4.5vw, 3rem)',
          color: 'var(--gold)',
          marginBottom: 'clamp(0.8rem, 2vh, 1.8rem)',
          letterSpacing: '2px',
          fontWeight: 400,
          opacity: 0
        }}
      >
        {config.giftCenterHeading}
      </h2>

      {/* Gifts Grid */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'clamp(0.5rem, 1.5vh, 1.2rem)',
          justifyContent: 'center',
          alignItems: 'center',
          maxWidth: '900px',
          width: '100%',
          marginBottom: 'clamp(0.8rem, 2vh, 2rem)'
        }}
      >
        {giftLabels.map((label, idx) => (
          <div
            key={idx}
            ref={(el) => (cardsRef.current[idx] = el)}
            onClick={() => handleOpenGift(idx)}
            style={{
              flex: '1 1 clamp(200px, 28vw, 260px)',
              maxWidth: '280px',
              minHeight: 'clamp(65px, 8.5vh, 130px)',
              background: 'var(--bg-secondary)',
              border: '1px solid rgba(212, 175, 122, 0.4)',
              borderRadius: '12px',
              padding: '0.5rem 0.6rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              transition: 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.3s ease, border-color 0.3s ease',
              opacity: 0
            }}
            className="gift-card-hover"
          >
            <div style={{ marginBottom: '0.2rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {renderGiftIcon(idx)}
            </div>
            <h3
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
                color: 'var(--ivory)',
                margin: 0,
                letterSpacing: '1px',
                fontWeight: 500
              }}
            >
              {label}
            </h3>
            <span
              style={{
                fontSize: '0.6rem',
                fontFamily: 'Manrope, sans-serif',
                color: 'var(--gold)',
                marginTop: '0.2rem',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                opacity: 0.8
              }}
            >
              Tap to Open
            </span>
          </div>
        ))}
      </div>

      {/* Main Continue Button */}
      <div ref={continueBtnRef} style={{ opacity: 0 }}>
        <button
          className="btn-gold"
          onClick={handleContinue}
          style={{ padding: '0.8rem 2rem', fontSize: '0.9rem' }}
        >
          {config.continueButton}
        </button>
      </div>

      {/* Fullscreen Modal Overlay for Open Gift */}
      {activeGiftIndex !== null && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100dvh',
            backgroundColor: 'rgba(5, 5, 9, 0.95)',
            backdropFilter: 'blur(10px)',
            zIndex: 9000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'calc(1rem + env(safe-area-inset-top, 0px)) calc(1rem + env(safe-area-inset-right, 0px)) calc(1rem + env(safe-area-inset-bottom, 0px)) calc(1rem + env(safe-area-inset-left, 0px))',
            overflowY: 'auto',
            boxSizing: 'border-box'
          }}
        >
          {/* Back Button Header */}
          <div
            style={{
              position: 'absolute',
              top: 'calc(1rem + env(safe-area-inset-top, 0px))',
              left: 'calc(1rem + env(safe-area-inset-left, 0px))',
              zIndex: 9100
            }}
          >
            <button
              className="btn-gold"
              onClick={handleCloseOverlay}
              style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
            >
              ← Back
            </button>
          </div>

          {/* Modal Content container based on Gift Index - Centered Vertically */}
          <div
            key={modalKey}
            style={{
              width: '100%',
              maxWidth: '800px',
              margin: 'auto 0',
              paddingTop: '2.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {activeGiftIndex === 0 && (
              /* Gift 0: A Little Message */
              <div
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--gold)',
                  borderRadius: '16px',
                  padding: 'clamp(1.5rem, 5vw, 2.5rem)',
                  maxWidth: '520px',
                  width: '100%',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.8), 0 0 20px rgba(212, 175, 122, 0.2)',
                  textAlign: 'center'
                }}
              >
              <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                {renderGiftIcon(0)}
              </div>
                <h3
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
                    color: 'var(--gold)',
                    marginBottom: '1rem'
                  }}
                >
                  {giftLabels[0]}
                </h3>
                <p
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: 'clamp(1.1rem, 3vw, 1.35rem)',
                    color: 'var(--ivory)',
                    lineHeight: 1.6,
                    fontStyle: 'italic'
                  }}
                >
                  "{config.giftMessage}"
                </p>
              </div>
            )}

            {activeGiftIndex === 1 && (
              /* Gift 1: Memories Gallery */
              <MemoryGallery />
            )}

            {activeGiftIndex === 2 && (
              /* Gift 2: Something From Me (Letter) */
              <Letter onClose={handleCloseOverlay} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
