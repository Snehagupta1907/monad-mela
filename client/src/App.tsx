import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import ExplorePools from "./page/ExplorePools";
import CreatePool from "./page/CreatePool";
import KingOfTheHillSection from "./components/KingOfTheHillSection";
import PoolCardsSection from "./components/PoolCardsSection";
import Game from "./page/Game";
import CheckPage from './page/CheckPage';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState("");

  return (
    <Router>
      <div className="bg-slate-900 text-white">
        <Routes>
          <Route
            path="/dashboard"
            element={
              <>
                <Navbar
                  activeSection={activeSection}
                  setActiveSection={setActiveSection}
                />
                <div className="ml-16">
                  <HeroSection />
                  <KingOfTheHillSection />
                  <PoolCardsSection />
                </div>
              </>
            }
          />

          <Route path="/" element={<ExplorePools />} />
          <Route path="/create" element={<CreatePool />} />
          <Route path="/check" element={<CheckPage />} />

        </Routes>
      </div>
    </Router>
  );
};

export default App;
