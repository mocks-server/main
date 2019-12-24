import React from "react";
import "./App.css";
import About from "./modules/about";
import Settings from "./modules/settings";
import Behaviors from "./modules/behaviors";
import FirstBehavior from "./modules/first-behavior";
import Fixtures from "./modules/fixtures";
import FirstFixture from "./modules/first-fixture";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <About />
        <Settings />
        <Behaviors />
        <FirstBehavior />
        <Fixtures />
        <FirstFixture />
      </header>
    </div>
  );
}

export default App;
