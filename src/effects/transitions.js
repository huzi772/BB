import gsap from 'gsap';

/**
 * Fades in a target element with slight scale and blur removal.
 */
export const fadeInScene = (element, duration = 0.6) => {
  if (!element) return Promise.resolve();
  return new Promise((resolve) => {
    gsap.fromTo(
      element,
      { opacity: 0, scale: 0.98, filter: 'blur(4px)' },
      {
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        duration,
        ease: 'power2.out',
        onComplete: resolve
      }
    );
  });
};

/**
 * Fades out a target element with slight scale and blur.
 */
export const fadeOutScene = (element, duration = 0.6) => {
  if (!element) return Promise.resolve();
  return new Promise((resolve) => {
    gsap.to(element, {
      opacity: 0,
      scale: 1.02,
      filter: 'blur(6px)',
      duration,
      ease: 'power2.in',
      onComplete: resolve
    });
  });
};

/**
 * Performs a cinematic fade-through-black on an overlay element.
 */
export const fadeThroughBlack = (overlayElement, midCallback, duration = 0.8) => {
  if (!overlayElement) {
    if (midCallback) midCallback();
    return Promise.resolve();
  }

  const half = duration / 2;
  const tl = gsap.timeline();

  return new Promise((resolve) => {
    tl.to(overlayElement, {
      opacity: 1,
      duration: half,
      ease: 'power2.inOut',
      onComplete: () => {
        if (midCallback) midCallback();
      }
    }).to(overlayElement, {
      opacity: 0,
      duration: half,
      ease: 'power2.inOut',
      onComplete: resolve
    });
  });
};
