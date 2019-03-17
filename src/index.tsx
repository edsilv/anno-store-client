import * as React from "react";
import { render } from "react-dom";
import AnnoStore from "./components/AnnoStore";

import "./styles.css";

function App() {
  return <AnnoStore endpoint="https://dev0.anno-store.org/api/" />;
}

const rootElement = document.getElementById("root");
render(<App />, rootElement);
