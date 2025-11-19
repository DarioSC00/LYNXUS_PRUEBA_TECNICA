"use client";

import React from "react";
import SidebarComponent from "@/features/universalComponents/sidebarComponents/sidebarComponent";
import NavbarComponent from "@/features/universalComponents/navbarComponent/navbarComponent";
import { Box } from "@mui/material";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      setIsAuthenticated(!!token);
    } catch {
      setIsAuthenticated(false);
    }
  }, []);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {isAuthenticated && <SidebarComponent />}
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {isAuthenticated && <NavbarComponent />}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            bgcolor: "grey.50",
            overflow: "auto",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}