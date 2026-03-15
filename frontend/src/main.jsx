// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  
  <AuthProvider>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "#1a1a1a",
          color: "#fff",
          border: "1px solid #272727",
          fontSize: "14px",
        },
      }}
    />
  </AuthProvider>,
);
