"use client";

import { PenLine } from "lucide-react";
import { useRef, useState } from "react";
import type { NoteType } from "@/data/notes";
import { reducedMotion } from "./motion";
import { noteTypes } from "./note-meta";

const kinds = Object.keys(noteTypes) as NoteType[];

// Where the pen rests in the margin, relative to the writing line
const PEN_REST = "translate(-28px, 5px)";

export type Draft = {
  /** The textarea, so the page can morph its text into the new note. */
  source: HTMLTextAreaElement;
  /** Clears the writing line; called once the new note is on the pad. */
  reset: () => void;
};

export function Composer({
  project,
  onAdd,
}: {
  project: string;
  onAdd: (text: string, type: NoteType, draft: Draft) => void;
}) {
  const [text, setText] = useState("");
  const [type, setType] = useState<NoteType>("do");
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  const pen = useRef<HTMLSpanElement>(null);
  const mirror = useRef<HTMLDivElement>(null);
  const open = focused || text.length > 0;
  const canAdd = text.trim().length > 0;

  /** Moves the pen to the caret, measured from a hidden copy of the text. */
  const followCaret = (wiggle: boolean) => {
    requestAnimationFrame(() => {
      const area = ref.current;
      const icon = pen.current;
      const box = mirror.current;
      if (!area || !icon || !box) return;
      if (!area.value || document.activeElement !== area) {
        icon.style.transform = PEN_REST;
        return;
      }
      box.firstElementChild!.textContent = area.value.slice(0, area.selectionEnd);
      const marker = box.lastElementChild as HTMLElement;
      const x = marker.offsetLeft + 2;
      const y = marker.offsetTop - area.scrollTop + 3;
      icon.style.transform = `translate(${x}px, ${y}px)`;
      if (wiggle && !reducedMotion()) {
        icon.firstElementChild?.animate(
          [{ rotate: "0deg" }, { rotate: "-14deg" }, { rotate: "6deg" }, { rotate: "0deg" }],
          { duration: 260, easing: "ease-out" },
        );
      }
    });
  };

  const stampKind = (el: HTMLElement) => {
    if (reducedMotion()) return;
    el.querySelector("svg")?.animate(
      [
        { transform: "scale(1.7) rotate(-14deg)", opacity: 0.4 },
        { transform: "scale(0.86) rotate(3deg)", opacity: 1, offset: 0.55 },
        { transform: "scale(1) rotate(0)" },
      ],
      { duration: 340, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
    );
  };

  const submit = () => {
    if (!canAdd || !ref.current) return;
    const area = ref.current;
    onAdd(text.trim(), type, {
      source: area,
      reset: () => {
        setText("");
        area.style.height = "";
        if (pen.current) pen.current.style.transform = PEN_REST;
      },
    });
    area.focus();
  };

  return (
    <div
      className="relative"
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (e.currentTarget.contains(e.relatedTarget)) return;
        setFocused(false);
        followCaret(false);
      }}
    >
      <span
        ref={pen}
        aria-hidden
        className={`pointer-events-none absolute top-0 left-0 z-10 transition-[transform,color] duration-150 ease-out ${
          open ? "text-brand" : "text-subtle"
        }`}
        style={{ transform: PEN_REST }}
      >
        {/* Rotates around the nib, at the icon's bottom left */}
        <span className="block origin-[1px_15px]">
          <PenLine className="size-4" />
        </span>
      </span>

      {/* Hidden copy of the text, used to find where the caret is */}
      <div
        ref={mirror}
        aria-hidden
        className="pointer-events-none invisible absolute inset-x-0 top-0 text-[15px] leading-[1.65] break-words whitespace-pre-wrap"
      >
        <span />
        <span>{"​"}</span>
      </div>

      <label htmlFor="new-note" className="sr-only">New note</label>
      <textarea
        id="new-note"
        ref={ref}
        rows={1}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          // Grow with the text where field-sizing isn't supported
          e.target.style.height = "auto";
          e.target.style.height = `${e.target.scrollHeight}px`;
          followCaret(true);
        }}
        onSelect={() => followCaret(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            submit();
          }
          if (e.key === "Escape") e.currentTarget.blur();
        }}
        placeholder={`Jot a note for every agent on ${project}…`}
        className="block max-h-64 min-h-[26px] w-full resize-none bg-transparent text-[15px] leading-[1.65] text-ink outline-none placeholder:text-subtle focus-visible:outline-none"
      />

      <div className={`composer-rule mt-2 h-px ${open ? "bg-brand" : "bg-line"}`} />

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden" inert={!open}>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3 pt-3">
            <div role="radiogroup" aria-label="Kind of note" className="flex flex-wrap items-center gap-1">
              {kinds.map((k) => {
                const { label, icon: Icon, text: color } = noteTypes[k];
                const on = type === k;
                return (
                  <button
                    key={k}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={(e) => {
                      if (!on) stampKind(e.currentTarget);
                      setType(k);
                    }}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-colors ${
                      on ? "bg-chip text-ink" : "text-muted hover:bg-chip/60 hover:text-ink-2"
                    }`}
                  >
                    <Icon className={`size-3.5 ${on ? color : ""}`} aria-hidden />
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="ml-auto flex items-center gap-3">
              <span className="hidden text-[12px] text-subtle sm:inline">
                <kbd className="font-sans">Ctrl</kbd> + <kbd className="font-sans">Enter</kbd>
              </span>
              <button
                type="button"
                onClick={submit}
                disabled={!canAdd}
                className="rounded-lg bg-brand px-3.5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-brand-hover disabled:bg-chip disabled:text-subtle"
              >
                Add to notes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
