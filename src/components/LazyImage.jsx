import React, { useState, useEffect, useRef } from 'react';

/**
 * LazyImage — smart image component with CWV best practices:
 *
 * - priority=true  → eagerly loaded (use for LCP / above-fold images)
 *                    Sets fetchpriority="high", no lazy loading, no IntersectionObserver
 * - priority=false → lazily loaded via IntersectionObserver + native loading="lazy"
 *                    rootMargin="200px" prefetches just before entering viewport
 *
 * Always pass explicit width/height to prevent CLS (browser reserves space before load).
 * decoding="async" defers image decode off the main thread (better INP).
 */
const LazyImage = React.memo(({ src, alt, className, priority = false, width, height, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority); // priority images start in-view
  const imgRef = useRef(null);

  useEffect(() => {
    // Priority images load immediately — no observer needed
    if (priority) return;
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '200px' } // start loading 200px before it enters viewport
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [priority]);

  return (
    <div className="relative" style={{ display: 'contents' }}>
      {!isLoaded && (
        <div
          className={`${className} bg-slate-100 animate-pulse`}
          style={{ position: 'absolute', inset: 0 }}
          aria-hidden="true"
        />
      )}
      <img
        ref={imgRef}
        src={isInView ? src : undefined}
        alt={alt}
        className={`${className} transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setIsLoaded(true)}
        loading={priority ? 'eager' : 'lazy'}
        fetchpriority={priority ? 'high' : 'auto'}
        decoding={priority ? 'sync' : 'async'}
        width={width}
        height={height}
        {...props}
      />
    </div>
  );
});

LazyImage.displayName = 'LazyImage';

export default LazyImage;