"use client";

import React, { useEffect, useState } from "react";
import PaginationUniversal from "../universalComponents/paginationUniversalComponents/paginationUniversal";
import UserDetail from "./userDetail";
import * as userService from "./userService/userService";
import {
  Box,
  Container,
  Typography,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  CircularProgress,
  InputAdornment,
  Breadcrumbs,
  Link,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";

export default function UserList() {
  const [users, setUsers] = useState<userService.UserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 5;

  useEffect(() => {
    let mounted = true;
    React.startTransition(() => setLoading(true));
    (async () => {
      try {
        const res = await userService.listUsers({ q: query, page: currentPage, page_size: pageSize });
        if (!mounted) return;
        React.startTransition(() => {
          setUsers(res.items);
          setTotalItems(res.total || 0);
        });
      } catch (err) {
        console.error("❌ listUsers error:", err);
        if (mounted) React.startTransition(() => {
          setUsers([]);
          setTotalItems(0);
        });
      } finally {
        if (mounted) React.startTransition(() => setLoading(false));
      }
    })();
    return () => { mounted = false; };
  }, [query, currentPage, reloadKey]);

  // Reset page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link underline="hover" color="inherit" href="#">
          Home
        </Link>
        <Typography color="text.primary">Users</Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Users
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {loading ? "Loading..." : `${totalItems} user${totalItems !== 1 ? "s" : ""}`}
        </Typography>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          placeholder="Search users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : users.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: "center" }}>
          <PersonIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            No registered users
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Users are created through the registration form
          </Typography>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.50" }}>
                  <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Registered</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => {
                  const isActive = Boolean(user.is_active);
                  const registrationDate = user.created_at
                    ? new Date(user.created_at).toLocaleDateString("en-US", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "-";

                  return (
                    <TableRow
                      key={user.id}
                      hover
                      onClick={() => {
                        setSelectedId(user.id);
                        setOpen(true);
                      }}
                      sx={{
                        cursor: "pointer",
                        "&:hover": {
                          bgcolor: "action.hover",
                        },
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <Avatar
                            sx={{
                              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                              width: 40,
                              height: 40,
                            }}
                          >
                            {user.name?.charAt(0)?.toUpperCase() || "U"}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {user.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={isActive ? "Active" : "Inactive"}
                          color={isActive ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{registrationDate}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <PaginationUniversal
            currentPage={currentPage}
            totalPages={Math.ceil(totalItems / pageSize)}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            disabled={loading}
          />
        </>
      )}

      <UserDetail
        userId={selectedId}
        open={open}
        onClose={() => {
          setOpen(false);
          setSelectedId(null);
        }}
      />
    </Container>
  );
}