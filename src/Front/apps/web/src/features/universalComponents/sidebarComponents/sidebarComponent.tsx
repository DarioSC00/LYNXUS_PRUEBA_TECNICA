"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Avatar,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import FolderIcon from "@mui/icons-material/Folder";

type NavItem = { href: string; label: string; icon?: React.ReactNode };

const NAV: NavItem[] = [
  {
    href: "/user",
    label: "Users",
    icon: <PeopleIcon />,
  },
  {
    href: "/project",
    label: "Projects",
    icon: <FolderIcon />,
  },
];

const drawerWidth = 240;

export default function SidebarComponent() {
  const pathname = usePathname();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          background: "linear-gradient(180deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          borderRight: "none",
        },
      }}
    >
      <Box sx={{ p: 3, display: "flex", alignItems: "center", gap: 2 }}>
        <Avatar
          sx={{
            width: 48,
            height: 48,
            bgcolor: "rgba(255, 255, 255, 0.2)",
            fontWeight: 700,
            fontSize: "1.25rem",
          }}
        >
          LN
        </Avatar>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Lynxus
        </Typography>
      </Box>

      <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.1)" }} />

      <List sx={{ px: 2, py: 3 }}>
        {NAV.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <ListItem key={item.href} disablePadding sx={{ mb: 1 }}>
              <Link
                href={item.href}
                passHref
                style={{ textDecoration: "none", width: "100%" }}
              >
                <ListItemButton
                  selected={isActive}
                  sx={{
                    borderRadius: 2,
                    color: "white",
                    "&.Mui-selected": {
                      bgcolor: "rgba(255, 255, 255, 0.2)",
                      "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 0.25)",
                      },
                    },
                    "&:hover": {
                      bgcolor: "rgba(255, 255, 255, 0.1)",
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontWeight: isActive ? 600 : 400 }}
                  />
                </ListItemButton>
              </Link>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ mt: "auto", p: 2, textAlign: "center" }}>
        <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.1)", mb: 2 }} />
        <Typography variant="caption" sx={{ opacity: 0.7 }}>
          v1.0
        </Typography>
      </Box>
    </Drawer>
  );
}