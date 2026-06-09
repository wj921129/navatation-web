
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import { ThemeProvider } from "next-themes";

import { Toaster } from "sonner";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <Toaster 
      position="top-center" 
      richColors={false} 
      toastOptions={{
        style: {
          width: 'fit-content',
          minWidth: 'unset',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px 20px',
          borderRadius: '9999px',
          fontSize: '13px',
          fontWeight: 500,
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          gap: '8px',
        },
        success: {
          style: {
            background: 'rgba(240, 253, 244, 0.92)',
            color: '#166534',
            border: '1px solid rgba(187, 247, 208, 0.7)',
          }
        },
        error: {
          style: {
            background: 'rgba(254, 242, 242, 0.92)',
            color: '#991b1b',
            border: '1px solid rgba(254, 226, 226, 0.7)',
          }
        },
        warning: {
          style: {
            background: 'rgba(255, 251, 235, 0.92)',
            color: '#92400e',
            border: '1px solid rgba(253, 230, 138, 0.7)',
          }
        }
      }}
    />
    <App />
  </ThemeProvider>
);
  