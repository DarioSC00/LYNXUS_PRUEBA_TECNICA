"use client";

import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Box,
  Typography,
  Avatar,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Tabs,
  Tab,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import FolderIcon from "@mui/icons-material/Folder";
import AssignmentIcon from "@mui/icons-material/Assignment";
import * as userService from "./userService/userService";
import { useRouter } from "next/navigation";

type ProjectItem = { 
  id: number; 
  name: string; 
  description?: string;
  role?: string;
};

type TaskItem = {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string | null;
  project_id?: number;
};

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
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<userService.UserDetail | null>(null);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      // Get current user ID from localStorage
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        console.error("No user in localStorage");
        setLoading(false);
        return;
      }
      const user = JSON.parse(userStr);
      const userId = user.id;

      // Load user details with projects and tasks
      const userDetail = await userService.getUser(userId);
      console.log("User detail loaded:", userDetail);
      setUserData(userDetail);
      
      // Set projects and tasks from the response
      setProjects(userDetail.projects || []);
      setTasks(userDetail.tasks || []);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done":
        return "success";
      case "doing":
        return "info";
      default:
        return "default";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      default:
        return "success";
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!userData) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6">No se pudo cargar el perfil</Typography>
        </Paper>
      </Container>
    );
  }

  const nameParts = (userData.name || userData.email || "User").split(" ");
  const initials =
    nameParts.length > 1
      ? nameParts[0][0] + nameParts[1][0]
      : nameParts[0].substring(0, 2);

  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const pendingTasks = tasks.filter((t) => t.status !== "done").length;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Card */}
      <Paper sx={{ p: 4, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Avatar
            sx={{
              width: 100,
              height: 100,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              fontSize: "2rem",
              fontWeight: 600,
            }}
          >
            {initials.toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              {userData.name || "Usuario"}
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
              <Chip
                icon={<EmailIcon />}
                label={userData.email}
                variant="outlined"
                size="medium"
              />
              {userData.created_at && (
                <Chip
                  icon={<CalendarTodayIcon />}
                  label={`Registrado: ${new Date(userData.created_at).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}`}
                  variant="outlined"
                  size="medium"
                />
              )}
            </Box>
            <Chip label="Admin" color="primary" size="small" />
          </Box>
        </Box>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <FolderIcon sx={{ fontSize: 40, color: "primary.main" }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {projects.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Proyectos
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <AssignmentIcon sx={{ fontSize: 40, color: "info.main" }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {tasks.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tareas asignadas
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <AssignmentIcon sx={{ fontSize: 40, color: "success.main" }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {completedTasks}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completadas
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <AssignmentIcon sx={{ fontSize: 40, color: "warning.main" }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {pendingTasks}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pendientes
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs Section */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            px: 2,
          }}
        >
          <Tab label="Información" />
          <Tab label="Proyectos" />
          <Tab label="Tareas" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ px: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Información del perfil
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Nombre completo"
                  secondary={userData.name || "No especificado"}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Correo electrónico"
                  secondary={userData.email}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Fecha de registro"
                  secondary={
                    userData.created_at
                      ? new Date(userData.created_at).toLocaleString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "No disponible"
                  }
                />
              </ListItem>
            </List>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ px: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Mis Proyectos ({projects.length})
            </Typography>
            {projects.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No tienes proyectos asignados.
              </Typography>
            ) : (
              <List>
                {projects.map((project) => (
                  <React.Fragment key={project.id}>
                    <ListItem
                      onClick={() => router.push(`/project`)}
                      sx={{
                        cursor: "pointer",
                        "&:hover": { bgcolor: "action.hover" },
                        borderRadius: 1,
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <FolderIcon sx={{ fontSize: 20, color: "primary.main" }} />
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {project.name}
                            </Typography>
                            {project.role && (
                              <Chip
                                label={project.role === "owner" ? "Propietario" : "Miembro"}
                                size="small"
                                color={project.role === "owner" ? "primary" : "default"}
                              />
                            )}
                          </Box>
                        }
                        secondary={project.description || "Sin descripción"}
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ px: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Tareas Asignadas ({tasks.length})
            </Typography>
            {tasks.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No tienes tareas asignadas.
              </Typography>
            ) : (
              <List>
                {tasks.map((task) => (
                  <React.Fragment key={task.id}>
                    <ListItem
                      sx={{
                        borderRadius: 1,
                        "&:hover": { bgcolor: "action.hover" },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {task.title}
                            </Typography>
                            <Chip
                              label={
                                task.status === "done"
                                  ? "Completada"
                                  : task.status === "doing"
                                  ? "En progreso"
                                  : "Por hacer"
                              }
                              size="small"
                              color={getStatusColor(task.status) as "success" | "info" | "default"}
                            />
                            <Chip
                              label={
                                task.priority === "high"
                                  ? "Alta"
                                  : task.priority === "medium"
                                  ? "Media"
                                  : "Baja"
                              }
                              size="small"
                              color={getPriorityColor(task.priority) as "error" | "warning" | "success"}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            {task.description && (
                              <Typography variant="body2" color="text.secondary">
                                {task.description}
                              </Typography>
                            )}
                            {task.due_date && (
                              <Typography variant="caption" color="text.secondary">
                                Vence: {new Date(task.due_date).toLocaleDateString("es-ES")}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Box>
        </TabPanel>
      </Paper>
    </Container>
  );
}
