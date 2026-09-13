"use client";

import React, { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface JourneyMilestone { id: string; number: string; icon: string; title: string; description: string; year: string; metadata: string; }

const milestones: JourneyMilestone[] = [
  { id: "01", number: "01", icon: "🎯", title: "Who I Am", description: "I'm Mariam Tarek, a Computer Science graduate passionate about creating meaningful digital experiences through clean code and thoughtful design.", year: "2019", metadata: "The Beginning" },
  { id: "02", number: "02", icon: "💡", title: "My Approach", description: "I believe in combining technical excellence with creative problem-solving. Every project is an opportunity to push boundaries and learn something new.", year: "2020", metadata: "Foundation" },
  { id: "03", number: "03", icon: "🚀", title: "What I Do", description: "Full-stack development with a focus on React, Node.js, and modern web technologies. I specialize in building interactive, performant applications.", year: "2021", metadata: "Growth" },
  { id: "04", number: "04", icon: "✨", title: "My Philosophy", description: "Code is a craft. Design is a language. Together, they create experiences that matter. I strive for simplicity, elegance, and impact in everything I build.", year: "2022", metadata: "Refinement" },
  { id: "05", number: "05", icon: "🎨", title: "Creative Development", description: "Merging animation, interaction design, and cutting-edge web technologies to create memorable digital experiences that engage and inspire.", year: "2023", metadata: "Innovation" },
  { id: "06", number: "06", icon: "🌟", title: "Looking Forward", description: "Continuously exploring new technologies and methodologies. Excited about WebGL, AI integration, and the future of interactive web experiences.", year: "2024", metadata: "Present & Beyond" },
];

const JourneyArrow = () => (
  <svg className="simple-arrow" viewBox="0 0 100 48" aria-hidden="true">
    <path d="M 50 2 L 50 38 M 44 32 L 50 38 L 56 32" fill="none" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const MilestoneCard = ({ milestone, index, isLast }: { milestone: JourneyMilestone; index: number; isLast: boolean }) => (
  <article className="milestone-item" data-journey-step={index}>
    <div className="milestone-card">
      <div className="milestone-card-header"><div className="milestone-number">{milestone.number}</div><div className="milestone-icon">{milestone.icon}</div></div>
      <div className="milestone-content">
        <h3 className="milestone-title">{milestone.title}</h3>
        <p className="milestone-description">{milestone.description}</p>
        <div className="milestone-meta"><span className="milestone-year-badge">{milestone.year}</span><span className="milestone-metadata">{milestone.metadata}</span></div>
      </div>
    </div>
    {!isLast && <div className="milestone-arrow-wrapper"><JourneyArrow /></div>}
  </article>
);

export const MyJourney: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const context = gsap.context(() => {
      const steps = gsap.utils.toArray<HTMLElement>(".milestone-item");
      steps.forEach((step, index) => {
        const card = step.querySelector<HTMLElement>(".milestone-card");
        const arrow = step.querySelector<HTMLElement>(".milestone-arrow-wrapper");
        if (!card) return;
        if (index === 0) { gsap.set(card, { autoAlpha: 1, y: 0, scale: 1 }); if (arrow) gsap.set(arrow, { autoAlpha: 1, y: 0 }); return; }
        gsap.set(card, { autoAlpha: 0, y: 80, scale: 0.96 });
        if (arrow) gsap.set(arrow, { autoAlpha: 0, y: -12 });
        const previous = steps[index - 1];
        const previousCard = previous.querySelector<HTMLElement>(".milestone-card");
        const previousArrow = previous.querySelector<HTMLElement>(".milestone-arrow-wrapper");
        const timeline = gsap.timeline({ scrollTrigger: { trigger: step, start: "top 72%", end: "top 36%", scrub: 0.7, invalidateOnRefresh: true } });
        if (previousArrow) timeline.to(previousArrow, { autoAlpha: 1, y: 12, duration: 0.3, ease: "power1.out" }, 0);
        if (previousCard) timeline.to(previousCard, { autoAlpha: 0.3, y: -20, scale: 0.96, duration: 0.55, ease: "power2.out" }, 0);
        timeline.to(card, { autoAlpha: 1, y: 0, scale: 1, duration: 0.65, ease: "power2.out" }, 0.25);
      });
    }, section);
    return () => context.revert();
  }, []);

  return <section className="my-journey-section" ref={sectionRef}>
    <header className="journey-header"><div className="journey-header-content"><h2 className="journey-title">About Me</h2><p className="journey-intro">Full Stack Developer passionate about creating meaningful digital experiences.</p></div></header>
    <div className="journey-timeline-container"><div className="journey-cards-wrapper">{milestones.map((milestone, index) => <MilestoneCard key={milestone.id} milestone={milestone} index={index} isLast={index === milestones.length - 1} />)}</div></div>
  </section>;
};
