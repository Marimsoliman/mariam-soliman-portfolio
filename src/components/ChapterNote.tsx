//sec/components/ChapterNote.tsx
"use client";

import { useReg } from "@/lib/registry";

interface ChapterNoteProps {
  regId: string;
  number: string;
  title: string;
  name?: string;
  role?: string;
  body?: readonly string[];
  action?: string;
  onAction?: () => void;
  connectorId?: string;
  className?: string;
}

export function ChapterNote({
  regId,
  number,
  title,
  name,
  role,
  body,
  action,
  onAction,
  connectorId,
  className,
}: ChapterNoteProps) {
  const reg = useReg(regId);
  const regConn = connectorId ? useReg(connectorId) : null;

  return (
    <div
      id={regId === "el-about" ? "about" : undefined}
      ref={reg}
      data-el={regId}
      className={`note${className ? ` ${className}` : ""}`}
    >
      <div className="note__head">
        <span className="note__num">{number}</span>
        <span className="note__title">{title}</span>
      </div>
      {name && <h3 className="note__name">{name}</h3>}
      {role && <p className="note__role">{role}</p>}
      {body && (
        <p className="note__body">
          {body.map((line, i) => (
            <span key={i} className="note__body-line">
              {line}
            </span>
          ))}
        </p>
      )}
      {action && onAction && (
        <button type="button" className="note__action link-arrow link-arrow--accent" onClick={onAction}>
          {action}
          <span className="link-arrow__glyph">→</span>
        </button>
      )}
      {connectorId && (
        <span ref={regConn} data-el={connectorId} className="note__connector" aria-hidden="true" />
      )}
    </div>
  );
}
