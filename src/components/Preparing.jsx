import React, { useRef, useLayoutEffect, useEffect } from 'react';
import gsap from 'gsap';
import config from '../config';
import ParticleField from '../effects/particles.jsx';
import audioManager from '../audio/audioManager';

export default function Preparing({ onComplete }) {
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const containerRef = useRef(null);
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);
  const dateRef = useRef(null);

  useEffect(() => {
    // Preload the CakeScene dynamic import chunk while Preparing is playing
    import('./CakeScene').catch(() => {});
  }, []);

  useLayoutEffect(() => {
    let isCompleted = false;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Step a) Line 1 fades in, holds, fades out
      tl.fromTo(
        line1Ref.current,
        { opacity: 0, y: 15, filter: 'blur(4px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, ease: 'power2.out' }
      )
        .to(line1Ref.current, { duration: 2.2 }) // hold
        .to(line1Ref.current, { opacity: 0, y: -15, filter: 'blur(4px)', duration: 0.6, ease: 'power2.in' })

        // Step b) Line 2 fades in, holds, fades out
        .fromTo(
          line2Ref.current,
          { opacity: 0, y: 15, filter: 'blur(4px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, ease: 'power2.out' }
        )
        .to(line2Ref.current, { duration: 2.2 }) // hold
        .to(line2Ref.current, { opacity: 0, y: -15, filter: 'blur(4px)', duration: 0.6, ease: 'power2.in' })

        // Step c) Short birthday date short fades in with gold glow & letter-spacing expansion
        .call(() => {
          audioManager.play('magical-shimmer');
        })
        .fromTo(
          dateRef.current,
          { opacity: 0, scale: 0.9, letterSpacing: '0.1em' },
          { opacity: 1, scale: 1, letterSpacing: '0.3em', duration: 1.0, ease: 'power2.out' }
        )
        .to(dateRef.current, { duration: 2.0 }) // hold
        .to(dateRef.current, {
          opacity: 0,
          scale: 1.05,
          duration: 0.6,
          ease: 'power2.in',
          onComplete: () => {
            if (!isCompleted) {
              isCompleted = true;
              onCompleteRef.current?.();
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
      <ParticleField count={40} color="#D4AF7A" speed={0.3} size={2} />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-3)',
          minHeight: '200px'
        }}
      >
        <h2
          ref={line1Ref}
          className="glow-gold-text"
          style={{
            position: 'absolute',
            opacity: 0,
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.8rem, 4vw + 0.5rem, 3.2rem)',
            color: 'var(--ivory)',
            textAlign: 'center'
          }}
        >
          {config.preparingLine1}
        </h2>

        <h2
          ref={line2Ref}
          className="glow-gold-text"
          style={{
            position: 'absolute',
            opacity: 0,
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.8rem, 4vw + 0.5rem, 3.2rem)',
            color: 'var(--gold)',
            fontStyle: 'italic',
            textAlign: 'center'
          }}
        >
          {config.preparingLine2}
        </h2>

        <div
          ref={dateRef}
          className="glow-gold-text"
          style={{
            position: 'absolute',
            opacity: 0,
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2rem, 5vw + 1rem, 4rem)',
            fontWeight: 700,
            color: 'var(--gold)',
            textAlign: 'center',
            whiteSpace: 'nowrap'
          }}
        >
          {config.birthdayDateShort}
        </div>
      </div>
    </div>
  );
}
