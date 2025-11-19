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
  CircularProgress,
  IconButton,
  Avatar,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import ConfirmDialog from "../universalComponents/confirmUniversalComponent/ConfirmDialog";
import * as projectService from "./projectService/projectService";
import * as userService from "../userComponents/userService/userService";
import { toast } from "react-toastify";

type UserItem = { id: number; name?: string; email?: string };
type CommentItem = { id: number; body: string; author?: UserItem; created_at?: string };
type ProjectDetail = {
  id: number;
  name: string;
  description?: string;
  archived?: boolean;
  owner?: UserItem | null;
  owner_id?: number;
  members?: UserItem[];
  comments?: CommentItem[];
};

export default function ProjectDetail({
  projectId,
  open,
  onClose,
  onUpdate,
}: {
  projectId: number | null;
  open: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}) {
  const [data, setData] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  
  // Comment states
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [creatingComment, setCreatingComment] = useState(false);

  // Member management states
  const [showAddMember, setShowAddMember] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<UserItem[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [addingMember, setAddingMember] = useState(false);

  // Confirm dialog states
  const [confirmDeleteComment, setConfirmDeleteComment] = useState(false);
  const [confirmDeleteMember, setConfirmDeleteMember] = useState(false);
  const [pendingCommentId, setPendingCommentId] = useState<number | null>(null);
  const [pendingMemberId, setPendingMemberId] = useState<number | null>(null);

  const currentUserId = getCurrentUserId();
  const isOwner = data && currentUserId && data.owner_id === currentUserId;

  useEffect(() => {
    let mounted = true;
    const timeout = setTimeout(() => {
      if (mounted) {
        console.warn("[detailProject] request timeout");
        const errorMsg = "⏱️ Request timeout. Please check your connection.";
        setError(errorMsg);
        toast.error(errorMsg);
        setLoading(false);
      }
    }, 10000);
    if (!open || projectId == null) {
      clearTimeout(timeout);
      setData(null);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await projectService.getProject(projectId);
        console.log("[detailProject] raw project:", res);
        if (!mounted) return;
        setData(res as ProjectDetail);
      } catch (err) {
        console.error("[detailProject] error fetching project:", err);
        if (!mounted) return;
        const errorMsg = "⚠️ Could not load project details. Please try again.";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        if (mounted) setLoading(false);
        clearTimeout(timeout);
      }
    })();

    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, [open, projectId, reloadKey]);

  // Cargar comentarios del proyecto
  useEffect(() => {
    if (!open || !projectId) {
      setComments([]);
      return;
    }
    loadComments();
  }, [open, projectId, reloadKey]);

  const loadComments = async () => {
    if (!projectId) return;
    setCommentsLoading(true);
    try {
      const res = await projectService.getProjectComments(projectId);
      setComments(Array.isArray(res) ? res : []);
    } catch (err: any) {
      console.error("[detailProject] error loading comments:", err);
      // Si es 404, 403, o 401, simplemente mostrar vacío sin error
      // 401 significa token expirado - usuario puede seguir usando la app, solo sin comentarios
      if (err?.response?.status === 404 || err?.response?.status === 403 || err?.response?.status === 401) {
        setComments([]);
      } else {
        // Solo mostrar error para otros casos (500, network, etc.)
        toast.error("⚠️ Could not load comments. Please refresh.");
        setComments([]);
      }
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleCreateComment = async () => {
    if (!newComment.trim() || !projectId) return;
    setCreatingComment(true);
    try {
      await projectService.createProjectComment(projectId, { body: newComment });
      toast.success("✅ Comment added successfully!");
      setNewComment("");
      await loadComments();
      onUpdate?.();
    } catch (err) {
      console.error("[detailProject] error creating comment:", err);
      toast.error("❌ Could not create comment. Please try again.");
    } finally {
      setCreatingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    setPendingCommentId(commentId);
    setConfirmDeleteComment(true);
  };

  const confirmDeleteCommentAction = async () => {
    if (!pendingCommentId) return;
    try {
      await projectService.deleteProjectComment(pendingCommentId);
      toast.success("🗑️ Comment deleted successfully");
      setComments((c) => c.filter((x) => x.id !== pendingCommentId));
      onUpdate?.();
    } catch (err) {
      console.error("[detailProject] error deleting comment:", err);
      toast.error("❌ Could not delete comment. Please try again.");
    } finally {
      setPendingCommentId(null);
    }
  };

  // Member management functions
  const loadAvailableUsers = async () => {
    if (!projectId) return;
    setLoadingUsers(true);
    try {
      const result = await userService.listUsers({});
      // Filter out users who are already members
      const memberIds = new Set(data?.members?.map(m => m.id) || []);
      const available = result.items.filter((u: UserItem) => !memberIds.has(u.id));
      setAvailableUsers(available);
    } catch (err) {
      console.error("[detailProject] error loading users:", err);
      toast.error("⚠️ Could not load available users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleShowAddMember = () => {
    setShowAddMember(true);
    loadAvailableUsers();
  };

  const handleAddMember = async () => {
    if (!selectedUserId || !projectId) return;
    setAddingMember(true);
    try {
      await projectService.addProjectMember(projectId, selectedUserId);
      toast.success("✅ Team member added successfully!");
      setShowAddMember(false);
      setSelectedUserId(null);
      setReloadKey(k => k + 1); // Recargar datos del proyecto
      onUpdate?.();
    } catch (err: any) {
      console.error("[detailProject] error adding member:", err);
      toast.error(err?.response?.data?.detail || "❌ Could not add team member. Please try again.");
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!projectId) return;
    setPendingMemberId(userId);
    setConfirmDeleteMember(true);
  };

  const confirmRemoveMemberAction = async () => {
    if (!projectId || !pendingMemberId) return;
    try {
      await projectService.removeProjectMember(projectId, pendingMemberId);
      toast.success("🗑️ Team member removed successfully");
      setReloadKey(k => k + 1); // Recargar datos del proyecto
      onUpdate?.();
    } catch (err: any) {
      console.error("[detailProject] error removing member:", err);
      toast.error(err?.response?.data?.detail || "❌ Could not remove team member. Please try again.");
    } finally {
      setPendingMemberId(null);
    }
  };

  return (<>
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
        <span>{data?.name ?? "Project Detail"}</span>
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
        ) : error ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : !data ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography color="textSecondary">No data</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', minHeight: '650px', maxHeight: '75vh' }}>
            {/* LEFT COLUMN: Project Details */}
            <Box sx={{ p: 4, pr: 3, borderRight: '1px solid #e5e7eb', overflowY: 'auto' }}>
              {/* Status Chip */}
              <Box sx={{ mb: 3 }}>
                <Chip 
                  label={data.archived ? "Archived" : "Active"}
                  sx={{ 
                    bgcolor: data.archived ? '#f3f4f6' : '#d1fae5',
                    color: data.archived ? '#374151' : '#065f46',
                    fontWeight: 600 
                  }}
                />
              </Box>

              {/* Description */}
              <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: '#f9fafb', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#374151' }}>
                  📋 Description
                </Typography>
                <Typography sx={{ color: '#4b5563', lineHeight: 1.7 }}>
                  {data.description || "No description"}
                </Typography>
              </Paper>

              {/* Project Information Grid */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#fef3c7', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <PersonIcon sx={{ fontSize: 20, color: '#92400e' }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Owner
                    </Typography>
                  </Box>
                  <Typography sx={{ fontWeight: 600, color: '#78350f' }}>
                    {data.owner?.name ?? data.owner?.email ?? (data.owner_id ? `User #${data.owner_id}` : "No owner")}
                  </Typography>
                </Paper>

                <Paper elevation={0} sx={{ p: 2, bgcolor: '#e0e7ff', borderRadius: 2, cursor: 'pointer' }} onClick={handleShowAddMember}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <GroupAddIcon sx={{ fontSize: 20, color: '#4338ca' }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#4338ca', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Team Members
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontWeight: 600, color: '#4338ca', fontSize: '1.5rem' }}>
                      {data.members?.length || 0}
                    </Typography>
                    <Button
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShowAddMember();
                      }}
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        fontWeight: 600,
                        textTransform: 'none',
                        '&:hover': {
                          transform: 'scale(1.05)',
                        }
                      }}
                    >
                      ➕ Add
                    </Button>
                  </Box>
                </Paper>
              </Box>

              {/* All Team Members Section */}
              <Paper elevation={0} sx={{ p: 3, bgcolor: '#fefce8', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#713f12', display: 'flex', alignItems: 'center', gap: 1 }}>
                  👥 All Team Members
                  <Chip label={data.members?.length || 0} size="small" sx={{ bgcolor: '#fef3c7', color: '#92400e', fontWeight: 700 }} />
                </Typography>
                
                {data.members && data.members.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {data.members.map((member) => (
                      <Paper key={member.id} elevation={0} sx={{ p: 2, bgcolor: 'white', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: '#667eea', fontWeight: 700 }}>
                            {(member.name ?? member.email ?? "U")[0].toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 600, color: '#111827' }}>
                              {member.name ?? member.email ?? `User #${member.id}`}
                            </Typography>
                            {member.name && member.email && (
                              <Typography variant="caption" sx={{ color: '#6b7280' }}>
                                {member.email}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        {isOwner && member.id !== data.owner_id && (
                          <IconButton 
                            onClick={() => handleRemoveMember(member.id)}
                            size="small"
                            sx={{ color: '#ef4444' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Paper>
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h3" sx={{ mb: 1 }}>👥</Typography>
                    <Typography sx={{ color: '#78716c', fontWeight: 600 }}>
                      No members in this project
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Box>

            {/* RIGHT COLUMN: Comments */}
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#f9fafb' }}>
              <Box sx={{ p: 3, borderBottom: '1px solid #e5e7eb' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#374151' }}>
                    💬 Comments
                  </Typography>
                  <Chip label={comments.length} size="small" sx={{ bgcolor: '#667eea', color: 'white', fontWeight: 700 }} />
                </Box>
                
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="💭 Write a comment about this project..."
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
                  disabled={creatingComment || !newComment.trim()}
                  endIcon={<SendIcon />}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    fontWeight: 600,
                    textTransform: 'none',
                    py: 1.5,
                    borderRadius: 2,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5568d3 0%, #6941a0 100%)',
                    },
                    '&.Mui-disabled': {
                      background: '#e5e7eb',
                      color: '#9ca3af',
                    }
                  }}
                >
                  {creatingComment ? "Sending..." : "Comment"}
                </Button>
              </Box>

              <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
                {commentsLoading ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                    <CircularProgress size={32} />
                    <Typography sx={{ mt: 2, color: '#64748b', fontSize: '0.875rem' }}>Loading comments...</Typography>
                  </Box>
                ) : comments.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Typography variant="h3" sx={{ mb: 1 }}>💬</Typography>
                    <Typography sx={{ color: '#64748b', fontWeight: 600, mb: 0.5 }}>
                      No comments yet
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                      Be the first to share your thoughts!
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {comments.map((c) => (
                      <Paper key={c.id} elevation={0} sx={{ p: 2, bgcolor: 'white', borderRadius: 2, border: '1px solid #e5e7eb' }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem', bgcolor: '#667eea', fontWeight: 700 }}>
                              {(c.author?.name ?? c.author?.email ?? "U")[0].toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#111827' }}>
                                {c.author?.name ?? c.author?.email ?? "User"}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#6b7280' }}>
                                {c.created_at ? new Date(c.created_at).toLocaleString("en-US", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit"
                                }) : ""}
                              </Typography>
                            </Box>
                          </Box>
                          {currentUserId && c.author?.id === currentUserId && (
                            <IconButton 
                              onClick={() => handleDeleteComment(c.id)}
                              size="small"
                              sx={{ color: '#ef4444' }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                        <Typography sx={{ color: '#4b5563', fontSize: '0.875rem', lineHeight: 1.6, pl: 6 }}>
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

      {/* Modal to add members */}
      {showAddMember && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
          }}
          onClick={() => setShowAddMember(false)}
        >
          <Paper
            sx={{
              minWidth: 500,
              maxWidth: 600,
              p: 4,
              borderRadius: 3,
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: '#374151' }}>
              ➕ Add Member to Project
            </Typography>
            
            {loadingUsers ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress />
                <Typography sx={{ mt: 2, color: '#64748b' }}>Loading users...</Typography>
              </Box>
            ) : availableUsers.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography sx={{ color: '#64748b' }}>
                  No users available to add
                </Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: '#374151' }}>
                    Select a user:
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    value={selectedUserId || ""}
                    onChange={(e) => setSelectedUserId(Number(e.target.value))}
                    SelectProps={{
                      native: true,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  >
                    <option value="">-- Select user --</option>
                    {availableUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name ?? user.email} ({user.email})
                      </option>
                    ))}
                  </TextField>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => setShowAddMember(false)}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: 2,
                      px: 3,
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleAddMember}
                    disabled={!selectedUserId || addingMember}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: 2,
                      px: 3,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5568d3 0%, #6941a0 100%)',
                      },
                      '&.Mui-disabled': {
                        background: '#e5e7eb',
                        color: '#9ca3af',
                      }
                    }}
                  >
                    {addingMember ? "Adding..." : "Add"}
                  </Button>
                </Box>
              </>
            )}
          </Paper>
        </Box>
      )}
    </Dialog>

    {/* Confirm Dialogs */}
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

    <ConfirmDialog
      open={confirmDeleteMember}
      onClose={() => {
        setConfirmDeleteMember(false);
        setPendingMemberId(null);
      }}
      onConfirm={confirmRemoveMemberAction}
      title="Remove Member"
      message="Are you sure you want to remove this member from the project?"
      confirmText="Remove"
      cancelText="Cancel"
      type="warning"
    />
  </>);
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