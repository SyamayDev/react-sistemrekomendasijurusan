import { useState } from "react";
import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Quiz from "./pages/Quiz";
import Result from "./pages/Result";
import About from "./pages/About";
import Features from "./pages/Features";
import Footer from "./components/Footer";

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
        </Routes>
      </main>
      {location.pathname !== "/quiz" && <Footer />}
    </>
  );
}

function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}

export default App;