"use client";

import { BadgeCheck, Check, CircleX, ThumbsDown, ThumbsUp, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Note, Review } from "@/data/notes";
import { RollingCount } from "./motion";
import { dayOf, noteTypes, timeOf } from "./note-meta";

type Tab = "all" | "up" | "down";

const when = (iso: string) => {
  const d = dayOf(iso);
  return `${d.label === "Today" || d.label === "Yesterday" ? d.label : `${d.label} ${d.date}`}, ${timeOf(iso)}`;
};

export function tally(note: Note) {
  const up = note.votes.filter((v) => v.direction === "up").length;
  return { up, down: note.votes.length - up };
}

export function VotesDialog({
  note,
  stamp,
  onClose,
  onReview,
}: {
  note: Note | null;
  stamp: number;
  onClose: () => void;
  onReview: (id: number, review: Review) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (note && !dialog.open) dialog.showModal();
    if (!note && dialog.open) dialog.close();
  }, [note]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      // A click on the backdrop lands on the dialog element itself
      onClick={(e) => e.target === e.currentTarget && onClose()}
      aria-labelledby="votes-title"
      className="votes-dialog m-auto max-h-[min(760px,calc(100dvh-32px))] w-[min(580px,calc(100vw-32px))] overflow-hidden rounded-2xl bg-surface p-0 text-ink shadow-[0_24px_64px_-16px_rgba(17,19,34,0.35)] backdrop:bg-ink/35"
    >
      {note && <DialogBody key={note.id} note={note} stamp={stamp} onClose={onClose} onReview={onReview} />}
    </dialog>
  );
}

function DialogBody({
  note,
  stamp,
  onClose,
  onReview,
}: {
  note: Note;
  stamp: number;
  onClose: () => void;
  onReview: (id: number, review: Review) => void;
}) {
  const [tab, setTab] = useState<Tab>("all");
  const kind = noteTypes[note.type];
  const KindIcon = kind.icon;
  const { up, down } = tally(note);
  const total = up + down;
  const shown = [...note.votes].reverse().filter((v) => tab === "all" || v.direction === tab);
  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "all", label: "All votes", count: total },
    { id: "up", label: "Upvotes", count: up },
    { id: "down", label: "Downvotes", count: down },
  ];

  return (
    <div className="flex max-h-[inherit] flex-col">
      <header className="border-b border-line px-5 pt-5 pb-4 sm:px-6">
        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1">
            <p className={`flex items-center gap-1.5 text-[13px] font-semibold ${kind.text}`}>
              <KindIcon className="size-3.5" strokeWidth={2.2} aria-hidden />
              {kind.label}
            </p>
            <h2 id="votes-title" className="mt-1.5 text-[17px] leading-snug font-semibold text-balance text-ink">
              <span className={`strike ${note.review === "rejected" ? "is-struck" : ""}`}>{note.title}</span>
            </h2>
            <p className="mt-1.5 text-[12.5px] text-muted">
              Logged by <span className="font-medium text-ink-2">{note.author.name}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mt-1 -mr-2 grid size-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-chip hover:text-ink"
          >
            <X className="size-4" />
          </button>
        </div>

        {total > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-[13px]">
              <span className={`flex items-center gap-1.5 font-medium ${up ? "text-success" : "text-subtle"}`}>
                <ThumbsUp className="size-3.5" aria-hidden />
                <RollingCount value={up} /> up
              </span>
              <span className={`flex items-center gap-1.5 font-medium ${down ? "text-danger" : "text-subtle"}`}>
                <RollingCount value={down} /> down
                <ThumbsDown className="size-3.5" aria-hidden />
              </span>
            </div>
            <div className="mt-2 flex h-1.5 gap-0.5 overflow-hidden rounded-full" aria-hidden>
              {/* Each side grows out from where the two meet */}
              {up > 0 && <span className="bar-grow origin-right rounded-full bg-success transition-[flex-grow] duration-500" style={{ flexGrow: up }} />}
              {down > 0 && <span className="bar-grow origin-left rounded-full bg-danger transition-[flex-grow] duration-500" style={{ flexGrow: down }} />}
            </div>
          </div>
        )}
      </header>

      {total > 0 ? (
        <>
          <div className="px-5 pt-4 sm:px-6">
            <div role="tablist" aria-label="Filter votes" className="flex w-max items-center gap-1 rounded-xl bg-chip p-1">
              {tabs.map((t) => {
                const on = tab === t.id;
                return (
                  <button
                    key={t.id}
                    role="tab"
                    aria-selected={on}
                    onClick={() => setTab(t.id)}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium ${
                      on ? "bg-surface text-ink shadow-[0_1px_2px_rgba(17,19,34,0.08)]" : "text-muted hover:text-ink-2"
                    }`}
                  >
                    {t.label}
                    <span className="font-mono text-[11px] text-muted">{t.count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <ul className="min-h-0 flex-1 divide-y divide-line overflow-y-auto overscroll-contain px-5 py-2 sm:px-6">
            {shown.map((vote, i) => {
              const isUp = vote.direction === "up";
              const Icon = isUp ? ThumbsUp : ThumbsDown;
              return (
                <li
                  key={`${tab}-${vote.voter.name}`}
                  className="vote-in flex gap-3 py-3.5"
                  style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}
                >
                  <span
                    className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-full ${
                      isUp ? "bg-success-soft text-success" : "bg-danger-soft text-danger"
                    }`}
                    aria-label={isUp ? "Upvote" : "Downvote"}
                  >
                    <Icon className="size-3.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-baseline gap-x-2 text-[12.5px] text-muted">
                      <span className="text-[13px] font-semibold text-ink">{vote.voter.name}</span>
                      <span aria-hidden className="text-subtle">·</span>
                      <time dateTime={vote.createdAt}>{when(vote.createdAt)}</time>
                    </p>
                    <p className="mt-1 text-[14px] leading-[1.6] text-pretty text-ink-2">{vote.reason}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <p className="px-6 py-10 text-center text-[14px] text-muted">No agent has voted on this note yet.</p>
      )}

      <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-line bg-page/60 px-5 py-3.5 sm:px-6">
        {note.review === "pending" ? (
          <>
            <span className="mr-auto hidden text-[12.5px] text-muted sm:inline">You own this project</span>
            <button
              type="button"
              onClick={() => onReview(note.id, "rejected")}
              className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3.5 py-2 text-[13px] font-semibold text-danger hover:bg-danger-soft"
            >
              <X className="size-3.5" aria-hidden />
              Reject note
            </button>
            <button
              type="button"
              onClick={() => onReview(note.id, "approved")}
              className="flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-brand-hover"
            >
              <Check className="size-3.5" aria-hidden />
              Approve note
            </button>
          </>
        ) : (
          <>
            <span
              key={stamp}
              className={`relative mr-auto flex items-center gap-1.5 text-[13px] font-semibold ${
                note.review === "approved" ? "text-success" : "text-danger"
              } ${note.review === "approved" && stamp ? "stamp" : ""}`}
            >
              {note.review === "approved" ? <BadgeCheck className="size-4" aria-hidden /> : <CircleX className="size-4" aria-hidden />}
              {note.review === "approved" ? "Approved by you" : "Rejected by you"}
            </span>
            <button
              type="button"
              onClick={() => onReview(note.id, "pending")}
              className="rounded-lg border border-line bg-surface px-3.5 py-2 text-[13px] font-semibold text-ink-2 hover:bg-chip"
            >
              Undo
            </button>
          </>
        )}
      </footer>
    </div>
  );
}
