import React from "react";
import { Provider } from "react-redux";
import { createStore, combineReducers } from "redux";
import { storeManager } from "@data-provider/core";

import About from "./modules/about";
import Settings from "./modules/settings";
import Behaviors from "./modules/behaviors";
import CurrentBehavior from "./modules/current-behavior";
import Fixtures from "./modules/fixtures";

import "./App.css";

const store = createStore(
  combineReducers({
    dataProviders: storeManager.reducer
  }),
  window && window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

storeManager.setStore(store, "dataProviders");

function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <header className="App-header">
          <About />
          <Settings />
          <Behaviors />
          <CurrentBehavior />
          <Fixtures />
        </header>
      </div>
    </Provider>
  );
}

export default App;
