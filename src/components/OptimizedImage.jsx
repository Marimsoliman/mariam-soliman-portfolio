import React, { useState, useRef, useEffect, useCallback } from 'react';

/**
 * 🚀 OptimizedImage Component
 * 
 * مميزات:
 * - Blur-up placeholder تلقائي
 * - Lazy loading ذكي مع IntersectionObserver
 * - Responsive srcset للموبايل والتابلت والديسكتوب
 * - WebP/AVIF تلقائي
 * - Aspect ratio ثابت لمنع Layout Shift
 * - Skeleton shimmer أثناء التحميل
 * - Hero images تتحمل فوراً (eager)
 */

const OptimizedImage = ({
  src,
  alt = '',
  width,
  height,
  aspectRatio,
  // Responsive sources
  srcMobile,    // ≤ 480px
  srcTablet,    // ≤ 1024px
  srcDesktop,   // > 1024px
  // WebP versions
  srcWebP,
  srcWebPMobile,
  srcWebPTablet,
  // AVIF versions (أفضل ضغط)
  srcAVIF,
  srcAVIFMobile,
  srcAVIFTablet,
  // Placeholder
  placeholder,  // base64 أو URL صغير جداً (20-30px)
  // Loading behavior
  priority = false,     // true للـ Hero فقط
  lazy = true,          // false للـ above-the-fold
  // Styling
  className = '',
  wrapperClassName = '',
  objectFit = 'cover',
  objectPosition = 'center',
  // Callbacks
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority || !lazy);
  const [hasError, setHasError] = useState(false);
  const wrapperRef = useRef(null);
  const imgRef = useRef(null);

  // ★ IntersectionObserver: تحميل الصورة فقط عندما تقترب من الـ viewport
  useEffect(() => {
    if (priority || !lazy || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '200px 0px', // بدء التحميل قبل 200px من الوصول
        threshold: 0.01,
      }
    );

    if (wrapperRef.current) {
      observer.observe(wrapperRef.current);
    }

    return () => observer.disconnect();
  }, [priority, lazy, isInView]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  // حساب aspect ratio
  const computedAspectRatio = aspectRatio || (width && height ? `${width} / ${height}` : undefined);

  // بناء srcset responsive
  const buildSrcSet = () => {
    const sources = [];
    
    if (srcAVIF) {
      if (srcAVIFMobile) sources.push(`${srcAVIFMobile} 480w`);
      if (srcAVIFTablet) sources.push(`${srcAVIFTablet} 1024w`);
      sources.push(`${srcAVIF} 1920w`);
      return { srcSet: sources.join(', '), type: 'image/avif' };
    }
    
    if (srcWebP) {
      if (srcWebPMobile) sources.push(`${srcWebPMobile} 480w`);
      if (srcWebPTablet) sources.push(`${srcWebPTablet} 1024w`);
      sources.push(`${srcWebP} 1920w`);
      return { srcSet: sources.join(', '), type: 'image/webp' };
    }

    if (srcMobile || srcTablet) {
      if (srcMobile) sources.push(`${srcMobile} 480w`);
      if (srcTablet) sources.push(`${srcTablet} 1024w`);
      if (srcDesktop || src) sources.push(`${srcDesktop || src} 1920w`);
      return { srcSet: sources.join(', '), type: null };
    }

    return null;
  };

  const srcSetData = buildSrcSet();

  // ★ Preload للـ Hero images
  useEffect(() => {
    if (!priority) return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = srcAVIF || srcWebP || src;
    if (srcSetData?.type) link.type = srcSetData.type;
    document.head.appendChild(link);
    
    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, [priority, src, srcAVIF, srcWebP, srcSetData]);

  return (
    <div
      ref={wrapperRef}
      className={`optimized-image-wrapper ${wrapperClassName}`}
      style={{
        aspectRatio: computedAspectRatio,
        width: width ? `${width}px` : '100%',
        maxWidth: '100%',
      }}
    >
      {/* Skeleton Shimmer */}
      {!isLoaded && !hasError && (
        <div className={`skeleton-shimmer ${isLoaded ? 'loaded' : ''}`} />
      )}

      {/* Blur Placeholder */}
      {placeholder && (
        <div
          className={`placeholder-blur ${isLoaded ? 'loaded' : ''}`}
          style={{ backgroundImage: `url(${placeholder})` }}
          aria-hidden="true"
        />
      )}

      {/* الصورة الحقيقية */}
      {isInView && !hasError && (
        <picture>
          {/* AVIF sources (أفضل ضغط) */}
          {srcAVIF && (
            <>
              {srcAVIFMobile && (
                <source
                  media="(max-width: 480px)"
                  srcSet={srcAVIFMobile}
                  type="image/avif"
                />
              )}
              {srcAVIFTablet && (
                <source
                  media="(max-width: 1024px)"
                  srcSet={srcAVIFTablet}
                  type="image/avif"
                />
              )}
              <source srcSet={srcAVIF} type="image/avif" />
            </>
          )}

          {/* WebP sources */}
          {srcWebP && !srcAVIF && (
            <>
              {srcWebPMobile && (
                <source
                  media="(max-width: 480px)"
                  srcSet={srcWebPMobile}
                  type="image/webp"
                />
              )}
              {srcWebPTablet && (
                <source
                  media="(max-width: 1024px)"
                  srcSet={srcWebPTablet}
                  type="image/webp"
                />
              )}
              <source srcSet={srcWebP} type="image/webp" />
            </>
          )}

          {/* Responsive srcset للـ JPG/PNG */}
          {srcSetData && !srcAVIF && !srcWebP && (
            <source srcSet={srcSetData.srcSet} sizes="100vw" />
          )}

          <img
            ref={imgRef}
            src={src}
            alt={alt}
            width={width}
            height={height}
            loading={priority ? 'eager' : 'lazy'}
            decoding={priority ? 'sync' : 'async'}
            fetchPriority={priority ? 'high' : 'auto'}
            className={`real-image ${isLoaded ? 'loaded' : ''} ${priority ? 'hero-critical-image' : ''} ${className}`}
            style={{ objectFit, objectPosition }}
            onLoad={handleLoad}
            onError={handleError}
          />
        </picture>
      )}
    </div>
  );
};

export default React.memo(OptimizedImage);