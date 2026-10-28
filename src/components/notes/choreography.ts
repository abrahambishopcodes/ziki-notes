// The two big owner moments. Both are imperative DOM choreography so they can
// leave the note's box: approval folds the title into a paper plane that flies
// to the header; rejection scrunches the note into a ball that bounces and
// unfolds again, creased.

const EASE_OUT = "cubic-bezier(0.16, 1, 0.3, 1)";

const PLANE_SVG = `<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
  <path d="M23 12 L2 3 L7.5 12 L2 21 Z" fill="var(--color-brand)" />
  <path d="M7.5 12 L23 12" stroke="#fff" stroke-width="1.1" opacity="0.7" />
  <path d="M7.5 12 L2 21 L11 13.6 Z" fill="var(--color-brand-hover)" />
</svg>`;

const BALL_SVG = `<svg viewBox="0 0 40 40" width="38" height="38" aria-hidden="true">
  <path d="M8 13 L15 5 L26 4.5 L35 11 L36.5 24 L30 34 L18 36.5 L6.5 29.5 L3.5 19.5 Z"
    fill="#f6f7fb" stroke="#9aa0b1" stroke-width="1.3" stroke-linejoin="round" />
  <path d="M15 5 L18 17 L8 13 M18 17 L26 4.5 M18 17 L35 11 M18 17 L28 24 L36.5 24 M28 24 L30 34
    M28 24 L18 36.5 M18 17 L12 26 L6.5 29.5 M12 26 L18 36.5 M12 26 L3.5 19.5"
    fill="none" stroke="#c2c6d2" stroke-width="1.1" stroke-linejoin="round" />
</svg>`;

function overlay(html: string, left: number, top: number) {
  const el = document.createElement("div");
  el.innerHTML = html;
  el.style.cssText = `position:fixed;left:${left}px;top:${top}px;z-index:60;pointer-events:none;`;
  document.body.append(el);
  return el;
}

/** Folds `source` into a paper plane that flies an arc to `target`. */
export async function flyToHeader(source: HTMLElement, target: HTMLElement, onLand: () => void) {
  const from = source.getBoundingClientRect();
  const to = target.getBoundingClientRect();

  // A copy of the title folds away into the plane's starting point
  const slip = document.createElement("div");
  slip.textContent = source.textContent;
  slip.style.cssText = `position:fixed;left:${from.left}px;top:${from.top}px;width:${from.width}px;
    z-index:60;pointer-events:none;font:500 15px/1.65 var(--font-sans);color:var(--color-ink);
    background:var(--color-brand-soft);border-radius:6px;transform-origin:left center;`;
  document.body.append(slip);
  slip.animate(
    [
      { transform: "none", opacity: 1 },
      { transform: "scaleX(0.06) scaleY(0.45)", opacity: 0 },
    ],
    { duration: 300, easing: "cubic-bezier(0.7, 0, 0.84, 0)", fill: "forwards" },
  );

  // Quadratic arc from the title's start to the header count, peaking above both
  const s = { x: from.left, y: from.top + from.height / 2 };
  const e = { x: to.left + to.width / 2, y: to.top + to.height / 2 };
  const c = { x: (s.x + e.x) / 2, y: Math.min(s.y, e.y) - 140 };
  const steps = 24;
  const frames: Keyframe[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = (1 - t) ** 2 * s.x + 2 * (1 - t) * t * c.x + t ** 2 * e.x;
    const y = (1 - t) ** 2 * s.y + 2 * (1 - t) * t * c.y + t ** 2 * e.y;
    const dx = 2 * (1 - t) * (c.x - s.x) + 2 * t * (e.x - c.x);
    const dy = 2 * (1 - t) * (c.y - s.y) + 2 * t * (e.y - c.y);
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    const scale = t < 0.12 ? 0.4 + (t / 0.12) * 0.6 : t > 0.85 ? 1 - ((t - 0.85) / 0.15) * 0.7 : 1;
    frames.push({ transform: `translate(${x - 12}px, ${y - 12}px) rotate(${angle}deg) scale(${scale})` });
  }

  const plane = overlay(PLANE_SVG, 0, 0);
  plane.style.filter = "drop-shadow(0 4px 6px rgba(79, 70, 229, 0.25))";
  await plane.animate(frames, { duration: 950, delay: 200, easing: "cubic-bezier(0.45, 0, 0.2, 1)", fill: "both" })
    .finished;
  plane.remove();
  slip.remove();

  target.animate(
    [
      { backgroundColor: "var(--color-brand-soft)", boxShadow: "0 0 0 5px var(--color-brand-soft)", transform: "scale(1.12)" },
      { backgroundColor: "transparent", boxShadow: "0 0 0 0 transparent", transform: "scale(1)" },
    ],
    { duration: 900, easing: EASE_OUT },
  );
  onLand();
}

/**
 * Scrunches a note into a paper ball that drops, bounces once and unfolds.
 * Starts after the pen strike has crossed the title out.
 */
export function crumple(note: HTMLElement) {
  const box = note.getBoundingClientRect();
  const at = "20px 18px";
  note.animate(
    [
      { clipPath: `circle(150% at ${at})`, transform: "none" },
      { clipPath: `circle(150% at ${at})`, transform: "none", offset: 0.05 },
      { clipPath: `circle(18px at ${at})`, transform: "scale(0.95, 0.9) rotate(-1.5deg)", offset: 0.3 },
      { clipPath: `circle(0px at ${at})`, transform: "scale(0.9)", offset: 0.36 },
      { clipPath: `circle(0px at ${at})`, transform: "none", offset: 0.66 },
      { clipPath: `circle(150% at ${at})`, transform: "none" },
    ],
    { duration: 1300, delay: 560, easing: "ease-in-out" },
  );

  const ball = overlay(BALL_SVG, box.left + 1, box.top - 1);
  ball.style.filter = "drop-shadow(0 5px 6px rgba(17, 19, 34, 0.22))";
  ball
    .animate(
      [
        { transform: "scale(0) rotate(0)", opacity: 0 },
        { transform: "scale(0) rotate(0)", opacity: 0, offset: 0.18 },
        { transform: "scale(1.15) rotate(30deg)", opacity: 1, offset: 0.34 },
        // Drops, squashes on the pad, bounces back up
        { transform: "translateY(16px) rotate(140deg)", offset: 0.48, easing: "cubic-bezier(0.5, 0, 1, 0.6)" },
        { transform: "translateY(18px) scale(1.12, 0.84) rotate(150deg)", offset: 0.52 },
        { transform: "translateY(-4px) rotate(230deg)", offset: 0.62, easing: "ease-in" },
        { transform: "translateY(0) rotate(260deg)", offset: 0.68 },
        // Flattens out as the note unfolds back from it
        { transform: "scale(2.6) rotate(300deg)", opacity: 0 },
      ],
      { duration: 1300, delay: 560, fill: "both" },
    )
    .finished.then(() => ball.remove());
}
