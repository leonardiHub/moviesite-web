/**
 * Intersection Observer for scroll animations
 * Handles the .ros (reveal-on-scroll) class animations
 */

let observer: IntersectionObserver | null = null;

export const initScrollAnimations = () => {
  // Check if we're in the browser
  if (typeof window === 'undefined') return;

  // Respect user's motion preferences
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    // Immediately show all elements if user prefers reduced motion
    document.querySelectorAll('.ros').forEach(el => {
      el.classList.add('visible');
    });
    return;
  }

  // Clean up existing observer
  if (observer) {
    observer.disconnect();
  }

  // Create intersection observer
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          
          // For staggered animations, add delays to children
          if (entry.target.hasAttribute('data-stagger')) {
            const children = entry.target.children;
            Array.from(children).forEach((child, index) => {
              setTimeout(() => {
                child.classList.add('visible');
              }, index * 100); // 100ms delay between each child
            });
          }
          
          // Unobserve the element after it becomes visible (performance optimization)
          observer?.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1, // Trigger when 10% of the element is visible
      rootMargin: '0px 0px -50px 0px' // Trigger slightly before the element comes into view
    }
  );

  // Observe all elements with .ros class
  document.querySelectorAll('.ros').forEach((el) => {
    observer?.observe(el);
  });
};

export const cleanupScrollAnimations = () => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
};

// Auto-initialize when the DOM is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollAnimations);
  } else {
    initScrollAnimations();
  }

  // Re-initialize on navigation (for SPA)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      setTimeout(initScrollAnimations, 100); // Small delay to ensure DOM is updated
    }
  }).observe(document, { subtree: true, childList: true });
}

export default {
  init: initScrollAnimations,
  cleanup: cleanupScrollAnimations
};
