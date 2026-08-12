"use client";

import { contact, identity } from "@/lib/content";
import { useReg } from "@/lib/registry";
import { EL } from "@/lib/choreo";

export function ContactStage() {
  const regContact = useReg(EL.contact);
  const regLinks = useReg(EL.contactLinks);

  return (
    <section id="contact" className="contact">
      <div ref={regContact} data-el={EL.contact} className="contact__main">
        <p className="contact__eyebrow">
          <span className="contact__num">{contact.number}</span>
          Contact
        </p>
        <h2 className="contact__heading">{contact.title}</h2>
        <p className="contact__line">{contact.line}</p>
      </div>

      <div ref={regLinks} data-el={EL.contactLinks} className="contact__links">
        <a className="contact__mail link-arrow" href={`mailto:${identity.email}`}>
          {identity.email}
          <span className="link-arrow__glyph">↗</span>
        </a>
        <div className="contact__socials">
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
    </section>
  );
}
