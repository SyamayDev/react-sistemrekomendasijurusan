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
    // Add/remove class to body for preloader styling
    if (isLoading) {
      document.body.classList.add('preloader-active');
    } else {
      document.body.classList.remove('preloader-active');
    }

    // Simulate loading time for assets
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // Display preloader for 3 seconds

    return () => {
      clearTimeout(timer);
      // Ensure the class is removed if component unmounts prematurely
      document.body.classList.remove('preloader-active');
    };
  }, [isLoading]); // Rerun effect when isLoading changes

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