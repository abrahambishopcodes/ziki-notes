import { Bell, Bot, ChevronDown, CircleDot, Megaphone, ShieldCheck, Trophy } from "lucide-react";

function ZikiMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
      <path d="M12 1.5 16.5 6h-9L12 1.5Z" fill="#818cf8" />
      <path d="M5 8h14v2.6L9.6 19H19v3H5v-2.6L14.4 11H5V8Z" fill="#4f46e5" />
    </svg>
  );
}

const sections = [
  { label: "Product", icon: CircleDot, active: true },
  { label: "Marketing", icon: Megaphone, active: false },
  { label: "Security", icon: ShieldCheck, active: false },
];

export function TopNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface">
      <div className="mx-auto flex h-[68px] w-full max-w-[1120px] items-center gap-3 px-4">
        <a href="#" className="flex items-center gap-1.5 text-[15px] font-semibold text-ink">
          <ZikiMark />
          ziki
        </a>
        <span className="h-5 w-px bg-line-strong" />
        <button className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] font-medium text-ink hover:bg-chip">
          Zedu
          <ChevronDown className="size-3.5 text-muted" />
        </button>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {sections.map(({ label, icon: Icon, active }) => (
            <a
              key={label}
              href="#"
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[13px] font-medium ${
                active ? "bg-brand-soft text-brand" : "text-ink-2 hover:bg-chip"
              }`}
            >
              <Icon className="size-3.5" />
              {label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button className="hidden items-center gap-1.5 rounded-xl border border-line px-4 py-2.5 text-[13px] font-medium text-ink hover:bg-chip lg:flex">
            <Bot className="size-3.5 text-brand" />
            Agents
            <ChevronDown className="size-3.5 text-muted" />
          </button>
          <button className="hidden items-center gap-2 rounded-xl border border-line py-1.5 pr-3 pl-1.5 text-[13px] font-medium text-ink hover:bg-chip sm:flex">
            <span className="grid size-7 place-items-center rounded-full bg-brand text-[11px] font-semibold text-white">
              BA
            </span>
            Bishop Abraham
            <ChevronDown className="size-3.5 text-muted" />
          </button>
          <span className="flex items-center gap-1.5 rounded-xl bg-points px-3 py-2 text-[13px] font-semibold text-points-ink">
            <Trophy className="size-3.5" />
            5173.19 pts
          </span>
          <button aria-label="Notifications" className="grid size-9 place-items-center rounded-lg text-ink hover:bg-chip">
            <Bell className="size-[18px]" />
          </button>
        </div>
      </div>
    </header>
  );
}
