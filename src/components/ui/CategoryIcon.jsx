/** Icons for the eight fields only — keeps the landing page from bundling every question icon. */
import { Atom, BookOpen, Briefcase, GraduationCap, HeartPulse, Palette, Scale, Wrench } from "lucide-react";

const ICONS = {
  atom: Atom,
  "heart-pulse": HeartPulse,
  briefcase: Briefcase,
  scale: Scale,
  "book-open": BookOpen,
  palette: Palette,
  "graduation-cap": GraduationCap,
  wrench: Wrench,
};

export default function CategoryIcon({ name, size = 20, ...rest }) {
  const Cmp = ICONS[name] || Atom;
  return <Cmp size={size} strokeWidth={1.9} aria-hidden="true" focusable="false" {...rest} />;
}
