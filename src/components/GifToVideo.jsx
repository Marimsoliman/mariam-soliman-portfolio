import React, { useRef, useEffect, useState, useCallback } from 'react';

/**
 * 🎬 GifToVideo Component
 * 
 * يحل محل الـ GIF التقليدي بفيديو WebM/MP4 أخف بـ 80-95%
 * 
 * مثال: GIF بحجم 5MB → WebM بحجم 300KB
 * 
 * الاستخدام:
 * 1. حوّل الـ GIF إلى WebM + MP4 باستخدام:
 *    ffmpeg -i input.gif -c:v libvpx-vp9 -b:v 0 -crf 30 output.webm
 *    ffmpeg -i input.gif -c:v libx264 -pix_fmt yuv420p output.mp4
 * 
 * 2. أو استخدم أداة أونلاين: https://cloudconvert.com/gif-to-webm
 */

const GifToVideo = ({
  srcWebM,       // المسار الأساسي (الأخف)
  srcMP4,        // Fallback للمتصفحات القديمة
  srcGif,        // Fallback النهائي (GIF الأصلي)
  poster,        // صورة ثابتة تظهر قبل التحميل
  alt = '',
  width,
  height,
  aspectRatio,
  loop = true,
  autoPlay = true,
  lazy = true,
  priority = false,
  className = '',
  wrapperClassName = '',
  objectFit = 'cover',
  muted = true,
  playsInline = true,
}) => {
  const videoRef = useRef(null);
  const wrapperRef = useRef(null);
  const [isInView, setIsInView] = useState(priority || !lazy);
  const [isLoaded, setIsLoaded] = useState(false);

  // ★ Lazy loading للفيديو
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
        rootMargin: '300px 0px', // بدء التحميل قبل 300px
        threshold: 0.01,
      }
    );

    if (wrapperRef.current) {
      observer.observe(wrapperRef.current);
    }

    return () => observer.disconnect();
  }, [priority, lazy, isInView]);

  // ★ تشغيل/إيقاف الفيديو بناءً على الرؤية (توفير موارد)
  useEffect(() => {
    if (!isInView || !autoPlay) return;

    const video = videoRef.current;
    if (!video) return;

    const playObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.1 }
    );

    playObserver.observe(video);

    return () => {
      playObserver.disconnect();
      video.pause();
    };
  }, [isInView, autoPlay]);

  const handleLoadedData = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const computedAspectRatio = aspectRatio || (width && height ? `${width} / ${height}` : undefined);

  return (
    <div
      ref={wrapperRef}
      className={`gif-video-wrapper optimized-image-wrapper ${wrapperClassName}`}
      style={{
        aspectRatio: computedAspectRatio,
        width: width ? `${width}px` : '100%',
        maxWidth: '100%',
      }}
      role="img"
      aria-label={alt}
    >
      {/* Skeleton */}
      {!isLoaded && <div className="skeleton-shimmer" />}

      {/* Poster placeholder */}
      {poster && !isLoaded && (
        <div
          className="placeholder-blur"
          style={{ backgroundImage: `url(${poster})` }}
          aria-hidden="true"
        />
      )}

      {isInView && (
        <video
          ref={videoRef}
          className={`real-image ${isLoaded ? 'loaded' : ''} ${className}`}
          style={{ objectFit }}
          width={width}
          height={height}
          loop={loop}
          muted={muted}
          playsInline={playsInline}
          autoPlay={autoPlay}
          poster={poster}
          preload={priority ? 'auto' : 'metadata'}
          onLoadedData={handleLoadedData}
        >
          {/* WebM أولاً (الأخف والأفضل) */}
          {srcWebM && <source src={srcWebM} type="video/webm" />}
          {/* MP4 كـ fallback */}
          {srcMP4 && <source src={srcMP4} type="video/mp4" />}
          {/* GIF كـ fallback نهائي */}
          {srcGif && (
            <img
              src={srcGif}
              alt={alt}
              loading="lazy"
              decoding="async"
              style={{ objectFit, width: '100%', height: '100%' }}
            />
          )}
        </video>
      )}
    </div>
  );
};

export default React.memo(GifToVideo);