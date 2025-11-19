"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  Breadcrumbs,
  Link,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";

const routeNames: Record<string, string> = {
  "/": "Home",
  "/project": "Projects",
  "/user": "Users",
  // agregar más rutas si hace falta
};

export default function NavbarComponent() {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const parts = pathname.split("/").filter(Boolean);
  const pageKey = parts.length ? `/${parts[0]}` : "/";
  const pageTitle = routeNames[pageKey] ?? (parts.length ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : "Home");

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    try {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      localStorage.removeItem("refresh_token");
    } catch (e) {
      console.error("logout: storage clear failed", e);
    }
    router.replace("/login");
  };

  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("");
  const [userInitials, setUserInitials] = useState("U");

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserName(user.name || user.email || "User");
        setUserEmail(user.email || "");
        const nameParts = (user.name || user.email || "User").split(" ");
        const initials =
          nameParts.length > 1
            ? nameParts[0][0] + nameParts[1][0]
            : nameParts[0].substring(0, 2);
        setUserInitials(initials.toUpperCase());
      }
    } catch (e) {
      console.error("Error loading user data", e);
    }
  }, []);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "white",
        borderBottom: "1px solid",
        borderColor: "divider",
        color: "text.primary",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
            {pageTitle}
          </Typography>
          <Breadcrumbs separator="/" sx={{ fontSize: "0.875rem" }}>
            <Link underline="hover" color="text.secondary" href="#">
              Home
            </Link>
            <Typography color="text.primary" sx={{ fontSize: "0.875rem" }}>
              {pageTitle}
            </Typography>
          </Breadcrumbs>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton
            onClick={handleClick}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 2,
              py: 1,
              borderRadius: 2,
              "&:hover": {
                bgcolor: "action.hover",
              },
            }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                fontSize: "0.875rem",
              }}
            >
              {userInitials}
            </Avatar>
            <Box sx={{ textAlign: "left", display: { xs: "none", sm: "block" } }}>
              <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                {userName}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                Admin
              </Typography>
            </Box>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            PaperProps={{
              elevation: 8,
              sx: {
                minWidth: 220,
                mt: 1.5,
                borderRadius: 2,
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {userName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {userEmail}
              </Typography>
            </Box>

            <MenuItem onClick={() => router.push("/profile")}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              My Profile
            </MenuItem>

            <MenuItem onClick={() => router.push("/settings")}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>

            <Divider />

            <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" sx={{ color: "error.main" }} />
              </ListItemIcon>
              Sign Out
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}