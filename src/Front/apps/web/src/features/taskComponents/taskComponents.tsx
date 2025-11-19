"use client";

import React, { useEffect, useState } from "react";
import TaskDetail from "./taskDetail";
import * as taskService from "./taskService/taskService";
import { toast } from "react-toastify";
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
  CircularProgress,
  InputAdornment,
  Breadcrumbs,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SearchIcon from "@mui/icons-material/Search";

export default function TaskList() {
  const [tasks, setTasks] = useState<taskService.TaskItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<taskService.StatusType | "">("");
  const [priorityFilter, setPriorityFilter] = useState<taskService.PriorityType | "">("");
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    React.startTransition(() => setLoading(true));
    (async () => {
      try {
        const res = await taskService.listTasks({
          q: query,
          status: statusFilter || undefined,
          priority: priorityFilter || undefined,
          skip: 0,
          limit: 50,
        });
        if (!mounted) return;
        React.startTransition(() => setTasks(res.items));
        console.log("✅ listTasks response:", res);
      } catch (err) {
        console.error("❌ listTasks error:", err);
        toast.error("⚠️ Could not load tasks. Please refresh.");
        if (mounted) React.startTransition(() => setTasks([]));
      } finally {
        if (mounted) React.startTransition(() => setLoading(false));
      }
    })();
    return () => { mounted = false; };
  }, [query, statusFilter, priorityFilter, reloadKey]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo":
        return "default";
      case "doing":
        return "info";
      case "done":
        return "success";
      default:
        return "default";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "success";
      case "medium":
        return "warning";
      case "high":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link underline="hover" color="inherit" href="#">
          Home
        </Link>
        <Typography color="text.primary">Tasks</Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Tasks
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {loading ? "Loading..." : `${tasks.length} task${tasks.length !== 1 ? "s" : ""}`}
        </Typography>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search tasks..."
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
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value as taskService.StatusType | "")}
              >
                <MenuItem value="">All statuses</MenuItem>
                <MenuItem value="todo">📋 To Do</MenuItem>
                <MenuItem value="doing">⚙️ In Progress</MenuItem>
                <MenuItem value="done">✅ Completed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={priorityFilter}
                label="Priority"
                onChange={(e) => setPriorityFilter(e.target.value as taskService.PriorityType | "")}
              >
                <MenuItem value="">All priorities</MenuItem>
                <MenuItem value="low">🟢 Low</MenuItem>
                <MenuItem value="medium">🟡 Medium</MenuItem>
                <MenuItem value="high">🔴 High</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : tasks.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: "center" }}>
          <AssignmentIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            No tasks
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tasks are created within each project
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.50" }}>
                <TableCell sx={{ fontWeight: 600 }}>Task</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.map((task) => {
                const dueDate = task.due_date ? new Date(task.due_date) : null;
                const now = new Date();
                const isOverdue = dueDate && dueDate < now;
                const dueDateFormatted = dueDate
                  ? dueDate.toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "-";

                const statusLabel = task.status === "todo" ? "To Do" : task.status === "doing" ? "In Progress" : "Completed";
                const priorityLabel = task.priority === "low" ? "Low" : task.priority === "medium" ? "Medium" : "High";

                return (
                  <TableRow
                    key={task.id}
                    hover
                    onClick={() => {
                      setSelectedId(task.id);
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
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {task.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {task.description || "Sin descripción"}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          color: isOverdue ? "error.main" : "text.primary",
                          fontWeight: isOverdue ? 600 : 400,
                        }}
                      >
                        {dueDateFormatted} {isOverdue && "⚠️"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={statusLabel} color={getStatusColor(task.status)} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip label={priorityLabel} color={getPriorityColor(task.priority)} size="small" />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {selectedId !== null && (
        <TaskDetail
          taskId={selectedId}
          open={open}
          onClose={() => {
            setOpen(false);
            setSelectedId(null);
          }}
          onUpdate={() => setReloadKey((k) => k + 1)}
        />
      )}
    </Container>
  );
}
