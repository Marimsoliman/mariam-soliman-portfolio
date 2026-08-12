"use client";

import { navItems, identity } from "@/lib/content";
import { scrollToChapter } from "@/lib/scroll";

export function SidebarNav({ active }: { active: string }) {
  return (
    <nav className="nav" aria-label="Sections">
      <a
        href="#hero"
        className="nav__brand"
        onClick={(e) => {
          e.preventDefault();
          scrollToChapter("hero");
        }}
      >
        <span className="nav__brand-name">{identity.name}</span>
        <span className="nav__brand-role">{identity.role}</span>
      </a>

      <ul className="nav__links">
        {navItems.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              data-scroll={item.id}
              className={`nav__link${active === item.id ? " is-active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToChapter(item.id);
              }}
            >
              <span className="nav__index">{item.index}</span>
              <span className="nav__label">{item.label}</span>
            </a>
          </li>
        ))}
      </ul>

      <div className="nav__footer">
        <p className="nav__loc">{identity.location}</p>
        <a className="nav__mail" href={`mailto:${identity.email}`}>
          {identity.email}
        </a>
        <div className="nav__socials">
          <a href={identity.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a href={identity.whatsapp} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
          <a href={identity.facebook} target="_blank" rel="noreferrer">
            Facebook
          </a>
        </div>
      </div>
    </nav>
  );
}
