/**
 * Name → icon registry for data-driven icons (questions.json, categories).
 * Only the icons listed here end up in the bundle.
 */
import {
  Atom, BookOpen, Brain, Briefcase, Building2, Check, Compass, Cpu, FlaskConical, Flag, Globe,
  GraduationCap, Hammer, Heart, HeartPulse, Landmark, Languages, Laptop, LayoutGrid, Lightbulb,
  Megaphone, MessageCircle, Mic, Mountain, Music, Orbit, Palette, Rocket, ScanSearch, Scale, Shuffle,
  Sigma, Sparkles, Sprout, Target, Telescope, Trees, TrendingUp, Users, Wrench, X,
} from "lucide-react";

const ICONS = {
  atom: Atom, "book-open": BookOpen, brain: Brain, briefcase: Briefcase, building: Building2, check: Check,
  compass: Compass, cpu: Cpu, flask: FlaskConical, flag: Flag, globe: Globe, "graduation-cap": GraduationCap,
  hammer: Hammer, heart: Heart, "heart-pulse": HeartPulse, landmark: Landmark, languages: Languages,
  laptop: Laptop, "layout-grid": LayoutGrid, lightbulb: Lightbulb, megaphone: Megaphone,
  "message-circle": MessageCircle, mic: Mic, mountain: Mountain, music: Music, orbit: Orbit, palette: Palette,
  rocket: Rocket, "scan-search": ScanSearch, scale: Scale, shuffle: Shuffle, sigma: Sigma, sparkles: Sparkles,
  sprout: Sprout, target: Target, telescope: Telescope, trees: Trees, "trending-up": TrendingUp, users: Users,
  wrench: Wrench, x: X,
};

export default function Icon({ name, size = 20, strokeWidth = 1.9, ...rest }) {
  const Cmp = ICONS[name] || Sparkles;
  return <Cmp size={size} strokeWidth={strokeWidth} aria-hidden="true" focusable="false" {...rest} />;
}
