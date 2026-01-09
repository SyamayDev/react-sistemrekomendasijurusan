import { useState, useEffect } from "react";
import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Quiz from "./pages/Quiz";
import Result from "./pages/Result";
import About from "./pages/About";
import Features from "./pages/Features";
import Footer from "./components/Footer";
import PulsatingStatPreloader from "./components/Preloader"; // Import the preloader

function AppContent() {
  const [resultState, setResultState] = useState(null);
  const location = useLocation();

  return (
    <>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/quiz"
            element={<Quiz onComplete={setResultState} />}
          />
          <Route
            path="/result"
            element={<Result resultState={resultState} />}
          />
          <Route path="/about" element={<About />} />
          <Route path="/features" element={<Features />} />
        </Routes>
      </main>
      {location.pathname !== "/quiz" && <Footer />}
    </>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleLoad = () => {
      // Introduce a small delay for a smoother transition
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    };

    // Check if the page is already loaded
    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    // Cleanup the event listener
    return () => {
      window.removeEventListener('load', handleLoad);
    };
  }, []); // Empty array ensures this effect runs only once on mount

  useEffect(() => {
    // This effect manages the body class for preloader styling
    if (isLoading) {
      document.body.classList.add('preloader-active');
    } else {
      document.body.classList.remove('preloader-active');
    }
  }, [isLoading]);

  return (
    <HashRouter>
      {isLoading ? (
        <PulsatingStatPreloader />
      ) : (
        <AppContent />
      )}
    </HashRouter>
  );
}

export default App;