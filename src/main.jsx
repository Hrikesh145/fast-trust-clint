import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { RouterProvider } from "react-router/dom";
import { router } from "./route/router.jsx";
import AuthProvider from "./contexts/AuthContext/AuthProvider.jsx";
import "@tanstack/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <div className="bg-[#F0F0F0]">
      <div className="font-urbanist ">
        <QueryClientProvider client ={queryClient}>
          <AuthProvider>
            <RouterProvider router={router}></RouterProvider>
          </AuthProvider>
        </QueryClientProvider>
      </div>
    </div>
  </StrictMode>,
);
