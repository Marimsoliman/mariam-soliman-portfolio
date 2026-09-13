// lib/journeyData.ts
export interface JourneyMilestone {
  id: string;
  year: string;
  title: string;
  description: string;
  avatar?: string;
  handle?: string;
  metadata: string;
  link?: string;
}

export const journeyMilestones: JourneyMilestone[] = [
  {
    id: "2019",
    year: "'19",
    title: "The Spark",
    description: "Discovered the intersection of design and code while building my first interactive website. Fell in love with the creative possibilities.",
    handle: "@mariam",
    metadata: "5 years ago",
    link: "#"
  },
  {
    id: "2020",
    year: "'20",
    title: "Deep Dive into React",
    description: "Committed to mastering modern web development. Built multiple projects exploring component architecture and state management.",
    handle: "@mariam",
    metadata: "4 years ago",
    link: "#"
  },
  {
    id: "2021",
    year: "'21",
    title: "Animation & Motion",
    description: "Discovered GSAP and scroll-driven animations. Started creating immersive web experiences that blur the line between design and development.",
    handle: "@mariam",
    metadata: "3 years ago",
    link: "#"
  },
  {
    id: "2022",
    year: "'22",
    title: "First Major Project",
    description: "Led development of a large-scale interactive platform. Learned to balance creative vision with production constraints.",
    handle: "@mariam",
    metadata: "2 years ago",
    link: "#"
  },
  {
    id: "2023",
    year: "'23",
    title: "Creative Development Focus",
    description: "Specialized in high-end interactive experiences. Collaborated with design studios on award-winning digital products.",
    handle: "@mariam",
    metadata: "1 year ago",
    link: "#"
  },
  {
    id: "2024",
    year: "'24",
    title: "Present & Beyond",
    description: "Continuing to push boundaries in creative web development. Exploring new technologies while maintaining focus on craft and storytelling.",
    handle: "@mariam",
    metadata: "Now",
    link: "#"
  }
];