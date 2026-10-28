import { Notepad } from "@/components/notes/notepad";
import { notes } from "@/data/notes";

export default function NotesPage() {
  return <Notepad initialNotes={notes} />;
}
