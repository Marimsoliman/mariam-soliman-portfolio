"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./projects.css";

gsap.registerPlugin(ScrollTrigger);

type Project = {
  id: string;
  title: string;
  category: string;
  year: string;
  description: string;
  tags: string[];
  image?: string;
  link?: string;
};

const projects: Project[] = [
  {
    id: "01",
    title: "MIRA",
    category: "Immersive Culinary Web Experience",
    year: "2024",
    description:
      "A cinematic, scroll-driven dining experience that treats scroll as a storytelling mechanism rather than simple navigation — combining large-scale typography, imagery, and motion to present food as a visual narrative.",
    tags: ["TypeScript", "Vite", "JavaScript"],
    image: "/images/projects/mira.gif",
    link: "https://mira-sooty-theta.vercel.app/",
  },
  {
    id: "02",
    title: "VÉRA Developments",
    category: "Cinematic Real Estate Web Experience",
    year: "2024",
    description:
      "A premium real estate landing page built around cinematic, scroll-driven storytelling instead of a traditional layout, with a section-based, viewport-aware animation architecture guiding users through the brand narrative.",
    tags: ["TypeScript", "Vite", "JavaScript"],
    image: "/images/projects/vera.gif",
    link: "https://vera-liard-one.vercel.app/",
  },
  {
    id: "03",
    title: "Kerolos Portfolio",
    category: "Client Portfolio Website",
    year: "2026",
    description:
      "Developed a premium personal portfolio for a creative graphic designer client, featuring motion-driven navigation, dynamic project showcases, and a fully responsive design system built to highlight visual branding work.",
    tags: ["Next.js", "React", "Motion Design"],
    image: "/images/projects/kerolos.png",
    link: "https://kerolos-seven.vercel.app/",
  },
  {
    id: "04",
    title: "SaaS Analytics Dashboard",
    category: "Data-Driven Admin Panel",
    year: "2025",
    description:
      "A full-featured analytics dashboard rendering real-time business metrics through dynamic, interactive charts, with secure authentication, role-based access, and a persistent dark mode / light mode theme system.",
    tags: ["React", "Recharts", "REST API"],
    image: "/images/projects/saas-dashboard.png",
    link: "#",
  },
  {
    id: "05",
    title: "VR Library",
    category: "University Virtual Library System",
    year: "2025",
    description:
      "An immersive virtual library with categorized bookshelves, 3D navigation, and VR reading areas for 200+ academic resources, with custom navigation controls that make it fully browsable without a VR headset.",
    tags: ["JavaScript", "HTML5", "VR Navigation"],
    image: "/images/projects/vr-library.png",
    link: "#",
  },
];

export function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const container = containerRef.current;
    const track = trackRef.current;

    if (!section || !container || !track) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const context = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".project-card");
      const getScrollDistance = () => track.scrollWidth - container.clientWidth;

      // تفعيل الأنيميشن والـ Pin للديسكتوب والموبايل معاً دون أي استثناء
      const horizontalTween = gsap.to(track, {
        x: () => -getScrollDistance(),
        ease: "none",
        scrollTrigger: {
          id: "projects-horizontal",
          trigger: container,
          start: "top top",
          end: () => `+=${getScrollDistance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      // حركة ظهور الكروت واختفائها بالتدريج لتعطي مظهراً فخماً ومريحاً للعين
      cards.forEach((card) => {
        gsap.fromTo(
          card,
          { autoAlpha: 0.1, scale: 0.93 },
          {
            autoAlpha: 1,
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              containerAnimation: horizontalTween,
              start: "left 90%",
              end: "left 45%",
              scrub: true,
            },
          }
        );
      });

      // إعادة التحديث لحساب الأبعاد بدقة
      setTimeout(() => ScrollTrigger.refresh(), 150);
    }, section);

    return () => context.revert();
  }, []);

  return (
    <section ref={sectionRef} className="projects-section" id="work">
      <div ref={containerRef} className="projects-container">
        <header className="projects-header">
          <p className="projects-eyebrow">Selected Work</p>
          <p className="projects-hint">Scroll down ↓</p>
        </header>

        <div ref={trackRef} className="projects-track">
          {projects.map((project, index) => (
            <article className="project-card" key={project.id} data-index={index}>
              <div className="project-card__media">
                {project.image ? (
                  <img
                    src={project.image}
                    alt={project.title}
                    className="project-card__image"
                    loading="lazy"
                  />
                ) : (
                  <div className="project-card__image" />
                )}
              </div>

              <div className="project-card__body">
                <div className="project-card__meta">
                  <span className="project-card__category">{project.category}</span>
                  <span className="project-card__year">{project.year}</span>
                </div>
                <h3 className="project-card__title">{project.title}</h3>
                <p className="project-card__description">{project.description}</p>
                <div className="project-card__tags">
                  {project.tags.map((tag) => (
                    <span key={tag} className="project-card__tag">{tag}</span>
                  ))}
                </div>
                {project.link && (
                  <a className="project-card__link" href={project.link} target="_blank" rel="noreferrer">
                    <span>View project</span>
                    <b aria-hidden="true">↗</b>
                  </a>
                )}
              </div>
            </article>
          ))}

          <div className="project-card project-card--end" aria-hidden="true">
            <h3 className="project-card--end__title">Want to see more?</h3>
            <a className="project-card--end__link" href="mailto:mariam8tarek@gmail.com">
              <span>Get in touch</span>
              <b>↗</b>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}