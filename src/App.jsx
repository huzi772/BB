import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';

import EntryScreen from './components/EntryScreen';
import Countdown from './components/Countdown';
import Preparing from './components/Preparing';
import BirthdayReveal from './components/BirthdayReveal';
import GiftCenter from './components/GiftCenter';
import FinalScene from './components/FinalScene';

const CakeScene = React.lazy(() => import('./components/CakeScene'));

export const SCENES = [
  "entry",
  "countdown",
  "preparing",
  "cake",
  "reveal",
  "gifts",
  "final"
];

export default function App() {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const overlayRef = useRef(null);

  // Check URL parameter for ?dev=1 mode
  const [isDevMode, setIsDevMode] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      setIsDevMode(searchParams.get('dev') === '1');
    }
  }, []);

  const currentScene = SCENES[currentSceneIndex];

  const transitionToScene = (targetIndex) => {
    if (isTransitioning || targetIndex === currentSceneIndex) return;

    setIsTransitioning(true);

    const overlay = overlayRef.current;
    if (!overlay) {
      setCurrentSceneIndex(targetIndex);
      setIsTransitioning(false);
      return;
    }

    // Cinematic fade-through-black transition (total ~0.8s)
    const tl = gsap.timeline();
    tl.to(overlay, {
      opacity: 1,
      duration: 0.4,
      ease: 'power2.inOut',
      onComplete: () => {
        setCurrentSceneIndex(targetIndex);
      }
    }).to(overlay, {
      opacity: 0,
      duration: 0.4,
      ease: 'power2.inOut',
      onComplete: () => {
        setIsTransitioning(false);
      }
    });
  };

  const goTo = (sceneName) => {
    const idx = SCENES.indexOf(sceneName);
    if (idx !== -1) {
      transitionToScene(idx);
    }
  };

  const next = () => {
    const nextIdx = (currentSceneIndex + 1) % SCENES.length;
    transitionToScene(nextIdx);
  };

  const renderCurrentSceneComponent = () => {
    switch (currentScene) {
      case 'entry':
        return <EntryScreen onComplete={next} />;
      case 'countdown':
        return <Countdown onComplete={next} />;
      case 'preparing':
        return <Preparing onComplete={next} />;
      case 'cake':
        return (
          <React.Suspense
            fallback={
              <div className="scene" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--gold)', fontStyle: 'italic', fontSize: '1.5rem' }}>
                  Preparing the cake...
                </div>
              </div>
            }
          >
            <CakeScene onComplete={next} />
          </React.Suspense>
        );
      case 'reveal':
        return <BirthdayReveal onComplete={next} />;
      case 'gifts':
        return <GiftCenter onComplete={next} />;
      case 'final':
        return <FinalScene onComplete={next} />;
      default:
        return <EntryScreen onComplete={next} />;
    }
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#050509' }}>
      {/* Active Scene Content */}
      {renderCurrentSceneComponent()}

      {/* Fullscreen Transition Overlay */}
      <div
        ref={overlayRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: '#050509',
          opacity: 0,
          pointerEvents: isTransitioning ? 'all' : 'none',
          zIndex: 9999
        }}
      />

      {/* Unobtrusive Developer Jumper (Renders ONLY if ?dev=1) */}
      {isDevMode && (
        <div
          style={{
            position: 'fixed',
            bottom: '12px',
            right: '12px',
            zIndex: 10000,
            background: 'rgba(13, 11, 20, 0.85)',
            border: '1px solid rgba(212, 175, 122, 0.4)',
            borderRadius: '8px',
            padding: '6px 10px',
            display: 'flex',
            gap: '4px',
            alignItems: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(6px)'
          }}
        >
          <span style={{ fontSize: '0.7rem', color: 'var(--gold)', textTransform: 'uppercase', marginRight: '4px' }}>
            DEV:
          </span>
          {SCENES.map((sceneName) => (
            <button
              key={sceneName}
              onClick={() => goTo(sceneName)}
              disabled={isTransitioning}
              style={{
                background: sceneName === currentScene ? 'var(--gold)' : 'transparent',
                color: sceneName === currentScene ? '#050509' : 'var(--ivory)',
                border: '1px solid var(--gold)',
                borderRadius: '4px',
                padding: '2px 6px',
                fontSize: '0.65rem',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {sceneName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
