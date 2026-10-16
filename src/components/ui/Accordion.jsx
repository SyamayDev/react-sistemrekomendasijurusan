/**
 * Disclosure with a smooth height animation done in CSS (grid rows 0fr→1fr),
 * so it costs no JavaScript. Closed panels stay in the HTML (good for SEO)
 * but are `inert`, so they're skipped by keyboard and screen readers.
 */
import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";

export function AccordionItem({ title, children, defaultOpen = false, className = "", headingLevel = 3, icon }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  const H = `h${headingLevel}`;
  return (
    <div className={className} data-open={open || undefined}>
      <H className="m-0">
        <button
          type="button"
          id={`${id}-btn`}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          onClick={() => setOpen((o) => !o)}
          className="group flex w-full items-center gap-3 rounded-2xl px-5 py-4 text-left text-base font-bold text-ink transition-colors hover:text-primary sm:text-[1.05rem]"
        >
          {icon}
          <span className="flex-1">{title}</span>
          <span
            className={`grid size-8 shrink-0 place-items-center rounded-full border transition-all duration-500 ease-out-expo ${
              open ? "rotate-180 border-transparent bg-primary text-on-primary" : "border-line text-ink-muted group-hover:border-primary/40"
            }`}
          >
            <ChevronDown size={16} aria-hidden="true" />
          </span>
        </button>
      </H>
      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-btn`}
        inert={!open}
        className={`grid transition-[grid-template-rows] duration-500 ease-out-expo ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className={`px-5 pb-5 text-ink-muted transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0"}`}>{children}</div>
        </div>
      </div>
    </div>
  );
}
