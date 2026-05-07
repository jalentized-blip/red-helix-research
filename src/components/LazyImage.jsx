import React, { useState, useEffect, useRef } from 'react';

/**
 * LazyImage — smart image component with CWV best practices:
 *
 * - priority=true  → eagerly loaded (LCP / above-fold images)
 *                    Sets fetchpriority="high", loading="eager", decoding="sync"
 * - priority=false → lazily loaded via IntersectionObserver + native loading="lazy"
 *                    rootMargin="200px" prefetches just before entering viewport
 *
 * Always pass explicit width/height to prevent CLS.
 */
const LazyImage = React.memo(({ src, alt, className, style, priority = false, width, height, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef(null);

  useEffect(() => {
    if (priority) return;
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [priority]);

  // Before in-view: render a sized placeholder div to reserve space (prevents CLS)
  if (!isInView) {
    return (
      <div
        ref={imgRef}
        className={`${className || ''} bg-slate-100 animate-pulse`}
        style={{ width, height, ...style }}
        aria-hidden="true"
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${className || ''} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      style={style}
      onLoad={() => setIsLoaded(true)}
      loading={priority ? 'eager' : 'lazy'}
      fetchpriority={priority ? 'high' : 'auto'}
      decoding={priority ? 'sync' : 'async'}
      width={width}
      height={height}
      {...props}
    />
  );
});

LazyImage.displayName = 'LazyImage';

export default LazyImage;