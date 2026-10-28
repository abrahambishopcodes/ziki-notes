"use client";

import { BadgeCheck, Check, ChevronDown, CircleX, ThumbsDown, ThumbsUp, X } from "lucide-react";
import { Fragment, useState } from "react";
import type { Author, Note, Review } from "@/data/notes";
import { OnChange, RollingCount } from "./motion";
import { noteTypes, timeOf } from "./note-meta";
import { tally } from "./votes-dialog";

/** Renders the **bold** and `code` spans used in note text. */
function InlineMarkdown({ text }: { text: string }) {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
    if (part.startsWith("**")) return <strong key={i} className="font-semibold text-ink">{part.slice(2, -2)}</strong>;
    if (part.startsWith("`"))
      return (
        <code key={i} className="rounded-[4px] bg-chip px-1 py-px font-mono whitespace-nowrap text-[0.86em] text-ink">
          {part.slice(1, -1)}
        </code>
      );
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export function NoteEntry({
  note,
  fresh,
  stamp,
  voter,
  onOpenVotes,
  onReview,
}: {
  note: Note;
  fresh?: boolean;
  /** Changes each time the owner approves this note, replaying the stamp. */
  stamp: number;
  /** An agent casting a vote on this note right now. */
  voter?: Author;
  onOpenVotes: () => void;
  onReview: (review: Review) => void;
}) {
  const [open, setOpen] = useState(false);
  const kind = noteTypes[note.type];
  const KindIcon = kind.icon;
  const bodyId = `note-${note.id}-body`;
  const { up, down } = tally(note);
  const rejected = note.review === "rejected";

  return (
    <article
      id={`note-${note.id}`}
      style={{ viewTransitionName: `note-${note.id}` }}
      // A rejected note fades once it has been struck, crumpled and unfolded
      className={`note-paper relative scroll-mt-24 transition-opacity duration-300 ${fresh ? "note-fresh" : ""} ${
        rejected ? "creased opacity-55 delay-[1600ms] motion-reduce:delay-0" : ""
      }`}
    >
      {/* Kind mark hangs in the gutter so the text keeps one clean left edge */}
      <span className={`absolute top-[3px] -left-7 ${kind.text}`} title={kind.label}>
        <KindIcon className="size-4" strokeWidth={2.2} aria-hidden />
      </span>

      <button
        type="button"
        onClick={onOpenVotes}
        className="group block w-full cursor-pointer rounded-sm text-left text-[15px] leading-[1.65] text-pretty"
      >
        <span className={`mr-1.5 font-semibold ${kind.text}`}>{kind.label}.</span>
        <span
          data-note-title
          className={`strike font-medium text-ink decoration-line-strong underline-offset-4 ${
            rejected ? "is-struck" : "group-hover:underline"
          }`}
        >
          <InlineMarkdown text={/[.!?]$/.test(note.title) ? note.title : `${note.title}.`} />
        </span>
      </button>

      {note.body && (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => setOpen((o) => !o)}
          className="-ml-1.5 mt-1 flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[13px] font-medium text-brand transition-colors hover:bg-brand-soft hover:text-brand-hover"
        >
          {open ? "Hide note context" : "Read note context"}
          <ChevronDown
            className={`size-3.5 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>
      )}

      {note.body && (
        <div
          id={bodyId}
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
            open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden" inert={!open}>
            <p className="pt-1.5 text-[14px] leading-[1.65] text-pretty text-ink-2">
              <InlineMarkdown text={note.body} />
            </p>
          </div>
        </div>
      )}

      <footer className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-muted">
        <span
          className="grid size-[18px] shrink-0 place-items-center rounded-full text-[8px] font-semibold text-white"
          style={{ background: note.author.color }}
          aria-hidden
        >
          {note.author.initials}
        </span>
        <span className="font-medium text-ink-2">{note.author.name}</span>
        {note.author.model && <span>{note.author.model}</span>}
        <span aria-hidden className="text-subtle">·</span>
        <time dateTime={note.createdAt} className="tabular-nums">{timeOf(note.createdAt)}</time>
        {note.linkedIssues.length + note.linkedPrs.length > 0 && (
          <>
            <span aria-hidden className="text-subtle">·</span>
            <span className="flex flex-wrap gap-x-2 font-mono text-[12px]">
              {note.linkedIssues.map((n) => (
                <a key={`i${n}`} href="#" className="text-brand underline-offset-2 hover:underline">
                  #{n}
                </a>
              ))}
              {note.linkedPrs.map((n) => (
                <a key={`p${n}`} href="#" className="text-brand underline-offset-2 hover:underline">
                  PR {n}
                </a>
              ))}
            </span>
          </>
        )}
        <span aria-hidden className="text-subtle">·</span>
        <span className="relative">
          <button
            type="button"
            onClick={onOpenVotes}
            aria-label={`${up} upvotes, ${down} downvotes. See why`}
            className="flex items-center gap-2.5 rounded-md px-1.5 py-0.5 tabular-nums hover:bg-chip"
          >
            <span className={`flex items-center gap-1 font-medium transition-colors ${up ? "text-success" : "text-subtle"}`}>
              <OnChange value={up} animation="pop" className="inline-flex">
                <ThumbsUp className="size-3.5" aria-hidden />
              </OnChange>
              <RollingCount value={up} />
            </span>
            <span className={`flex items-center gap-1 font-medium transition-colors ${down ? "text-danger" : "text-subtle"}`}>
              <OnChange value={down} animation="pop" className="inline-flex">
                <ThumbsDown className="size-3.5" aria-hidden />
              </OnChange>
              <RollingCount value={down} />
            </span>
          </button>
          {/* Floats in the gap below the byline so nothing shifts while an agent votes */}
          <span aria-live="polite" className="absolute top-full left-1.5 mt-0.5 whitespace-nowrap">
            {voter && (
              <span className="voting-in flex items-center gap-1 text-[12px] text-ink-2">
                <span className="font-medium">{voter.name}</span> is voting
                <span className="typing-dots" aria-hidden>
                  <span />
                  <span />
                  <span />
                </span>
              </span>
            )}
          </span>
        </span>

        <span className="ml-auto flex items-center gap-1">
          {note.review === "pending" ? (
            <>
              <button
                type="button"
                onClick={() => onReview("approved")}
                className="flex items-center gap-1 rounded-md px-2 py-1 font-medium text-ink-2 hover:bg-success-soft hover:text-success"
              >
                <Check className="size-3.5" aria-hidden />
                Approve
              </button>
              <button
                type="button"
                onClick={() => onReview("rejected")}
                className="flex items-center gap-1 rounded-md px-2 py-1 font-medium text-ink-2 hover:bg-danger-soft hover:text-danger"
              >
                <X className="size-3.5" aria-hidden />
                Reject
              </button>
            </>
          ) : (
            <>
              <span
                key={stamp}
                className={`relative flex items-center gap-1 font-semibold ${
                  note.review === "approved" ? "text-success" : "text-danger"
                } ${note.review === "approved" && stamp ? "stamp" : ""}`}
              >
                {note.review === "approved" ? <BadgeCheck className="size-3.5" aria-hidden /> : <CircleX className="size-3.5" aria-hidden />}
                {note.review === "approved" ? "Approved" : "Rejected"}
              </span>
              <button
                type="button"
                onClick={() => onReview("pending")}
                className="rounded-md px-1.5 py-1 font-medium text-muted hover:bg-chip hover:text-ink"
              >
                Undo
              </button>
            </>
          )}
        </span>
      </footer>

    </article>
  );
}
