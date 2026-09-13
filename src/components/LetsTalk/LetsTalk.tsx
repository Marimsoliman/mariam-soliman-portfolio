// components/LetsTalk/LetsTalk.tsx
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function LetsTalk() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top 70%",
        },
        defaults: { ease: "power3.out" },
      });

      tl.to(".talk-eyebrow", { y: 0, opacity: 1, duration: 0.8 }, 0)
        .to(".talk-title", { y: 0, opacity: 1, duration: 1 }, 0.08)
        .to(".talk-description", { y: 0, opacity: 1, duration: 0.9 }, 0.16)
        .to(".talk-card", { y: 0, opacity: 1, stagger: 0.12, duration: 0.9 }, 0.28);
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="lets-talk-section"
      aria-label="Let's Talk"
    >
      <div className="lets-talk-container">
        {/* HEADER */}
        <header className="lets-talk-header">
          <p className="talk-eyebrow">Contact</p>
          <h2 className="talk-title">
            Let&apos;s <i>Talk</i>
          </h2>
          <p className="talk-description">
            Have an idea, a project in mind, or just want to say hi? I&apos;d
            love to hear about what you&apos;re working on and how I can help
            bring it to life.
          </p>
        </header>

        {/* CONTACT CARDS */}
        <div className="lets-talk-grid">
          {/* EMAIL CARD */}
          <a
            href="mailto:mariam8tarek@gmail.com"
            className="talk-card"
            target="_blank"
            rel="noreferrer"
          >
            <div className="talk-card__glow" />
            <div className="talk-card__header">
              <span className="talk-card__number">01</span>
              <span className="talk-card__subtitle">Direct</span>
            </div>

            <div className="talk-card__content">
              <h3 className="talk-card__title">Email Me</h3>
              <p className="talk-card__description">
                The fastest way to get a response for your next project or
                collaboration.
              </p>
            </div>

            <div className="talk-card__footer">
              <div className="talk-card__link">
                <span>mariam8tarek@gmail.com</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-arrow-up-right"
                >
                  <path d="M7 7h10v10" />
                  <path d="M7 17 17 7" />
                </svg>
              </div>
            </div>
          </a>

          {/* WHATSAPP CARD */}
          <a
            href="https://wa.me/201000000000"
            className="talk-card"
            target="_blank"
            rel="noreferrer"
          >
            <div className="talk-card__glow" />
            <div className="talk-card__header">
              <span className="talk-card__number">02</span>
              <span className="talk-card__subtitle">Chat</span>
            </div>

            <div className="talk-card__content">
              <h3 className="talk-card__title">Let&apos;s Chat</h3>
              <p className="talk-card__description">
                Prefer a quick conversation? Feel free to reach out to me on
                WhatsApp.
              </p>
            </div>

            <div className="talk-card__footer">
              <div className="talk-card__link">
                <span>WhatsApp</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-arrow-up-right"
                >
                  <path d="M7 7h10v10" />
                  <path d="M7 17 17 7" />
                </svg>
              </div>
            </div>
          </a>

          {/* START A PROJECT CARD */}
          <a
            href="mailto:mariam8tarek@gmail.com?subject=Project%20Inquiry"
            className="talk-card"
            target="_blank"
            rel="noreferrer"
          >
            <div className="talk-card__glow" />
            <div className="talk-card__header">
              <span className="talk-card__number">03</span>
              <span className="talk-card__subtitle">Work</span>
            </div>

            <div className="talk-card__content">
              <h3 className="talk-card__title">Start a Project</h3>
              <p className="talk-card__description">
                Tell me a few details about your project, timeline, and goals
                and I&apos;ll get back to you.
              </p>
            </div>

            <div className="talk-card__footer">
              <div className="talk-card__link">
                <span>Send Project Brief</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-arrow-up-right"
                >
                  <path d="M7 7h10v10" />
                  <path d="M7 17 17 7" />
                </svg>
              </div>
            </div>
          </a>
        </div>

        {/* BOTTOM CTA */}
        <div className="lets-talk-bottom">
          <p className="talk-availability">Currently open for freelance & collaborations</p>
          <a
            href="mailto:mariam8tarek@gmail.com"
            className="talk-big-btn"
          >
            <span>Get in Touch</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-arrow-up-right"
            >
              <path d="M7 7h10v10" />
              <path d="M7 17 17 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}