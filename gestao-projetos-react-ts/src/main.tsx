import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ProjectsProvider } from "./context/ProjectsContext";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Elemento root não encontrado");
}

ReactDOM.createRoot(rootElement as HTMLElement).render(
  <React.StrictMode>
    <ProjectsProvider>
      <App />
    </ProjectsProvider>
  </React.StrictMode>
);
