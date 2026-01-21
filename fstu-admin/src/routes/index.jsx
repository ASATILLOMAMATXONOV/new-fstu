import { createBrowserRouter, Navigate } from "react-router-dom";

// project import
import MainRoutes from "./MainRoutes";
import LoginRoutes from "./LoginRoutes";
import ComponentsRoutes from "./ComponentsRoutes";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Navigate to="/login" replace />
    },

    LoginRoutes,
    ComponentsRoutes,
    MainRoutes
  ],
  { basename: import.meta.env.VITE_APP_BASE_NAME }
);

export default router;
