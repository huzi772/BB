import React, { useState } from 'react';
import config from './config';

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

  const currentScene = SCENES[currentSceneIndex];

  const goTo = (sceneName) => {
    const idx = SCENES.indexOf(sceneName);
    if (idx !== -1) {
      setCurrentSceneIndex(idx);
    }
  };

  const next = () => {
    setCurrentSceneIndex((prevIdx) => (prevIdx + 1) % SCENES.length);
  };

  const prev = () => {
    setCurrentSceneIndex((prevIdx) => (prevIdx - 1 + SCENES.length) % SCENES.length);
  };

  return (
    <div className="scene fade-in">
      {/* Header Banner */}
      <header style={{ marginBottom: 'var(--space-4)' }}>
        <p className="subtitle glow-gold-text">Cinematic Birthday Surprise • Design System & Architecture Demo</p>
        <h1 className="glow-gold-text" style={{ marginTop: 'var(--space-1)' }}>
          {config.recipientName}'s Celebration
        </h1>
        <p className="subtitle" style={{ fontSize: '1rem', marginTop: 'var(--space-1)', color: 'var(--ivory)' }}>
          {config.birthdayDateShort}
        </p>
      </header>

      {/* Main Interactive Demo Container */}
      <main
        className="glow-purple-box fade-up"
        style={{
          background: 'rgba(13, 11, 20, 0.85)',
          border: '1px solid var(--wine)',
          borderRadius: '12px',
          padding: 'var(--space-5)',
          maxWidth: '850px',
          width: '100%',
          backdropFilter: 'blur(10px)',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)'
        }}
      >
        {/* Current Active Scene Display & Direct Navigation Controls */}
        <section
          style={{
            background: 'rgba(5, 5, 9, 0.6)',
            padding: 'var(--space-3)',
            borderRadius: '8px',
            border: '1px solid rgba(212, 175, 122, 0.2)'
          }}
        >
          <p style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.8rem', color: 'var(--gold)' }}>
            Current Scene State
          </p>
          <h2 style={{ margin: 'var(--space-1) 0', textTransform: 'capitalize' }}>
            "{currentScene}" <span style={{ fontSize: '1rem', opacity: 0.6 }}>({currentSceneIndex + 1} of {SCENES.length})</span>
          </h2>

          <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'center', flexWrap: 'wrap', marginTop: 'var(--space-3)' }}>
            <button className="btn-gold" onClick={prev}>
              ← Previous Scene
            </button>
            <button className="btn-gold glow-pulse" onClick={next}>
              Next Scene →
            </button>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-1)', justifyContent: 'center', flexWrap: 'wrap', marginTop: 'var(--space-3)' }}>
            {SCENES.map((sceneName) => (
              <button
                key={sceneName}
                className={`btn-gold ${sceneName === currentScene ? 'active' : ''}`}
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', minHeight: '36px' }}
                onClick={() => goTo(sceneName)}
              >
                {sceneName}
              </button>
            ))}
          </div>
        </section>

        {/* Design System & Sample Values Showcase */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'var(--space-3)',
            textAlign: 'left'
          }}
        >
          <div style={{ background: 'rgba(92, 15, 36, 0.2)', padding: 'var(--space-3)', borderRadius: '6px' }}>
            <h3 className="glow-gold-text">Typography Showcase</h3>
            <p className="subtitle" style={{ margin: 'var(--space-1) 0' }}>Subtitle in Cormorant Italic</p>
            <p className="body-text" style={{ fontSize: '0.9rem' }}>
              Body text formatted in Manrope font. Clean, readable, luxury dark theme aesthetics.
            </p>
          </div>

          <div style={{ background: 'rgba(92, 15, 36, 0.2)', padding: 'var(--space-3)', borderRadius: '6px' }}>
            <h3 className="glow-purple-text">Config Values</h3>
            <ul style={{ listStyle: 'none', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
              <li><strong>Final Msg:</strong> {config.finalMessage}</li>
              <li><strong>Gift Labels:</strong> {config.giftLabels.join(', ')}</li>
              <li><strong>Memories count:</strong> {config.memories.length} entries</li>
            </ul>
          </div>
        </section>

        <footer style={{ fontSize: '0.8rem', opacity: 0.7, color: 'var(--ivory)' }}>
          {config.letterText}
        </footer>
      </main>
    </div>
  );
}
