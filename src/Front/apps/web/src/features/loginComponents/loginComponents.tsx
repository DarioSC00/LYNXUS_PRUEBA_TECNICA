"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginWithEmail } from "./loginService/loginService";
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
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LoginIcon from "@mui/icons-material/Login";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginWithEmail({ email, password });
      localStorage.setItem("access_token", response.access_token);
      try {
        localStorage.setItem("user", JSON.stringify(response.user));
      } catch {
        // ignore storage errors
      }
      toast.success("🎉 Login successful! Welcome back.");
      router.push("/user");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "❌ Login failed. Please check your credentials.";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
              <LockOutlinedIcon sx={{ fontSize: 40, color: "white" }} />
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
              Manage projects and tasks effortlessly
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
              Welcome back!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to access your projects, manage tasks, and collaborate
              with your team.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ mb: 2 }}
              placeholder="you@example.com"
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
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
              {loading ? "Signing in..." : "Sign in"}
            </Button>

            <Box sx={{ mt: 3, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Don&apos;t have an account?{" "}
                <Link href="/register" passHref legacyBehavior>
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
                    Sign up
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
