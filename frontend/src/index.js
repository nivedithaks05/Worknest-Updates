import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
// in src/index.js or src/main.jsx
import "./index.css";

import "./styles/main.css";
import "./styles/layout.css";
import "./styles/navbar.css";
import "./styles/sidebar.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
