import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Dynamic Circular Transparent Favicon Generator
(function generateFavicon() {
  const img = new Image();
  img.src = "/logo.jpg";
  img.crossOrigin = "anonymous";
  img.onload = () => {
    const canvas = document.createElement("canvas");
    const size = 128; // Standard high-quality favicon size
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    // Draw circular clip path
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, (size / 2) - 2, 0, Math.PI * 2);
    ctx.clip();

    // Draw the square logo image inside the circular clip
    ctx.drawImage(img, 0, 0, size, size);

    // Update or create favicon link tag
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.getElementsByTagName("head")[0].appendChild(link);
    }
    link.type = "image/png";
    link.href = canvas.toDataURL("image/png");
  };
})();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
