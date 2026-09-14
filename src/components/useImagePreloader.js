import { useState, useEffect, useCallback } from 'react';

/**
 * ⚡ useImagePreloader
 * 
 * يحمل فقط الـ critical assets (Hero) فوراً،
 * ثم يحمل باقي الأقسام تدريجياً.
 */

const useImagePreloader = (criticalAssets = [], backgroundAssets = []) => {
  const [criticalLoaded, setCriticalLoaded] = useState(false);
  const [progress, setProgress] = useState(0);

  // ★ Phase 1: تحميل الـ Hero فوراً
  useEffect(() => {
    if (!criticalAssets.length) {
      setCriticalLoaded(true);
      return;
    }

    let loaded = 0;
    const total = criticalAssets.length;

    criticalAssets.forEach((url) => {
      const img = new Image();
      img.src = url;
      img.onload = img.onerror = () => {
        loaded++;
        setProgress(Math.round((loaded / total) * 50)); // 0-50% للـ critical
        if (loaded === total) {
          setCriticalLoaded(true);
        }
      };
    });

    // Timeout: لا تنتظر أكثر من 5 ثواني
    const timeout = setTimeout(() => setCriticalLoaded(true), 5000);
    return () => clearTimeout(timeout);
  }, [criticalAssets]);

  // ★ Phase 2: تحميل الـ background assets تدريجياً
  useEffect(() => {
    if (!criticalLoaded || !backgroundAssets.length) return;

    let loaded = 0;
    const total = backgroundAssets.length;

    // تحميل asset واحد كل 150ms
    backgroundAssets.forEach((url, index) => {
      setTimeout(() => {
        const img = new Image();
        img.src = url;
        img.onload = img.onerror = () => {
          loaded++;
          setProgress(50 + Math.round((loaded / total) * 50)); // 50-100%
        };
      }, index * 150);
    });
  }, [criticalLoaded, backgroundAssets]);

  return { criticalLoaded, progress };
};

export default useImagePreloader;