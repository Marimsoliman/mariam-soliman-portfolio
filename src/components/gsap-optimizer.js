import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * ⚡ GSAP Performance Optimizer
 * 
 * يمنع GSAP من إجبار المتصفح على تحميل كل الصور عند بدء الصفحة.
 * يؤجل تهيئة الـ animations الثقيلة حتى يقترب المستخدم منها.
 */

// ★ تهيئة كسولة للـ animations
export function lazyScrollAnimation(element, animationConfig, options = {}) {
  const {
    trigger = element,
    start = 'top 85%',
    end = 'bottom 20%',
    scrub = false,
    once = true,
    preloadImages = true,
  } = options;

  // تأجيل التهيئة حتى العنصر يقترب من الـ viewport
  const initObserver = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      initObserver.disconnect();

      // انتظار تحميل الصور داخل العنصر قبل بدء الـ animation
      if (preloadImages) {
        const images = element.querySelectorAll('img, video');
        const promises = Array.from(images).map((img) => {
          if (img.complete || img.readyState >= 3) return Promise.resolve();
          return new Promise((resolve) => {
            img.addEventListener('load', resolve, { once: true });
            img.addEventListener('error', resolve, { once: true });
            // Timeout لمنع الانتظار للأبد
            setTimeout(resolve, 3000);
          });
        });

        Promise.all(promises).then(() => {
          createAnimation();
        });
      } else {
        createAnimation();
      }

      function createAnimation() {
        gsap.fromTo(
          element,
          animationConfig.from || {},
          {
            ...animationConfig.to,
            scrollTrigger: {
              trigger,
              start,
              end,
              scrub,
              once,
              // ★ تحسين الأداء: عدم تحديث الـ DOM إلا عند الحاجة
              fastScrollEnd: true,
              // ★ منع الـ animation من العمل خارج الـ viewport
              invalidateOnRefresh: true,
            },
          }
        );
      }
    },
    {
      rootMargin: '400px 0px', // بدء التهيئة قبل 400px
      threshold: 0.01,
    }
  );

  initObserver.observe(trigger);

  // Cleanup
  return () => {
    initObserver.disconnect();
    ScrollTrigger.getAll().forEach((st) => {
      if (st.trigger === trigger) st.kill();
    });
  };
}

// ★ تهيئة ذكية لكل الأقسام
export function initAllSectionsAnimations(sectionsConfig) {
  const cleanups = [];

  sectionsConfig.forEach(({ selector, animation, options }) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => {
      const cleanup = lazyScrollAnimation(el, animation, options);
      cleanups.push(cleanup);
    });
  });

  // Cleanup function
  return () => cleanups.forEach((fn) => fn());
}

// ★ Mobile-specific: تقليل الحركات على الأجهزة الضعيفة
export function getResponsiveAnimationValues() {
  const isMobile = window.innerWidth < 768;
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReducedMotion) {
    return {
      y: 0,
      x: 0,
      scale: 1,
      rotation: 0,
      duration: 0.01,
      stagger: 0,
    };
  }

  if (isMobile) {
    return {
      y: 30,       // أقل من الديسكتوب (اللي بيكون 60-100)
      x: 0,
      scale: 0.97, // أقل تأثير
      rotation: 0,
      duration: 0.5,
      stagger: 0.08,
    };
  }

  if (isTablet) {
    return {
      y: 45,
      x: 15,
      scale: 0.96,
      rotation: 1,
      duration: 0.7,
      stagger: 0.1,
    };
  }

  // Desktop
  return {
    y: 60,
    x: 30,
    scale: 0.95,
    rotation: 2,
    duration: 1,
    stagger: 0.15,
  };
}