import React from "react";
import "./App.css";
import About from "./modules/about";
import Settings from "./modules/settings";
import Behaviors from "./modules/behaviors";
import CurrentBehavior from "./modules/current-behavior";
import Fixtures from "./modules/fixtures";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <About />
        <Settings />
        <Behaviors />
        <CurrentBehavior />
        <Fixtures />
      </header>
    </div>
  );
}

export default App;
