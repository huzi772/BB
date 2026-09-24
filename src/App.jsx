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

class SceneErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Scene rendering error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="scene" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--gold)', fontSize: '2rem', marginBottom: '1rem' }}>
            Something went wrong rendering this scene.
          </h2>
          <button
            className="btn-gold"
            onClick={() => window.location.reload()}
            style={{ cursor: 'pointer', padding: '0.8rem 1.6rem' }}
          >
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const sceneIndexRef = useRef(0);
  const transitioningRef = useRef(false);
  const overlayRef = useRef(null);
  const activeTimelineRef = useRef(null);
  const fallbackTimerRef = useRef(null);

  // Check URL parameter for ?dev=1 mode
  const [isDevMode, setIsDevMode] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      setIsDevMode(searchParams.get('dev') === '1');
    }
  }, []);

  const currentScene = SCENES[currentSceneIndex];

  const clearFallbackTimer = () => {
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
  };

  const resetTransitionState = () => {
    clearFallbackTimer();
    transitioningRef.current = false;
    setIsTransitioning(false);
    if (overlayRef.current) {
      overlayRef.current.style.opacity = '0';
      overlayRef.current.style.pointerEvents = 'none';
    }
  };

  const transitionToScene = (targetIndex) => {
    if (transitioningRef.current || targetIndex === sceneIndexRef.current) return;

    transitioningRef.current = true;
    setIsTransitioning(true);

    clearFallbackTimer();
    fallbackTimerRef.current = setTimeout(() => {
      console.warn('[App] Transition fallback timer triggered. Resetting transition lock.');
      if (activeTimelineRef.current) {
        activeTimelineRef.current.kill();
        activeTimelineRef.current = null;
      }
      resetTransitionState();
    }, 3000);

    const overlay = overlayRef.current;
    if (!overlay) {
      sceneIndexRef.current = targetIndex;
      setCurrentSceneIndex(targetIndex);
      resetTransitionState();
      return;
    }

    if (activeTimelineRef.current) {
      activeTimelineRef.current.kill();
    }

    // Cinematic fade-through-black transition (total ~0.8s)
    const tl = gsap.timeline();
    activeTimelineRef.current = tl;

    tl.to(overlay, {
      opacity: 1,
      duration: 0.4,
      ease: 'power2.inOut',
      onComplete: () => {
        sceneIndexRef.current = targetIndex;
        setCurrentSceneIndex(targetIndex);
      }
    }).to(overlay, {
      opacity: 0,
      duration: 0.4,
      ease: 'power2.inOut',
      onComplete: () => {
        activeTimelineRef.current = null;
        resetTransitionState();
      }
    });
  };

  useEffect(() => {
    return () => {
      clearFallbackTimer();
      if (activeTimelineRef.current) {
        activeTimelineRef.current.kill();
      }
    };
  }, []);

  const goTo = (sceneName) => {
    const idx = SCENES.indexOf(sceneName);
    if (idx !== -1) {
      transitionToScene(idx);
    }
  };

  const next = () => {
    const nextIdx = Math.min(sceneIndexRef.current + 1, SCENES.length - 1);
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
      <SceneErrorBoundary>
        {renderCurrentSceneComponent()}
      </SceneErrorBoundary>

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
