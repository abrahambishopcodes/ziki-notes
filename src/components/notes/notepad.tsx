"use client";

import { ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { currentUser, liveVotes, NOW, type Author, type Note, type NoteType, type Review } from "@/data/notes";
import { Composer, type Draft } from "./composer";
import { crumple, flyToHeader } from "./choreography";
import { reducedMotion, RollingCount } from "./motion";
import { NoteEntry } from "./note-entry";
import { dayOf } from "./note-meta";
import { VotesDialog } from "./votes-dialog";

const PROJECT = "Zedu";

/** Splits a typed note into its lead sentence and the rest. */
function splitNote(text: string) {
  const [first, ...rest] = text.split("\n");
  const lead = first.match(/^(.+?[.!?])\s+(.+)$/);
  if (lead) return { title: lead[1], body: [lead[2], ...rest].join(" ").trim() };
  return { title: first, body: rest.join(" ").trim() };
}

function Margin({ label, date }: { label: string; date: string }) {
  return (
    <div className="sm:sticky sm:top-[92px] sm:self-start sm:text-right">
      <p className="text-[13px] font-semibold text-ink">{label}</p>
      <p className="mt-0.5 text-[12px] text-muted">{date}</p>
    </div>
  );
}

export function Notepad({ initialNotes }: { initialNotes: Note[] }) {
  const [notes, setNotes] = useState(initialNotes);
  const [freshId, setFreshId] = useState<number | null>(null);
  const [votesFor, setVotesFor] = useState<number | null>(null);
  // The latest owner decision, so only that note's stamp animates
  const [stamped, setStamped] = useState<{ id: number; n: number } | null>(null);
  // Approvals still flying to the header, not yet counted there
  const [inFlight, setInFlight] = useState(0);
  const approvedCount = useRef<HTMLSpanElement>(null);

  // The agent mid-vote, shown on the note before their vote lands
  const [voting, setVoting] = useState<{ noteId: number; voter: Author } | null>(null);
  const notesRef = useRef(notes);
  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  // Mock feed: agents keep voting on pending notes while the page is open
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const open = notesRef.current.flatMap((n) => {
        if (n.review !== "pending") return [];
        const voted = new Set([n.author.name, ...n.votes.map((v) => v.voter.name)]);
        return liveVotes.filter((v) => !voted.has(v.voter.name)).map((v) => ({ id: n.id, v }));
      });
      if (open.length === 0) return;
      const { id, v } = open[Math.floor(Math.random() * open.length)];
      setVoting({ noteId: id, voter: v.voter });
      timer = setTimeout(() => {
        const vote = { ...v, createdAt: new Date(Math.max(Date.now(), NOW)).toISOString() };
        setNotes((ns) => ns.map((n) => (n.id === id ? { ...n, votes: [...n.votes, vote] } : n)));
        setVoting(null);
        timer = setTimeout(tick, 6000 + Math.random() * 6000);
      }, 2400);
    };
    timer = setTimeout(tick, 3000);
    return () => clearTimeout(timer);
  }, []);

  const days = useMemo(() => {
    const sorted = [...notes].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const groups = new Map<number, { label: string; date: string; notes: Note[] }>();
    for (const note of sorted) {
      const d = dayOf(note.createdAt);
      if (!groups.has(d.key)) groups.set(d.key, { label: d.label, date: d.date, notes: [] });
      groups.get(d.key)!.notes.push(note);
    }
    return [...groups.values()];
  }, [notes]);

  const writers = new Set(notes.map((n) => n.author.name)).size;
  const today = dayOf(new Date(NOW).toISOString());
  const hasToday = days[0]?.label === "Today";
  const [first, ...earlier] = hasToday ? days : [{ ...today, notes: [] as Note[] }, ...days];

  const add = (text: string, type: NoteType, draft: Draft) => {
    const id = Math.max(0, ...notes.map((n) => n.id)) + 1;
    const note: Note = {
      id,
      ...splitNote(text),
      type,
      platforms: [],
      roles: [],
      tags: [],
      linkedIssues: [],
      linkedPrs: [],
      author: currentUser,
      votes: [],
      review: "pending",
      createdAt: new Date(Math.max(Date.now(), NOW)).toISOString(),
    };
    const commit = () => {
      draft.reset();
      setNotes((ns) => [note, ...ns]);
      setFreshId(id);
    };
    if (!document.startViewTransition || reducedMotion()) return commit();

    // The draft and the new note share a transition name, so the text you
    // typed moves down onto the pad while the notes below make room.
    draft.source.style.viewTransitionName = `note-${id}`;
    document.startViewTransition(() => {
      draft.source.style.viewTransitionName = "";
      flushSync(commit);
    });
  };

  const review = (id: number, value: Review) => {
    setNotes((ns) => ns.map((n) => (n.id === id ? { ...n, review: value } : n)));
    if (value === "approved") setStamped((s) => ({ id, n: (s?.n ?? 0) + 1 }));
    if (reducedMotion()) return;

    const el = document.getElementById(`note-${id}`);
    if (value === "rejected" && el) crumple(el);
    const title = el?.querySelector<HTMLElement>("[data-note-title]");
    if (value === "approved" && title && approvedCount.current) {
      const target = approvedCount.current;
      setInFlight((n) => n + 1);
      // Let the stamp land before the note takes off
      setTimeout(() => flyToHeader(title, target, () => setInFlight((n) => n - 1)), 380);
    }
  };

  // Decisions made in the votes popup play out on the pad, so close it first
  const reviewFromDialog = (id: number, value: Review) => {
    if (value === "pending") return review(id, value);
    setVotesFor(null);
    setTimeout(() => review(id, value), 220);
  };

  const approved = notes.filter((n) => n.review === "approved").length - inFlight;
  const stampFor = (id: number) => (stamped?.id === id ? stamped.n : 0);

  return (
    <section className="rounded-2xl bg-surface">
      <header className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-line px-4 py-4 md:px-6">
        <nav className="flex items-center gap-2 text-[15px]" aria-label="Breadcrumb">
          <a href="#" className="text-muted hover:text-ink">{PROJECT}</a>
          <ChevronRight className="size-3.5 self-center text-subtle" aria-hidden />
          <h1 className="font-semibold text-ink">Notes</h1>
        </nav>
        <p className="text-[13px] text-muted sm:ml-auto">
          <span className="font-mono text-[12px] text-ink-2">{notes.length}</span> notes from{" "}
          <span className="font-mono text-[12px] text-ink-2">{writers}</span> writers ·{" "}
          <span ref={approvedCount} className="inline-block rounded-md px-1 text-ink-2">
            <span className="font-mono text-[12px]">
              <RollingCount value={approved} />
            </span>{" "}
            approved
          </span>{" "}
          for every agent on {PROJECT}
        </p>
      </header>

      <div className="mx-auto max-w-[880px] px-4 pb-10 md:px-6">
        {[first, ...earlier].map((day, i) => (
          <div
            key={day.label + day.date}
            className={`grid gap-x-10 gap-y-5 py-8 sm:grid-cols-[112px_1fr] ${i > 0 ? "border-t border-line" : ""}`}
          >
            <Margin label={day.label} date={day.date} />
            {/* Left padding is the gutter the kind marks hang in */}
            <div className="max-w-[68ch] space-y-6 border-line pl-7 sm:border-l sm:pl-10">
              {i === 0 && <Composer project={PROJECT} onAdd={add} />}
              {day.notes.map((note) => (
                <NoteEntry
                  key={note.id}
                  note={note}
                  fresh={note.id === freshId}
                  stamp={stampFor(note.id)}
                  voter={voting?.noteId === note.id ? voting.voter : undefined}
                  onOpenVotes={() => setVotesFor(note.id)}
                  onReview={(value) => review(note.id, value)}
                />
              ))}
              {i === 0 && day.notes.length === 0 && (
                <p className="text-[14px] text-muted">
                  Nothing written today yet. Agents add notes here when they spot something worth remembering.
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <VotesDialog
        note={notes.find((n) => n.id === votesFor) ?? null}
        stamp={votesFor === null ? 0 : stampFor(votesFor)}
        onClose={() => setVotesFor(null)}
        onReview={reviewFromDialog}
      />
    </section>
  );
}
