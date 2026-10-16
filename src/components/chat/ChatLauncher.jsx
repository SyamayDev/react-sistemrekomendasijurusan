/**
 * Always-present chat button (tiny). The panel itself — markdown renderer,
 * streaming client, etc. — is code-split and prefetched on hover/focus.
 */
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import OwlMascot from "../ui/OwlMascot.jsx";
import { onChatRequest } from "../../lib/chatBridge.js";

const loadPanel = () => import("./ChatPanel.jsx");
const ChatPanel = lazy(loadPanel);

export default function ChatLauncher() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false); // keep the panel (and its chat) alive once opened
  const [request, setRequest] = useState(null);
  const fab = useRef(null);

  useEffect(
    () =>
      onChatRequest((detail) => {
        setRequest({ ...detail, id: Date.now() });
        setMounted(true);
        setOpen(true);
      }),
    []
  );

  const close = () => {
    setOpen(false);
    requestAnimationFrame(() => fab.current?.focus());
  };

  return (
    <div className="no-print">
      {mounted && (
        <Suspense fallback={null}>
          <ChatPanel open={open} onClose={close} request={request} />
        </Suspense>
      )}
      <button
        ref={fab}
        type="button"
        onClick={() => {
          if (open) return close();
          setMounted(true);
          setOpen(true);
        }}
        onPointerEnter={loadPanel}
        onFocus={loadPanel}
        aria-expanded={open}
        aria-controls={open ? "chat-siraju" : undefined}
        aria-label={open ? "Tutup chat SI-RAJU AI" : "Buka chat SI-RAJU AI"}
        className={`group fixed bottom-5 right-5 z-60 grid size-16 place-items-center rounded-full bg-night-800 shadow-[0_18px_40px_-12px_rgb(7_14_34/0.7)] ring-1 ring-white/10 transition-all duration-500 ease-out-back hover:scale-105 sm:bottom-7 sm:right-7 ${
          open ? "max-sm:pointer-events-none max-sm:scale-0 max-sm:opacity-0" : ""
        }`}
      >
        <span aria-hidden="true" className="absolute inset-0 rounded-full bg-sun/40 motion-safe:animate-[pulse-ring_2.6s_ease-out_infinite]" />
        <OwlMascot interactive={false} className="relative h-11 w-auto transition-transform duration-500 group-hover:-rotate-6" />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-full bg-ink px-3 py-1.5 text-sm font-semibold text-bg opacity-0 shadow-lift transition-all duration-300 group-hover:opacity-100 sm:block"
        >
          {open ? "Tutup chat" : "Tanya SI-RAJU AI"}
        </span>
      </button>
    </div>
  );
}
