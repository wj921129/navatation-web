
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import { ThemeProvider } from "next-themes";

import { Toaster } from "sonner";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <Toaster position="top-center" richColors />
    <App />
  </ThemeProvider>
);
  