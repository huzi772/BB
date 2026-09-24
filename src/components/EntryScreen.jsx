import React, { useRef, useLayoutEffect, useState } from 'react';
import gsap from 'gsap';
import config from '../config';
import ParticleField from '../effects/particles.jsx';
import audioManager from '../audio/audioManager';

export default function EntryScreen({ onComplete }) {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const buttonRef = useRef(null);
  const [clicked, setClicked] = useState(false);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Split text into words for staggered fade-in
      const words = config.entryText.split(' ');
      if (textRef.current) {
        textRef.current.innerHTML = words
          .map((word) => `<span class="word" style="display:inline-block; opacity:0; transform:translateY(12px);">${word}&nbsp;</span>`)
          .join('');
      }

      const wordElements = textRef.current ? textRef.current.querySelectorAll('.word') : [];

      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      tl.to(wordElements, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        delay: 0.3
      }).to(
        buttonRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'back.out(1.4)'
        },
        '-=0.2'
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleClick = (e) => {
    e.preventDefault();
    if (clicked) return;
    setClicked(true);

    // Synchronously initialize AudioContext on user click
    audioManager.init();
    audioManager.fadeIn(3, 0.35);
    audioManager.play('transition-whoosh');

    // Animate elements out before triggering next scene
    const ctx = gsap.context(() => {
      gsap.to([textRef.current, buttonRef.current], {
        opacity: 0,
        y: -15,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.in',
        onComplete: () => {
          if (onComplete) onComplete();
        }
      });
    }, containerRef);
  };

  return (
    <div ref={containerRef} className="scene">
      <ParticleField count={50} color="#D4AF7A" speed={0.4} size={2} />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-5)',
          maxWidth: '700px',
          width: '100%',
          padding: 'var(--space-3)'
        }}
      >
        <h1
          ref={textRef}
          className="glow-gold-text"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2.2rem, 5vw + 1rem, 4rem)',
            color: 'var(--ivory)',
            lineHeight: 1.25,
            minHeight: '4.5rem'
          }}
        >
          {config.entryText}
        </h1>

        <button
          ref={buttonRef}
          className="btn-gold glow-pulse"
          onClick={handleClick}
          disabled={clicked}
          style={{
            opacity: 0,
            transform: 'translateY(20px)',
            padding: 'var(--space-3) var(--space-6)',
            fontSize: '1rem',
            letterSpacing: '0.2em'
          }}
        >
          {config.entryButton}
        </button>
      </div>
    </div>
  );
}
