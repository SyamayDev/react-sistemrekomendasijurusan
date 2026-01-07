import { useState } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Quiz from "./pages/Quiz";
import Result from "./pages/Result";
import About from "./pages/About";
import Features from "./pages/Features";
import WaveBackground from "./components/WaveBackground";
import Footer from "./components/Footer";

function App() {
  const [resultState, setResultState] = useState(null);

  return (
    <HashRouter>
      <WaveBackground />
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
      <Footer />
    </HashRouter>
  );
}

export default App;
