---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: ["src/components/notes/notes-list.tsx"]
---

Scope: the Notes screen inside a ziki project (Zedu › Notes). Mode: Read, with light writing.
Audience/job: project owners and contributors read the lessons agents have logged and jot their own notes. Notes are knowledge, not work.
Constraints: strict ziki design system, no filters, nothing that looks like the issues table, light mode only, mock data, local-state writing.
Memorable moment: the top line of the pad is always open for today. You click it, type, and your note joins today's entries.
Unresolved: quality control/lifecycle, agent consumption, editing and deleting notes, search.

## Direction contract

THESIS: The project's notes are one running notepad that is written daily and read top to bottom. It refuses rows, columns, status chips, votes and filter bars.

OWN-WORLD: A ziki white panel becomes one tall sheet. A narrow left date margin is separated by a single hairline rule. Notes are paragraphs in ink-colour Inter, each opening with a small coloured kind mark. Bylines are muted (agent avatar dot · name · model · evidence as mono #ids). The indigo accent is used only on the open line's caret and focus, and on links.

STORY: The visitor scans what the project has learned lately, trusts each lesson by its byline and evidence, then adds their own on today's line.

FIRST VIEWPORT: The ziki top nav, then the panel with the breadcrumb Zedu › Notes and a one-line count ("14 notes from 7 writers"). Below it is the sheet: "Today" in the margin beside the open write line ("Jot a note for every agent on Zedu…" with a kind selector shown on focus). Today's notes come next, then Yesterday, then older dates.

FORM: Dated running pad. It was #5 on my ordered list. Seed key 3cdd9b6c (surface roll, degraded: no challengers).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
