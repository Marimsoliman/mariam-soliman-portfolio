import { useEffect, useRef, useCallback } from 'react';

/**
 * 🔄 useProgressivePreload Hook
 * 
 * يحمل assets القسم التالي في الخلفية بينما المستخدم يشاهد القسم الحالي.
 * 
 * الفكرة:
 * - المستخدم في Hero → تحميل About images في الخلفية
 * - المستخدم في About → تحميل Projects images في الخلفية
 * - المستخدم في Projects → تحميل Services images في الخلفية
 * 
 * لا يحمل كل شيء مرة واحدة!
 */

const useProgressivePreload = (sections = []) => {
  const preloadedRef = useRef(new Set());
  const queueRef = useRef([]);

  // إضافة assets للقائمة
  const addToQueue = useCallback((assets, sectionId) => {
    if (preloadedRef.current.has(sectionId)) return;
    queueRef.current.push({ assets, sectionId });
  }, []);

  // تحميل asset واحد
  const preloadAsset = useCallback((url, type = 'image') => {
    if (!url || preloadedRef.current.has(url)) return;
    preloadedRef.current.add(url);

    if (type === 'image') {
      const img = new Image();
      img.src = url;
    } else if (type === 'video') {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.as = 'video';
      link.href = url;
      document.head.appendChild(link);
    }
  }, []);

  // ★ مراقبة الأقسام وتحميل القسم التالي
  useEffect(() => {
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const currentIndex = sections.findIndex(
            (s) => s.id === entry.target.id
          );

          if (currentIndex === -1) return;

          // تحميل assets القسم التالي فقط
          const nextSection = sections[currentIndex + 1];
          if (nextSection && !preloadedRef.current.has(nextSection.id)) {
            preloadedRef.current.add(nextSection.id);

            // تحميل تدريجي: asset كل 200ms
            nextSection.assets?.forEach((asset, i) => {
              setTimeout(() => {
                preloadAsset(asset.url, asset.type || 'image');
              }, i * 200);
            });
          }
        });
      },
      {
        rootMargin: '100px 0px',
        threshold: 0.3,
      }
    );

    sections.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections, preloadAsset]);

  return { addToQueue, preloadAsset };
};

export default useProgressivePreload;