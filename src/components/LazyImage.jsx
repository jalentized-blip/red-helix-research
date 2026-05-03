import React, { useState, useEffect, useRef } from 'react';

const LazyImage = React.memo(({ src, alt, className, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
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
      { rootMargin: '50px' }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, []);

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
        loading="lazy"
        decoding="async"
        {...props}
      />
    </div>
  );
});

LazyImage.displayName = 'LazyImage';

export default LazyImage;