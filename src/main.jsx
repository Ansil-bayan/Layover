import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { StoreProvider } from "./state/store";
import "./styles/global.css";
import "./styles/bus.css";
import "./styles/mingle.css";
import "./styles/travel.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <StoreProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StoreProvider>
  </StrictMode>
);
