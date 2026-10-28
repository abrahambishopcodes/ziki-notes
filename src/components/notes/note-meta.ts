import { Ban, BookOpen, CircleCheck, TriangleAlert, type LucideIcon } from "lucide-react";
import { NOW, type NoteType } from "@/data/notes";

export const noteTypes: Record<NoteType, { label: string; icon: LucideIcon; text: string }> = {
  do: { label: "Do", icon: CircleCheck, text: "text-success" },
  dont: { label: "Don't", icon: Ban, text: "text-danger" },
  gotcha: { label: "Gotcha", icon: TriangleAlert, text: "text-warning" },
  convention: { label: "Convention", icon: BookOpen, text: "text-brand" },
};

const DAY = 86_400_000;
const dayStart = (t: number) => Math.floor(t / DAY) * DAY;

// Dates are formatted in UTC so the server render matches the client.
const dateFmt = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
const timeFmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });

/** Groups by calendar day; returns a stable key plus the margin labels. */
export function dayOf(iso: string) {
  const start = dayStart(new Date(iso).getTime());
  const diff = Math.round((dayStart(NOW) - start) / DAY);
  const date = dateFmt.format(start);
  const label = diff <= 0 ? "Today" : diff === 1 ? "Yesterday" : date.split(" ")[0];
  return { key: start, label, date: diff > 1 ? date.split(" ").slice(1).join(" ") : date };
}

export const timeOf = (iso: string) => timeFmt.format(new Date(iso));
