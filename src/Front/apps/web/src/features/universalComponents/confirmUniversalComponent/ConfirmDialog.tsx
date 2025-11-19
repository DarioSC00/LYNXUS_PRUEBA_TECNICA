"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "warning" | "danger" | "info" | "question";
};

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning",
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getIcon = () => {
    switch (type) {
      case "danger":
        return <ErrorOutlineIcon sx={{ fontSize: 48, color: "#ef4444" }} />;
      case "warning":
        return <WarningAmberIcon sx={{ fontSize: 48, color: "#f59e0b" }} />;
      case "question":
        return <HelpOutlineIcon sx={{ fontSize: 48, color: "#3b82f6" }} />;
      case "info":
        return <InfoOutlinedIcon sx={{ fontSize: 48, color: "#06b6d4" }} />;
      default:
        return <WarningAmberIcon sx={{ fontSize: 48, color: "#f59e0b" }} />;
    }
  };

  const getColor = () => {
    switch (type) {
      case "danger":
        return "#ef4444";
      case "warning":
        return "#f59e0b";
      case "question":
        return "#3b82f6";
      case "info":
        return "#06b6d4";
      default:
        return "#f59e0b";
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        zIndex: 9999,
      }}
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, pt: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {getIcon()}
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.25rem" }}>
            {title || "Confirm Action"}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2, pb: 3 }}>
        <Typography variant="body1" sx={{ color: "#4b5563", lineHeight: 1.7 }}>
          {message}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1,
            textTransform: "none",
            fontWeight: 600,
            borderColor: "#d1d5db",
            color: "#6b7280",
            "&:hover": {
              borderColor: "#9ca3af",
              bgcolor: "#f9fafb",
            },
          }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1,
            textTransform: "none",
            fontWeight: 600,
            bgcolor: getColor(),
            "&:hover": {
              bgcolor: getColor(),
              filter: "brightness(0.9)",
            },
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
