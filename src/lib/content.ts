// Single source of truth for all landing-page copy and data.

export const identity = {
  name: "Mariam Soliman",
  firstName: "Mariam",
  lastName: "Soliman",
  role: "Creative Developer",
  location: "Cairo, Egypt",
  email: "mariamsoliman.dev@gmail.com",
  linkedin: "https://www.linkedin.com/in/mariam-tarek-728184320/",
  whatsapp: "https://wa.me/201273661884",
  facebook:
    "https://www.facebook.com/profile.php?id=61584263046994&locale=ar_AR",
} as const;

export const hero = {
  number: "01",
  eyebrow: "Creative Developer — Cairo, Egypt",
  nameLineA: "Mariam",
  nameLineB: "Soliman",
  roles: ["Visual Design", "Creative Development", "Interactive Experiences"],
  statement:
    "I craft identities, interfaces and interactive experiences at the intersection of design and code.",
  ctaWork: "View Work",
  ctaAbout: "About Me",
} as const;

export const about = {
  number: "02",
  title: "About",
  name: "Mariam Soliman",
  role: "Creative Developer",
  body: [
    "A creative developer working where design meets code —",
    "crafting identities, interfaces and interactive experiences",
    "with an editorial eye and engineering rigor.",
  ],
  action: "View Work",
  capabilities: [
    {
      title: "Frontend Engineering",
      desc: "Performant, accessible interfaces with React, Next.js and TypeScript.",
    },
    {
      title: "Creative Development",
      desc: "Motion, 3D and interactive experiences with GSAP, Three.js and WebGL.",
    },
    {
      title: "Full-Stack Systems",
      desc: "End-to-end architecture with Node.js, databases and APIs.",
    },
    {
      title: "UI / UX Design",
      desc: "User-centered design thinking applied to every interface.",
    },
  ],
} as const;

export interface Project {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  technologies: string[];
  image: string;
  demoUrl: string;
  year: string;
}

export const projects: Project[] = [
  {
    slug: "nova-wear",
    title: "Nova Wear",
    subtitle: "Streetwear E-Commerce",
    description:
      "Modern streetwear e-commerce website featuring premium collections, shopping cart functionality, product filtering, and a stylish responsive design.",
    technologies: ["React", "Node.js", "MongoDB"],
    image: "/images/projects/nova-wear.png",
    demoUrl: "https://nnovawear.netlify.app/",
    year: "2024",
  },
  {
    slug: "mindcare",
    title: "MindCare",
    subtitle: "Mental Health Clinic",
    description:
      "A professional mental health clinic website with online appointment booking, service details, client testimonials, and secure consultation scheduling.",
    technologies: ["React", "CSS", "EmailJS"],
    image: "/images/projects/mindcare.png",
    demoUrl: "https://mindcareclinicc.netlify.app/",
    year: "2024",
  },
  {
    slug: "prodvisors",
    title: "Prodvisors",
    subtitle: "Construction & Advisory",
    description:
      "Corporate website for Professional Advisors Company, showcasing construction and advisory services including residential, governmental, prefabricated buildings, and renovation projects.",
    technologies: ["React", "Tailwind CSS", "EmailJS"],
    image: "/images/projects/prodvisors.png",
    demoUrl: "https://advisorscompany.netlify.app/",
    year: "2024",
  },
  {
    slug: "lutrova-cafe",
    title: "Lutrova Cafe",
    subtitle: "Online Coffee Shop",
    description:
      "A modern online coffee shop website designed for Lutrova Cafe at the University of Okara. Includes menu display, product listings, shopping cart, customer reviews, blog section, and contact form.",
    technologies: ["HTML", "CSS", "JavaScript"],
    image: "/images/projects/lutrova-cafe.png",
    demoUrl: "https://coffeeshoopp.netlify.app/",
    year: "2024",
  },
] as const;

export const work = {
  number: "03",
  eyebrow: "Selected Work",
} as const;

export const experiments = {
  number: "04",
  title: "Experiments",
  lines: ["Image", "Type", "Form", "Motion"],
  note: "Selected experiments in image, type, form and motion.",
} as const;

export const scrollWorld = {
  number: "SW",
  eyebrow: "Scroll World",
  scenes: [
    {
      id: "origin",
      title: "Digital Origin",
      body: "Where it all begins — a single pulse of code, alive in the void.",
    },
    {
      id: "building",
      title: "Architecture",
      body: "Structures rise, iterated. Logic made visible, standing in light.",
    },
    {
      id: "interface",
      title: "Interface",
      body: "Planes of thought. Information finds its shape, its rhythm.",
    },
    {
      id: "experiments",
      title: "Digital Experiments",
      body: "Particles drift — trials, errors, breakthroughs. The chaos that teaches.",
    },
    {
      id: "identity",
      title: "Identity",
      body: "The mark remains. Mariam Soliman — built from every line before it.",
    },
  ],
} as const;

export const contact = {
  number: "05",
  title: "Let's Talk",
  line: "Available for selected creative collaborations.",
  cta: "Start a Conversation",
} as const;

export const navItems = [
  { id: "about", label: "About", index: "01" },
  { id: "work", label: "Work", index: "02" },
  { id: "experiments", label: "Experiments", index: "03" },
  { id: "contact", label: "Contact", index: "04" },
] as const;
