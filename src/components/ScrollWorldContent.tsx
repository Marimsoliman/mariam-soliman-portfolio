//src/components/scrollworldcontent.tsx
"use client";

import { scrollWorld } from "@/lib/content";
import { EL } from "@/lib/choreo";
import { useReg } from "@/lib/registry";

export function ScrollWorldContent() {
  return (
    <>
      {scrollWorld.scenes.map((scene) => (
        <ScrollWorldNote key={scene.id} scene={scene} />
      ))}
    </>
  );
}

type ScrollWorldScene = (typeof scrollWorld.scenes)[number];

interface ScrollWorldNoteProps {
  scene: ScrollWorldScene;
}

function ScrollWorldNote({ scene }: ScrollWorldNoteProps) {
  const elId = `el-sw-${scene.id}` as keyof typeof EL;
  const reg = useReg(EL[elId]);

  return (
    <div
      ref={reg}
      data-el={EL[elId]}
      className="sw-note"
    >
      <div className="sw-note__head">
        <span className="sw-note__num">{scrollWorld.number}</span>
        <span className="sw-note__title">{scene.title}</span>
      </div>
      <p className="sw-note__body">{scene.body}</p>
    </div>
  );
}