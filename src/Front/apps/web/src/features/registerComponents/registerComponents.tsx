"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerWithEmail } from "./registerService/registerService";
import { toast } from "react-toastify";
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Link as MuiLink,
  CircularProgress,
  Alert,
} from "@mui/material";
import Link from "next/link";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import HowToRegIcon from "@mui/icons-material/HowToReg";

type RegisterFormData = {
  name: string;
  email: string;
  password: string;
};

export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const domFormData = new FormData(form);
    const payload: RegisterFormData = {
      name: domFormData.get("name") as string,
      email: domFormData.get("email") as string,
      password: domFormData.get("password") as string,
    };

    try {
      await registerWithEmail(payload);
      toast.success("✅ Registration successful! Redirecting to login...");
      router.push("/login");
    } catch (err: unknown) {
      const detail =
        typeof err === "object" && err !== null && "response" in err
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (err as any).response?.data?.detail
          : undefined;
      const message = detail ?? (err instanceof Error ? err.message : String(err));
      const errorMessage = message || "❌ Registration failed. Please try again.";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        position: "fixed",
        top: 0,
        left: 0,
        margin: 0,
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={24}
          sx={{
            p: 4,
            borderRadius: 4,
            background: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(20px)",
          }}
        >
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                margin: "0 auto 16px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 32px rgba(102, 126, 234, 0.3)",
              }}
            >
              <PersonAddIcon sx={{ fontSize: 40, color: "white" }} />
            </Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 1,
              }}
            >
              Lynxus Task
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create your account and start organizing
            </Typography>
          </Box>

          <Box
            sx={{
              mb: 4,
              p: 3,
              bgcolor: "rgba(102, 126, 234, 0.05)",
              borderRadius: 2,
              border: "1px solid rgba(102, 126, 234, 0.1)",
            }}
          >
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
              Join us today!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create your free account and unlock powerful project management
              tools to boost your team&apos;s productivity.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={onSubmit}>
            <TextField
              fullWidth
              label="Full name"
              name="name"
              required
              sx={{ mb: 2 }}
              placeholder="Your name"
            />

            <TextField
              fullWidth
              label="Email address"
              name="email"
              type="email"
              required
              sx={{ mb: 2 }}
              placeholder="you@example.com"
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              required
              sx={{ mb: 3 }}
              placeholder="••••••••"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <HowToRegIcon />}
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                py: 1.5,
                fontSize: "1rem",
                fontWeight: 600,
                textTransform: "none",
                boxShadow: "0 4px 14px 0 rgba(102, 126, 234, 0.4)",
                "&:hover": {
                  background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                  boxShadow: "0 6px 20px 0 rgba(102, 126, 234, 0.5)",
                },
                "&:disabled": {
                  background: "rgba(102, 126, 234, 0.5)",
                },
              }}
            >
              {loading ? "Creating account..." : "Sign up"}
            </Button>

            <Box sx={{ mt: 3, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{" "}
                <Link href="/login" passHref legacyBehavior>
                  <MuiLink
                    sx={{
                      color: "#667eea",
                      fontWeight: 600,
                      textDecoration: "none",
                      "&:hover": {
                        textDecoration: "underline",
                      },
                    }}
                  >
                    Sign in
                  </MuiLink>
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}