"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Chip,
  TextField,
  Button,
  Paper,
  Avatar,
  Divider,
  CircularProgress,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CommentIcon from "@mui/icons-material/Comment";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import SaveIcon from "@mui/icons-material/Save";
import ConfirmDialog from "../universalComponents/confirmUniversalComponent/ConfirmDialog";
import * as taskService from "./taskService/taskService";
import * as commentService from "../commentComponents/commentService/commentService";
import type { TaskDetail, CommentItem, StatusType, PriorityType } from "./taskService/taskService";
import { toast } from "react-toastify";

// Aceptar onUpdate opcional para que el consumidor pueda pasarlo
type Props = {
  taskId: number;
  open: boolean;
  onClose: () => void;
  onUpdate?: () => void;
};

const TaskDetailComponent: React.FC<Props> = ({ taskId, open, onClose, onUpdate }) => {
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [creating, setCreating] = useState(false);
  
  // Edit states
  const [editedStatus, setEditedStatus] = useState<StatusType>("todo");
  const [editedPriority, setEditedPriority] = useState<PriorityType>("low");
  const [saving, setSaving] = useState(false);

  // Confirm dialog states
  const [confirmDeleteComment, setConfirmDeleteComment] = useState(false);
  const [pendingCommentId, setPendingCommentId] = useState<number | null>(null);

  const currentUserId = getCurrentUserId();

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      try {
        const t = await taskService.getTask(taskId);
        setTask(t ?? null);
        if (t) {
          setEditedStatus(t.status);
          setEditedPriority(t.priority);
        }
      } catch (err) {
        console.error("Error loading task:", err);
        toast.error("⚠️ Could not load task details. Please try again.");
        setTask(null);
      } finally {
        setLoading(false);
      }
    })();
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, taskId]);

  const handleSaveChanges = async () => {
    if (!task) return;
    setSaving(true);
    try {
      await taskService.updateTask(task.id, {
        status: editedStatus,
        priority: editedPriority,
      });
      toast.success("✅ Task updated successfully!");
      // Reload task details
      const updated = await taskService.getTask(taskId);
      setTask(updated ?? null);
      onUpdate?.();
    } catch (err) {
      console.error("Error updating task:", err);
      toast.error("❌ Could not update task. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const loadComments = async () => {
    setCommentsLoading(true);
    try {
      const res = await commentService.listComments(taskId);
      const commentsList = Array.isArray(res) ? res : (res?.items ?? []);
      console.log("[taskDetail] comments loaded:", commentsList);
      console.log("[taskDetail] currentUserId:", currentUserId);
      setComments(commentsList);
    } catch (err: any) {
      console.error("Error loading comments:", err);
      if (err?.response?.status === 404 || err?.response?.status === 403 || err?.response?.status === 401) {
        setComments([]);
      } else {
        toast.error("⚠️ Could not load comments. Please refresh.");
        setComments([]);
      }
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleCreateComment = async () => {
    if (!newComment.trim()) return;
    setCreating(true);
    try {
      await commentService.createComment(taskId, { body: newComment });
      toast.success("✅ Comment added successfully!");
      setNewComment("");
      await loadComments();
      onUpdate?.();
    } catch (err) {
      console.error("Error creating comment:", err);
      toast.error("❌ Could not create comment. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    setPendingCommentId(commentId);
    setConfirmDeleteComment(true);
  };

  const confirmDeleteCommentAction = async () => {
    if (!pendingCommentId) return;
    try {
      await commentService.deleteComment(pendingCommentId);
      toast.success("🗑️ Comment deleted successfully");
      setComments((c) => c.filter((x) => x.id !== pendingCommentId));
      onUpdate?.();
    } catch (err) {
      console.error("Error deleting comment:", err);
      toast.error("❌ Could not delete comment. Please try again.");
    } finally {
      setPendingCommentId(null);
      setConfirmDeleteComment(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done": return { bgcolor: '#d1fae5', color: '#065f46' };
      case "doing": return { bgcolor: '#dbeafe', color: '#1e40af' };
      default: return { bgcolor: '#f3f4f6', color: '#374151' };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return { bgcolor: '#fee2e2', color: '#991b1b' };
      case "medium": return { bgcolor: '#fef3c7', color: '#92400e' };
      default: return { bgcolor: '#f0fdf4', color: '#166534' };
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh',
        }
      }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '1.5rem',
        fontWeight: 700,
        py: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span>{task?.title ?? "Task Detail"}</span>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
            <CircularProgress />
            <Typography sx={{ mt: 2, color: '#64748b' }}>Loading...</Typography>
          </Box>
        ) : !task ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography color="textSecondary">Task not found</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', minHeight: '650px', maxHeight: '75vh' }}>
            {/* LEFT COLUMN: Task Details */}
            <Box sx={{ p: 4, pr: 3, borderRight: '1px solid #e5e7eb', overflowY: 'auto' }}>
              {/* Status and Priority Editors */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={editedStatus}
                    label="Status"
                    onChange={(e) => setEditedStatus(e.target.value as StatusType)}
                    sx={{ bgcolor: 'white', borderRadius: 2 }}
                  >
                    <MenuItem value="todo">📋 To Do</MenuItem>
                    <MenuItem value="doing">⚙️ In Progress</MenuItem>
                    <MenuItem value="done">✅ Completed</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={editedPriority}
                    label="Priority"
                    onChange={(e) => setEditedPriority(e.target.value as PriorityType)}
                    sx={{ bgcolor: 'white', borderRadius: 2 }}
                  >
                    <MenuItem value="low">🟢 Low</MenuItem>
                    <MenuItem value="medium">🟡 Medium</MenuItem>
                    <MenuItem value="high">🔴 High</MenuItem>
                  </Select>
                </FormControl>

                <Button
                  variant="contained"
                  onClick={handleSaveChanges}
                  disabled={saving || (editedStatus === task.status && editedPriority === task.priority)}
                  startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5568d3 0%, #63408b 100%)',
                    },
                    '&:disabled': {
                      bgcolor: '#e5e7eb',
                      color: '#9ca3af',
                    },
                  }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>

              {/* Description */}
              {task.description && (
                <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: '#f9fafb', borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#374151' }}>
                    📝 Description
                  </Typography>
                  <Typography sx={{ color: '#4b5563', lineHeight: 1.7 }}>
                    {task.description}
                  </Typography>
                </Paper>
              )}

              {/* Task Information Grid */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#fef3c7', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <PersonIcon sx={{ fontSize: 20, color: '#92400e' }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Assigned to
                    </Typography>
                  </Box>
                  <Typography sx={{ fontWeight: 600, color: '#78350f' }}>
                    {task.assignee?.name ?? task.assignee?.email ?? "-"}
                  </Typography>
                </Paper>

                <Paper elevation={0} sx={{ p: 2, bgcolor: '#dbeafe', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CalendarTodayIcon sx={{ fontSize: 20, color: '#1e40af' }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#1e40af', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Due Date
                    </Typography>
                  </Box>
                  <Typography sx={{ fontWeight: 600, color: '#1e3a8a' }}>
                    {task.due_date ? new Date(task.due_date).toLocaleDateString("en-US", {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    }) : "-"}
                  </Typography>
                </Paper>

                <Paper elevation={0} sx={{ p: 2, bgcolor: '#e0e7ff', borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#4338ca', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1 }}>
                    Project ID
                  </Typography>
                  <Typography sx={{ fontWeight: 600, color: '#4338ca' }}>
                    #{task.project_id}
                  </Typography>
                </Paper>

                <Paper elevation={0} sx={{ p: 2, bgcolor: '#f3e8ff', borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#6b21a8', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1 }}>
                    Created
                  </Typography>
                  <Typography sx={{ fontWeight: 600, color: '#6b21a8', fontSize: '0.875rem' }}>
                    {task.created_at ? new Date(task.created_at).toLocaleDateString("en-US") : "-"}
                  </Typography>
                </Paper>
              </Box>
            </Box>

            {/* RIGHT COLUMN: Comments */}
            <Box sx={{ display: 'flex', flexDirection: 'column', bgcolor: '#f9fafb' }}>
              <Box sx={{ p: 3, borderBottom: '1px solid #e5e7eb' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <CommentIcon sx={{ color: '#667eea' }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#374151' }}>
                    Comments
                  </Typography>
                  <Chip label={comments.length} size="small" sx={{ bgcolor: '#667eea', color: 'white', fontWeight: 700 }} />
                </Box>
                
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="💭 Write a comment..."
                  variant="outlined"
                  sx={{
                    mb: 1,
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'white',
                      borderRadius: 2,
                    }
                  }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleCreateComment}
                  disabled={creating || !newComment.trim()}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5568d3 0%, #63408b 100%)',
                    },
                  }}
                >
                  {creating ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                      Sending...
                    </>
                  ) : (
                    <>
                      <SendIcon sx={{ mr: 1, fontSize: 20 }} />
                      Comment
                    </>
                  )}
                </Button>
              </Box>

              <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
                {commentsLoading ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress size={32} />
                    <Typography sx={{ mt: 2, color: '#64748b', fontSize: '0.875rem' }}>
                      Loading comments...
                    </Typography>
                  </Box>
                ) : comments.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <CommentIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
                    <Typography sx={{ color: '#64748b', fontWeight: 600 }}>
                      No comments yet
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                      Be the first to comment!
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {comments.map((c) => (
                      <Paper key={c.id} elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: 'white', border: '1px solid #e5e7eb' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#667eea', fontSize: '0.875rem' }}>
                              {(c.author?.name ?? "U")[0].toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#374151' }}>
                                {c.author?.name ?? "User"}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                {c.created_at ? new Date(c.created_at).toLocaleString("en-US", {
                                  month: 'short',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }) : ""}
                              </Typography>
                            </Box>
                          </Box>
                          {currentUserId && c.author?.id === currentUserId && (
                            <IconButton size="small" onClick={() => handleDeleteComment(c.id)} sx={{ color: '#ef4444' }}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Typography sx={{ color: '#4b5563', fontSize: '0.875rem', lineHeight: 1.6 }}>
                          {c.body}
                        </Typography>
                      </Paper>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>
      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDeleteComment}
        onClose={() => {
          setConfirmDeleteComment(false);
          setPendingCommentId(null);
        }}
        onConfirm={confirmDeleteCommentAction}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </Dialog>
  );
}

function getCurrentUserId(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const u = JSON.parse(raw);
    return typeof u?.id === "number" ? u.id : null;
  } catch {
    return null;
  }
}

export default TaskDetailComponent;
