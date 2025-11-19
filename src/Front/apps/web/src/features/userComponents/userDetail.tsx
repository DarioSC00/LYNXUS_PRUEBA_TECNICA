"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Chip,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import FolderIcon from "@mui/icons-material/Folder";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PaginationUniversal from "../universalComponents/paginationUniversalComponents/paginationUniversal";
import * as userService from "./userService/userService";

type UserDetailType = userService.UserDetail;
type ProjectItem = { id: number; name: string; description?: string };

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function UserDetail({ 
  userId, 
  open, 
  onClose 
}: { 
  userId: number | null; 
  open: boolean; 
  onClose: () => void; 
}) {
  const [data, setData] = useState<UserDetailType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  
  // Pagination state
  const [projectsPage, setProjectsPage] = useState(1);
  const [tasksPage, setTasksPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    let mounted = true;
    if (!open || userId == null) {
      if (mounted) { 
        setData(null); 
        setError(null); 
        setLoading(false);
        setProjectsPage(1);
        setTasksPage(1);
      }
      return;
    }

    React.startTransition(() => setLoading(true));
    (async () => {
      try {
        const user = await userService.getUser(userId);
        if (!mounted) return;
        React.startTransition(() => {
          setData(user);
          setError(null);
        });
      } catch (e) {
        if (!mounted) return;
        console.error("Error loading user:", e);
        setError("Could not load user");
      } finally {
        if (mounted) React.startTransition(() => setLoading(false));
      }
    })();

    return () => { mounted = false; };
  }, [open, userId]);

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
      case "medium": 
      case "med": return { bgcolor: '#fef3c7', color: '#92400e' };
      default: return { bgcolor: '#f0fdf4', color: '#166534' };
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon />
          <span>User Information</span>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
            <CircularProgress />
            <Typography sx={{ mt: 2, color: '#64748b' }}>Loading information...</Typography>
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : !data ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography color="textSecondary">No data available</Typography>
          </Box>
        ) : (
          <Box>
            {/* User Basic Information */}
            <Box sx={{ p: 4, bgcolor: '#f9fafb' }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: '#374151' }}>
                User Details
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                <Paper elevation={0} sx={{ p: 2.5, bgcolor: 'white', borderRadius: 2, border: '1px solid #e5e7eb' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <PersonIcon sx={{ fontSize: 20, color: '#667eea' }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#667eea', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Full Name
                    </Typography>
                  </Box>
                  <Typography sx={{ fontWeight: 600, color: '#1f2937', fontSize: '1.05rem' }}>
                    {data.name ?? "No name"}
                  </Typography>
                </Paper>

                <Paper elevation={0} sx={{ p: 2.5, bgcolor: 'white', borderRadius: 2, border: '1px solid #e5e7eb' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <EmailIcon sx={{ fontSize: 20, color: '#667eea' }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#667eea', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Email Address
                    </Typography>
                  </Box>
                  <Typography sx={{ fontWeight: 600, color: '#1f2937', fontSize: '1.05rem' }}>
                    {data.email ?? "-"}
                  </Typography>
                </Paper>

                <Paper elevation={0} sx={{ p: 2.5, bgcolor: 'white', borderRadius: 2, border: '1px solid #e5e7eb' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <CalendarTodayIcon sx={{ fontSize: 20, color: '#667eea' }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#667eea', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Registration Date
                    </Typography>
                  </Box>
                  <Typography sx={{ fontWeight: 600, color: '#1f2937', fontSize: '0.95rem' }}>
                    {data.created_at 
                      ? new Date(data.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : "Not available"
                    }
                  </Typography>
                </Paper>

                <Paper elevation={0} sx={{ p: 2.5, bgcolor: 'white', borderRadius: 2, border: '1px solid #e5e7eb' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#667eea', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Status
                    </Typography>
                  </Box>
                  <Chip 
                    label={data.is_active ? "Active" : "Inactive"} 
                    sx={{ 
                      bgcolor: data.is_active ? '#d1fae5' : '#fee2e2',
                      color: data.is_active ? '#065f46' : '#991b1b',
                      fontWeight: 700,
                    }}
                  />
                </Paper>
              </Box>
            </Box>

            <Divider />

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'white' }}>
              <Tabs 
                value={activeTab} 
                onChange={(_, newValue) => setActiveTab(newValue)}
                sx={{
                  px: 3,
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 600,
                    minHeight: 64,
                  }
                }}
              >
                <Tab 
                  icon={<FolderIcon />} 
                  iconPosition="start" 
                  label={`Projects (${data.projects?.length || 0})`}
                />
                <Tab 
                  icon={<AssignmentIcon />} 
                  iconPosition="start" 
                  label={`Tasks (${data.tasks?.length || 0})`}
                />
              </Tabs>
            </Box>

            {/* Projects Tab */}
            <TabPanel value={activeTab} index={0}>
              <Box sx={{ px: 4 }}>
                {data.projects && data.projects.length > 0 ? (
                  <>
                    <List sx={{ bgcolor: 'white' }}>
                      {data.projects
                        .slice((projectsPage - 1) * pageSize, projectsPage * pageSize)
                        .map((project: ProjectItem) => (
                          <ListItem 
                            key={project.id}
                            sx={{
                              mb: 1,
                              border: '1px solid #e5e7eb',
                              borderRadius: 2,
                              '&:hover': {
                                bgcolor: '#f9fafb',
                              }
                            }}
                          >
                            <ListItemText
                              primary={
                                <Typography sx={{ fontWeight: 600, color: '#1f2937', fontSize: '1rem' }}>
                                  {project.name}
                                </Typography>
                              }
                              secondary={
                                project.description && (
                                  <Typography variant="body2" sx={{ color: '#6b7280', mt: 0.5 }}>
                                    {project.description}
                                  </Typography>
                                )
                              }
                            />
                          </ListItem>
                        ))
                      }
                    </List>
                    {data.projects.length > pageSize && (
                      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                        <PaginationUniversal
                          currentPage={projectsPage}
                          totalPages={Math.ceil(data.projects.length / pageSize)}
                          totalItems={data.projects.length}
                          pageSize={pageSize}
                          onPageChange={setProjectsPage}
                          disabled={false}
                        />
                      </Box>
                    )}
                  </>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <FolderIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
                    <Typography sx={{ color: '#64748b', fontWeight: 600 }}>
                      No projects assigned
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                      This user is not part of any project
                    </Typography>
                  </Box>
                )}
              </Box>
            </TabPanel>

            {/* Tasks Tab */}
            <TabPanel value={activeTab} index={1}>
              <Box sx={{ px: 4 }}>
                {data.tasks && data.tasks.length > 0 ? (
                  <>
                    <List sx={{ bgcolor: 'white' }}>
                      {data.tasks
                        .slice((tasksPage - 1) * pageSize, tasksPage * pageSize)
                        .map((task) => (
                          <ListItem 
                            key={task.id}
                            sx={{
                              mb: 1,
                              border: '1px solid #e5e7eb',
                              borderRadius: 2,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'flex-start',
                              '&:hover': {
                                bgcolor: '#f9fafb',
                              }
                            }}
                          >
                            <Typography sx={{ fontWeight: 600, color: '#1f2937', fontSize: '1rem', mb: 1 }}>
                              {task.title}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Chip 
                                label={task.status === 'todo' ? 'To Do' : task.status === 'doing' ? 'In Progress' : 'Completed'}
                                size="small"
                                sx={{ ...getStatusColor(task.status), fontWeight: 600 }}
                              />
                              <Chip 
                                label={task.priority === 'low' ? 'Low' : task.priority === 'medium' ? 'Medium' : 'High'}
                                size="small"
                                sx={{ ...getPriorityColor(task.priority), fontWeight: 600 }}
                              />
                            </Box>
                          </ListItem>
                        ))
                      }
                    </List>
                    {data.tasks.length > pageSize && (
                      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                        <PaginationUniversal
                          currentPage={tasksPage}
                          totalPages={Math.ceil(data.tasks.length / pageSize)}
                          totalItems={data.tasks.length}
                          pageSize={pageSize}
                          onPageChange={setTasksPage}
                          disabled={false}
                        />
                      </Box>
                    )}
                  </>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <AssignmentIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
                    <Typography sx={{ color: '#64748b', fontWeight: 600 }}>
                      No tasks assigned
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                      This user has no tasks assigned
                    </Typography>
                  </Box>
                )}
              </Box>
            </TabPanel>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}