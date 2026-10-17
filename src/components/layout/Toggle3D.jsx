/**
 * "3D" switch: turn the live world off (static art, lighter on battery/data)
 * or back on (forced, even where SI-RAJU would skip it by default).
 */
import { use3DSwitch } from "../../lib/use3DSwitch.js";

export default function Toggle3D({ className = "" }) {
  const { available, on, toggle } = use3DSwitch();
  if (!available) return null;
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label="Dunia 3D"
      title={on ? "Matikan dunia 3D" : "Nyalakan dunia 3D"}
      className={`btn btn-ghost btn-icon font-mono text-[0.72rem] font-bold tracking-wider ${on ? "" : "text-ink-soft line-through decoration-2"} ${className}`}
    >
      3D
    </button>
  );
}
