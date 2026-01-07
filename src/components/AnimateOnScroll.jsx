import React, { useRef, useEffect, useState } from 'react';

export default function AnimateOnScroll({ children, animationClass, delay = 0, threshold = 0.1, ...rest }) {
  const [isVisible, setVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisible(true);
            // Optionally, unobserve after animation if it's a one-time thing
            observer.unobserve(domRef.current);
          }
        });
      },
      {
        threshold: threshold,
        rootMargin: '0px 0px -10% 0px' // Trigger a bit before it's fully in view
      }
    );

    const currentRef = domRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold]);

  return (
    <div
      ref={domRef}
      className={`${isVisible ? animationClass : 'hidden-anim'}`}
      style={{ animationDelay: `${delay}ms` }}
      {...rest}
    >
      {children}
    </div>
  );
}
