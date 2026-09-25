import React, { useState, useRef } from 'react';
import config from '../config';

export default function MemoryGallery() {
  const memories = config.memories || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [failedImages, setFailedImages] = useState({});

  const touchStartXRef = useRef(null);
  const touchEndXRef = useRef(null);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % memories.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + memories.length) % memories.length);
  };

  const handleImageError = (index) => {
    setFailedImages((prev) => ({ ...prev, [index]: true }));
  };

  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches ? e.touches[0].clientX : e.clientX;
    touchEndXRef.current = touchStartXRef.current;
  };

  const handleTouchMove = (e) => {
    touchEndXRef.current = e.touches ? e.touches[0].clientX : e.clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null || touchEndXRef.current === null) return;
    const diff = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 40;

    if (diff > minSwipeDistance) {
      handleNext();
    } else if (diff < -minSwipeDistance) {
      handlePrev();
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  if (memories.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--ivory)', padding: '2rem' }}>
        No memories found.
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxWidth: '700px',
        margin: '0 auto',
        padding: '1rem',
        userSelect: 'none'
      }}
    >
      <h3
        style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
          color: 'var(--gold)',
          marginBottom: '1.5rem',
          textAlign: 'center',
          letterSpacing: '2px',
          fontWeight: 400
        }}
      >
        Memories
      </h3>

      {/* Gallery Cards Container */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseMove={handleTouchMove}
        onMouseUp={handleTouchEnd}
        style={{
          position: 'relative',
          width: '100%',
          height: 'min(50vh, 380px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          perspective: '1000px',
          cursor: 'grab',
          touchAction: 'pan-y'
        }}
      >
        {memories.map((item, idx) => {
          // Calculate offset relative to currentIndex
          let offset = idx - currentIndex;
          if (offset < -1) offset += memories.length;
          if (offset > 1) offset -= memories.length;

          const isActive = idx === currentIndex;
          const isLeft = offset === -1 || (offset === memories.length - 1 && memories.length > 2);
          const isRight = offset === 1 || (offset === -(memories.length - 1) && memories.length > 2);

          let transform = 'translate3d(0, 0, -200px) scale(0.7)';
          let opacity = 0;
          let zIndex = 1;

          if (isActive) {
            transform = 'translate3d(0, 0, 0) scale(1) rotate(0deg)';
            opacity = 1;
            zIndex = 10;
          } else if (isLeft) {
            transform = 'translate3d(-45%, 0, -100px) scale(0.82) rotate(-5deg)';
            opacity = 0.65;
            zIndex = 5;
          } else if (isRight) {
            transform = 'translate3d(45%, 0, -100px) scale(0.82) rotate(5deg)';
            opacity = 0.65;
            zIndex = 5;
          }

          return (
            <div
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              style={{
                position: 'absolute',
                width: 'min(82vw, 320px)',
                height: 'min(45vh, 340px)',
                borderRadius: '16px',
                background: 'var(--bg-secondary)',
                border: '1px solid rgba(212, 175, 122, 0.4)',
                boxShadow: isActive
                  ? '0 12px 30px rgba(0,0,0,0.7), 0 0 20px rgba(212, 175, 122, 0.25)'
                  : '0 6px 16px rgba(0,0,0,0.5)',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
                transform,
                opacity,
                zIndex,
                pointerEvents: opacity > 0 ? 'auto' : 'none'
              }}
            >
              {/* Image Frame */}
              <div
                style={{
                  width: '100%',
                  height: '75%',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  background: '#0a0812',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(212, 175, 122, 0.2)'
                }}
              >
                {failedImages[idx] ? (
                  <div
                    style={{
                      padding: '1rem',
                      textAlign: 'center',
                      color: 'var(--gold)',
                      fontFamily: 'Cormorant Garamond, serif',
                      fontStyle: 'italic',
                      fontSize: '1.1rem'
                    }}
                  >
                    ✦ {item.caption || `Memory #${idx + 1}`} ✦
                  </div>
                ) : (
                  <img
                    src={item.src}
                    alt={item.caption || `Memory ${idx + 1}`}
                    loading="lazy"
                    onError={() => handleImageError(idx)}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: item.objectPosition || 'center top',
                      display: 'block'
                    }}
                  />
                )}
              </div>

              {/* Caption */}
              <div
                style={{
                  height: '25%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '6px 8px 0 8px',
                  textAlign: 'center'
                }}
              >
                <p
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: 'clamp(0.95rem, 2.5vw, 1.15rem)',
                    color: 'var(--ivory)',
                    fontStyle: 'italic',
                    lineHeight: 1.3,
                    margin: 0
                  }}
                >
                  {item.caption}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          marginTop: '1.5rem',
          zIndex: 20
        }}
      >
        <button
          className="btn-gold"
          onClick={handlePrev}
          aria-label="Previous Memory"
          style={{
            padding: '0.4rem 0.9rem',
            fontSize: '1rem',
            borderRadius: '50%',
            minWidth: '44px',
            minHeight: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ‹
        </button>

        {/* Indicators */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {memories.map((_, idx) => (
            <div
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              style={{
                width: idx === currentIndex ? '20px' : '8px',
                height: '8px',
                borderRadius: '4px',
                backgroundColor: idx === currentIndex ? 'var(--gold)' : 'rgba(212, 175, 122, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>

        <button
          className="btn-gold"
          onClick={handleNext}
          aria-label="Next Memory"
          style={{
            padding: '0.4rem 0.9rem',
            fontSize: '1rem',
            borderRadius: '50%',
            minWidth: '44px',
            minHeight: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ›
        </button>
      </div>
    </div>
  );
}
