//sec/components/DomOverlay.tsx
"use client";

import { about, scrollWorld } from "@/lib/content";
import { EL } from "@/lib/choreo";
import { scrollToChapter } from "@/lib/scroll";
import { HeroContent } from "./HeroContent";
import { ChapterNote } from "./ChapterNote";
import { WorkStage } from "./WorkStage";
import { ExperimentsStage } from "./ExperimentsStage";
import { ContactStage } from "./ContactStage";
import { ScrollWorldContent } from "./ScrollWorldContent";

export function DomOverlay() {
  return (
    <div className="overlay">
      <HeroContent />
      <ChapterNote
        regId={EL.about}
        number={about.number}
        title={about.title}
        name={about.name}
        role={about.role}
        body={about.body}
        action={about.action}
        onAction={() => scrollToChapter("scrollWorldOrigin")}
        connectorId={EL.aboutConnector}
      />
      <ScrollWorldContent />
      <WorkStage />
      <ExperimentsStage />
      <ContactStage />
    </div>
  );
}
