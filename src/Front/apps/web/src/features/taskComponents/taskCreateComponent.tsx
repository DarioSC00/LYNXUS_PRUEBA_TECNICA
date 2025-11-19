"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Box,
  Typography,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import AddTaskIcon from "@mui/icons-material/AddTask";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CloseIcon from "@mui/icons-material/Close";
import * as taskService from "./taskService/taskService";
import * as userService from "../userComponents/userService/userService";
import { toast } from "react-toastify";

type Props = {
  projectId: number;
  defaultOpen?: boolean;
  open?: boolean;
  onClose?: () => void;
  onCreated?: () => void;
};

export default function TaskCreateComponent({ projectId, defaultOpen = false, open, onClose, onCreated }: Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const modalOpen = open !== undefined ? open : isOpen;
  
  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };
  
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<userService.UserItem[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [assignedUsers, setAssignedUsers] = useState<userService.UserItem[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  const [formData, setFormData] = useState<taskService.CreateTaskInput>({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    due_date: null,
    assignee_id: null,
  });

  const handleChange = (field: keyof taskService.CreateTaskInput, value: string | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddUser = () => {
    if (!selectedUserId) return;
    const userId = Number(selectedUserId);
    const user = users.find(u => u.id === userId);
    if (user && !assignedUsers.find(u => u.id === userId)) {
      const newAssignedUsers = [...assignedUsers, user];
      setAssignedUsers(newAssignedUsers);
      if (newAssignedUsers.length === 1) {
        setFormData(prev => ({ ...prev, assignee_id: user.id }));
      }
      setSelectedUserId("");
    }
  };

  const handleRemoveUser = (userId: number) => {
    const newAssignedUsers = assignedUsers.filter(u => u.id !== userId);
    setAssignedUsers(newAssignedUsers);
    if (newAssignedUsers.length === 0) {
      setFormData(prev => ({ ...prev, assignee_id: null }));
    } else if (assignedUsers[0]?.id === userId) {
      setFormData(prev => ({ ...prev, assignee_id: newAssignedUsers[0].id }));
    }
  };

  useEffect(() => {
    if (modalOpen && users.length === 0) {
      (async () => {
        setLoadingUsers(true);
        try {
          const res = await userService.listUsers({ page: 1, page_size: 100 });
          setUsers(res.items ?? []);
        } catch (err) {
          console.error("Error loading users:", err);
          toast.error("⚠️ Could not load users list");
        } finally {
          setLoadingUsers(false);
        }
      })();
    }
  }, [modalOpen, users.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      toast.error("⚠️ Task title is required");
      return;
    }

    setLoading(true);
    try {
      const taskData: taskService.CreateTaskInput = {
        title: formData.title,
        description: formData.description || undefined,
        status: formData.status || "todo",
        priority: formData.priority || "medium",
        due_date: formData.due_date ? `${formData.due_date}T23:59:59` : null,
        assignee_id: formData.assignee_id || null,
      };

      await taskService.createTask(projectId, taskData);
      
      toast.success("✅ Task created successfully!");
      
      setFormData({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        due_date: null,
        assignee_id: null,
      });
      setAssignedUsers([]);
      setSelectedUserId("");
      
      onCreated?.();
      handleClose();
    } catch (err) {
      console.error("Error creating task:", err);
      toast.error("❌ Could not create task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={modalOpen} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        }
      }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '1.5rem',
        fontWeight: 700,
        py: 3,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AddTaskIcon />
          <span>Create New Task</span>
        </Box>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 4, pb: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Task Title"
              fullWidth
              required
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Enter a descriptive task title"
              variant="outlined"
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontSize: '1.05rem',
                }
              }}
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={formData.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Provide detailed task description, requirements, and acceptance criteria..."
              variant="outlined"
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status || "todo"}
                  onChange={(e) => handleChange("status", e.target.value)}
                  label="Status"
                  disabled={loading}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="todo">📋 To Do</MenuItem>
                  <MenuItem value="doing">⚙️ In Progress</MenuItem>
                  <MenuItem value="done">✅ Completed</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority || "medium"}
                  onChange={(e) => handleChange("priority", e.target.value)}
                  label="Priority"
                  disabled={loading}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="low">🟢 Low</MenuItem>
                  <MenuItem value="medium">🟡 Medium</MenuItem>
                  <MenuItem value="high">🔴 High</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: '#374151' }}>
                Assign Team Members
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <FormControl fullWidth disabled={loadingUsers}>
                  <InputLabel>Select User</InputLabel>
                  <Select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    label="Select User"
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">
                      <em>{loadingUsers ? "Loading users..." : "Select a user..."}</em>
                    </MenuItem>
                    {users
                      .filter(u => !assignedUsers.find(au => au.id === u.id))
                      .map((user) => (
                        <MenuItem key={user.id} value={user.id}>
                          {user.name || user.email}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
                <Button
                  onClick={handleAddUser}
                  disabled={!selectedUserId}
                  variant="contained"
                  sx={{
                    minWidth: '120px',
                    borderRadius: 2,
                    textTransform: 'none',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                >
                  <PersonAddIcon sx={{ mr: 0.5 }} />
                  Add
                </Button>
              </Box>
              
              {assignedUsers.length > 0 ? (
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 1,
                  p: 2,
                  bgcolor: '#f9fafb',
                  borderRadius: 2,
                  border: '1px solid #e5e7eb',
                }}>
                  {assignedUsers.map((user) => (
                    <Chip
                      key={user.id}
                      label={user.name || user.email}
                      onDelete={() => handleRemoveUser(user.id)}
                      deleteIcon={<CloseIcon />}
                      sx={{
                        bgcolor: 'white',
                        border: '1px solid #e5e7eb',
                        '& .MuiChip-deleteIcon': {
                          color: '#ef4444',
                        }
                      }}
                    />
                  ))}
                </Box>
              ) : (
                <Box sx={{
                  p: 2,
                  textAlign: 'center',
                  color: '#94a3b8',
                  bgcolor: '#f9fafb',
                  borderRadius: 2,
                  border: '1px dashed #e5e7eb',
                }}>
                  <Typography variant="body2">
                    No assigned users yet
                  </Typography>
                </Box>
              )}
            </Box>

            <TextField
              label="Due Date"
              type="date"
              fullWidth
              value={formData.due_date || ""}
              onChange={(e) => handleChange("due_date", e.target.value || null)}
              InputLabelProps={{ shrink: true }}
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 2 }}>
          <Button
            onClick={handleClose}
            disabled={loading}
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
              py: 1,
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            variant="contained"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 4,
              py: 1,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #63408b 100%)',
              },
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                Creating...
              </>
            ) : (
              <>
                <AddTaskIcon sx={{ mr: 1 }} />
                Create Task
              </>
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
