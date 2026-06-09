
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import { ThemeProvider } from "next-themes";

import { Toaster } from "sonner";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <Toaster 
      position="top-center" 
      richColors 
      toastOptions={{
        style: {
          width: 'fit-content',
          minWidth: 'unset',
          margin: '0 auto',
        }
      }}
    />
    <App />
  </ThemeProvider>
);
  