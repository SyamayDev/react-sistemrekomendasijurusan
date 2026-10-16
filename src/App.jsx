/**
 * App shell: persistent backdrop (CSS sky + lazy WebGL universe), header,
 * route transitions, footer, AI chat and the desktop soft cursor.
 *
 * Performance note: nothing on the landing page's critical path imports the
 * animation library — route transitions are a CSS keyframe, and pages that
 * animate wrap themselves in <MotionProvider> inside their own lazy chunk.
 */
import { Suspense, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router";
import Header from "./components/layout/Header.jsx";
import Footer from "./components/layout/Footer.jsx";
import Backdrop from "./components/layout/Backdrop.jsx";
import ChatLauncher from "./components/chat/ChatLauncher.jsx";
import SoftCursor from "./components/ui/SoftCursor.jsx";
import { PageSkeleton } from "./components/ui/Skeleton.jsx";
import Home from "./pages/Home.jsx";
import { lazyRoute } from "./lib/lazyRoute.jsx";

const Quiz = lazyRoute(() => import("./pages/Quiz.jsx"));
const Result = lazyRoute(() => import("./pages/Result.jsx"));
const Majors = lazyRoute(() => import("./pages/Majors.jsx"));
const MajorDetail = lazyRoute(() => import("./pages/MajorDetail.jsx"));
const About = lazyRoute(() => import("./pages/About.jsx"));
const Privacy = lazyRoute(() => import("./pages/Privacy.jsx"));
const NotFound = lazyRoute(() => import("./pages/NotFound.jsx"));

/** Route module for a pathname (base-relative), so boot can preload it before hydrating. */
// eslint-disable-next-line react-refresh/only-export-components
export function routeFor(pathname) {
  if (pathname === "/") return null;
  if (pathname.startsWith("/tes")) return Quiz;
  if (pathname.startsWith("/hasil")) return Result;
  if (/^\/jurusan\/?$/.test(pathname)) return Majors;
  if (pathname.startsWith("/jurusan/")) return MajorDetail;
  if (pathname.startsWith("/tentang")) return About;
  if (pathname.startsWith("/privasi")) return Privacy;
  return NotFound;
}

/** Scroll an element into view once it exists (lazy routes render a beat later). */
function scrollToId(id, tries = 40) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView();
  else if (tries > 0) requestAnimationFrame(() => scrollToId(id, tries - 1));
}

export default function App() {
  const location = useLocation();
  const { pathname, hash, key } = location;
  const immersive = pathname.startsWith("/tes");
  const navigated = key !== "default"; // "default" = the initial (prerendered) page

  // After client-side navigation: go to the #hash or the top, and move focus
  // to the new page's heading so screen-reader users hear where they are.
  useEffect(() => {
    if (!navigated) return;
    if (hash) return scrollToId(hash.slice(1));
    window.scrollTo(0, 0);
    requestAnimationFrame(() => {
      const h1 = document.querySelector("main h1");
      if (!h1) return;
      h1.setAttribute("tabindex", "-1");
      h1.focus({ preventScroll: true });
    });
  }, [pathname, hash, navigated]);

  return (
    <>
      <a
        href="#konten"
        className="fixed left-4 top-3 z-100 -translate-y-24 rounded-full bg-sun px-5 py-3 font-bold text-on-sun shadow-lift transition-transform focus:translate-y-0"
      >
        Langsung ke konten
      </a>
      <Backdrop />
      {!immersive && <Header />}
      <main id="konten" tabIndex={-1} className="outline-none">
        <div key={pathname} className={navigated ? "page-enter" : undefined}>
          <Suspense fallback={<PageSkeleton />}>
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/tes" element={<Quiz />} />
              <Route path="/hasil" element={<Result />} />
              <Route path="/hasil/bagikan" element={<Result shared />} />
              <Route path="/jurusan" element={<Majors />} />
              <Route path="/jurusan/:slug" element={<MajorDetail />} />
              <Route path="/tentang" element={<About />} />
              <Route path="/privasi" element={<Privacy />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </div>
      </main>
      {!immersive && <Footer />}
      {!immersive && <ChatLauncher />}
      <SoftCursor />
    </>
  );
}
