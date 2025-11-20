"use client";

import React, { useEffect, useState } from "react";
import * as projectService from "./projectService/projectService";
import TaskDetail from "../taskComponents/taskDetail";
import ProjectDetail from "./detailProject";
import TaskCreate from "../taskComponents/taskCreateComponent";
import ProjectCreateComponent from "./projectCreateComponent";
import AddMembersModal from "./addMembersModal";
import PaginationUniversal from "../universalComponents/paginationUniversalComponents/paginationUniversal";
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
  IconButton,
  CircularProgress,
  InputAdornment,
  Breadcrumbs,
  Link,
  Collapse,
  List,
  ListItem,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import AddTaskIcon from "@mui/icons-material/AddTask";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import FolderIcon from "@mui/icons-material/Folder";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Concrete types to avoid `any`
type Task = {
  id: number;
  title: string;
  description?: string;
  status: "todo" | "doing" | "done" | string;
  priority: "low" | "medium" | "high" | string;
  due_date?: string | null;
  assignee_id?: number | null;
  created_at?: string;
};

// Sortable component for each task
function SortableTaskItem({
  task,
  onClick,
  getStatusColor,
  getPriorityColor,
}: {
  task: Task;
  onClick: () => void;
  getStatusColor: (status: string) => "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning";
  getPriorityColor: (priority: string) => "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning";
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? "grabbing" : "grab",
  };

  return (
    <ListItem
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      sx={{
        bgcolor: "white",
        mb: 1,
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
        cursor: "grab !important",
        "&:active": {
          cursor: "grabbing !important",
        },
        "&:hover": {
          bgcolor: "action.hover",
        },
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 16px",
      }}
      onClick={(e) => e.stopPropagation()}
    >

      {/* Drag Indicator Icon */}
      <Box sx={{ display: "flex", alignItems: "center", mr: 2, pointerEvents: "none" }}>
        <DragIndicatorIcon sx={{ color: "text.secondary", fontSize: 20 }} />
      </Box>

      {/* Task Info - Clickable title only; other parts ignore pointer events so clicks fall through to ListItem (drag) */}
      <Box sx={{ flex: 1, pointerEvents: "none" }}>
        <Typography 
          variant="body1" 
          sx={{ 
            fontWeight: 500,
            cursor: "pointer",
            pointerEvents: "auto",
            "&:hover": {
              color: "primary.main",
              textDecoration: "underline",
            },
          }}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          {task.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ pointerEvents: "none" }}>
          Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : "-"}
        </Typography>
      </Box>

      {/* Status & Priority Chips */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, pointerEvents: "none" }}>
        <Chip
          label={
            task.status === "todo"
              ? "To Do"
              : task.status === "doing"
              ? "In Progress"
              : "Completed"
          }
          color={getStatusColor(task.status)}
          size="small"
        />
        <Chip
          label={
            task.priority === "low"
              ? "Low"
              : task.priority === "medium"
              ? "Medium"
              : "High"
          }
          color={getPriorityColor(task.priority)}
          size="small"
        />
      </Box>
    </ListItem>
  );
}

type ProjectItem = {
  id: number;
  name: string;
  description?: string;
  archived?: boolean;
  created_at?: string;
  owner?: { id: number; name?: string; email?: string } | null;
  owner_id?: number;
  tasks?: Task[]; // now typed
};

export default function ProjectList() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [tasksByProject, setTasksByProject] = useState<Record<number, Task[]>>({});
  const [tasksLoading, setTasksLoading] = useState<Record<number, boolean>>({});
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskModalProjectId, setTaskModalProjectId] = useState<number | null>(null);

  // Search and pagination state
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 5;

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handler for drag end of tasks
  const handleTaskDragEnd = (projectId: number) => (event: DragEndEvent) => {
    const { active, over } = event;

    console.log("🎯 Drag end:", { active: active.id, over: over?.id, projectId });

    if (over && active.id !== over.id) {
      setTasksByProject((prev) => {
        const tasks = prev[projectId] || [];
        console.log("📋 Current tasks:", tasks);
        const oldIndex = tasks.findIndex((t) => t.id === active.id);
        const newIndex = tasks.findIndex((t) => t.id === over.id);
        console.log("🔄 Moving from", oldIndex, "to", newIndex);
        const reordered = arrayMove(tasks, oldIndex, newIndex);
        console.log("✅ Reordered tasks:", reordered);
        return { ...prev, [projectId]: reordered };
      });
      toast.success("✅ Task reordered");
    }
  };

  // states for project modals / create task
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [projectDetailOpen, setProjectDetailOpen] = useState(false);
  const [taskCreateOpenFor, setTaskCreateOpenFor] = useState<number | null>(null);
  const [addMembersOpenFor, setAddMembersOpenFor] = useState<number | null>(null);
  const reloadTasksFor = async (projectId?: number) => {
    if (!projectId) return;
    try {
      setTasksLoading((s: Record<number, boolean>) => ({ ...s, [projectId]: true }));
      const res = await projectService.getProject(projectId);
      const tasks: Task[] = (res?.tasks ?? []) as Task[];
      setTasksByProject((s: Record<number, Task[]>) => ({ ...s, [projectId]: tasks }));
    } catch (err) {
      console.error("Error reloading project tasks:", err);
    } finally {
      setTasksLoading((s: Record<number, boolean>) => ({ ...s, [projectId]: false }));
    }
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const res = await projectService.listProjects({
          q: searchQuery,
          page: currentPage,
          page_size: pageSize
        });

        const projectItems = res.items || [];
        setProjects(projectItems);
        setTotalItems(res.total || 0);

        // Load tasks for all visible projects to calculate status correctly
        const tasksLoadPromises = projectItems.map(async (project) => {
          try {
            const projectDetail = await projectService.getProject(project.id);
            return {
              projectId: project.id,
              tasks: (projectDetail?.tasks ?? []) as Task[]
            };
          } catch (err) {
            console.error(`Error loading tasks for project ${project.id}:`, err);
            return {
              projectId: project.id,
              tasks: []
            };
          }
        });

        const tasksResults = await Promise.all(tasksLoadPromises);
        
        // Update tasksByProject state with loaded tasks
        setTasksByProject((prev) => {
          const updated = { ...prev };
          tasksResults.forEach(({ projectId, tasks }) => {
            updated[projectId] = tasks;
          });
          return updated;
        });
      } catch (err) {
        console.error("Error loading projects:", err);
        setProjects([]);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    })();
  }, [searchQuery, currentPage]);

  // Reset page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const toggleExpand = async (projectId: number) => {
    const isOpen = !!expanded[projectId];
    setExpanded((s: Record<number, boolean>) => ({ ...s, [projectId]: !isOpen }));

    if (!isOpen && !tasksByProject[projectId]) {
      try {
        setTasksLoading((s: Record<number, boolean>) => ({ ...s, [projectId]: true }));
        const res = await projectService.getProject(projectId);
        const tasks: Task[] = (res?.tasks ?? []) as Task[];
        setTasksByProject((s: Record<number, Task[]>) => ({ ...s, [projectId]: tasks }));
      } catch (err) {
        console.error("Error loading project tasks:", err);
        setTasksByProject((s: Record<number, Task[]>) => ({ ...s, [projectId]: [] }));
      } finally {
        setTasksLoading((s: Record<number, boolean>) => ({ ...s, [projectId]: false }));
      }
    }
  };

  const openTask = (taskId: number, projectId?: number) => {
    setSelectedTaskId(taskId);
    setTaskModalOpen(true);
    if (projectId) setTaskModalProjectId(projectId);
  };

  type TaskCreateProps = {
    projectId: number;
    defaultOpen?: boolean;
    open?: boolean;
    onCreated?: () => void;
    onClose?: () => void;
  };
  // cast the component to avoid IntrinsicAttributes error
  const TaskCreateModal = TaskCreate as unknown as React.ComponentType<TaskCreateProps>;

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

  // Get project completion chip
  const getProjectStatusChip = (project: ProjectItem) => {
    const tasks = tasksByProject[project.id] || [];
    const isCompleted = tasks.length > 0 && tasks.every((task) => task.status === "done");
    const inProgress = tasks.some((task) => task.status === "doing");
    
    if (project.archived) {
      return <Chip label="Archived" color="default" size="small" />;
    }
    if (isCompleted) {
      return <Chip label="✅ Completed" color="success" size="small" sx={{ fontWeight: 600 }} />;
    }
    if (inProgress) {
      return <Chip label="⌛ In Progress" color="info" size="small" sx={{ fontWeight: 600 }} />;
    }
    return <Chip label="📋 Active" color="primary" size="small" sx={{ fontWeight: 600 }} />;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link underline="hover" color="inherit" href="#">
          Home
        </Link>
        <Typography color="text.primary">Projects</Typography>
      </Breadcrumbs>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Projects
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {loading ? "Loading..." : `${totalItems} project${totalItems !== 1 ? "s" : ""}`}
          </Typography>
        </Box>
        <ProjectCreateComponent
          onCreated={() => {
            // Wait for toast to be visible before reloading
            setTimeout(() => {
              setSearchQuery("");
              setCurrentPage(1);
              window.location.reload();
            }, 1500);
          }}
        />
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
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
      ) : projects.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: "center" }}>
          <FolderIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            No projects
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create your first project to get started
          </Typography>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.50" }}>
                  <TableCell sx={{ width: 50 }} />
                  <TableCell sx={{ fontWeight: 600 }}>Project</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: 120 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: 180 }}>Created</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: 120, textAlign: "center" }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projects.map((project: ProjectItem) => {
                  const isExpanded = !!expanded[project.id];
                  const projectTasks = tasksByProject[project.id] || [];
                  const isLoadingTasks = tasksLoading[project.id];

                  return (
                    <React.Fragment key={project.id}>
                      <TableRow hover>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => toggleExpand(project.id)}
                            aria-label={isExpanded ? "Collapse" : "Expand"}
                          >
                            {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          <Box
                            onClick={() => {
                              setSelectedProjectId(project.id);
                              setProjectDetailOpen(true);
                            }}
                            sx={{
                              cursor: "pointer",
                              "&:hover": {
                                color: "primary.main",
                              },
                            }}
                          >
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {project.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {project.description}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {getProjectStatusChip(project)}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {project.created_at
                              ? new Date(project.created_at).toLocaleString()
                              : "-"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                            <Tooltip title="Add task">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTaskCreateOpenFor(project.id);
                                }}
                                sx={{
                                  color: "primary.main",
                                  "&:hover": {
                                    bgcolor: "primary.light",
                                    color: "primary.dark",
                                  },
                                }}
                              >
                                <AddTaskIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Add members">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAddMembersOpenFor(project.id);
                                }}
                                sx={{
                                  color: "secondary.main",
                                  "&:hover": {
                                    bgcolor: "secondary.light",
                                    color: "secondary.dark",
                                  },
                                }}
                              >
                                <GroupAddIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            <Box sx={{ py: 2, px: 3, bgcolor: "grey.50" }}>
                              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                Tasks
                              </Typography>
                              {isLoadingTasks ? (
                                <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                                  <CircularProgress size={24} />
                                </Box>
                              ) : projectTasks.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">
                                  No tasks in this project
                                </Typography>
                              ) : (
                                <DndContext
                                  sensors={sensors}
                                  collisionDetection={closestCenter}
                                  onDragEnd={handleTaskDragEnd(project.id)}
                                >
                                  <SortableContext
                                    items={projectTasks.map((t) => t.id)}
                                    strategy={verticalListSortingStrategy}
                                  >
                                    <List dense>
                                      {projectTasks.map((task: Task) => (
                                        <SortableTaskItem
                                          key={task.id}
                                          task={task}
                                          onClick={() => openTask(task.id, project.id)}
                                          getStatusColor={getStatusColor}
                                          getPriorityColor={getPriorityColor}
                                        />
                                      ))}
                                    </List>
                                  </SortableContext>
                                </DndContext>
                              )}
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {!loading && totalItems > 0 && (
            <Box sx={{ mt: 3 }}>
              <PaginationUniversal
                currentPage={currentPage}
                totalPages={Math.ceil(totalItems / pageSize)}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                disabled={loading}
              />
            </Box>
          )}
        </>
      )}

      {selectedProjectId !== null && (
        <ProjectDetail
          projectId={selectedProjectId}
          open={projectDetailOpen}
          onClose={() => {
            setProjectDetailOpen(false);
            setSelectedProjectId(null);
          }}
        />
      )}

      {taskCreateOpenFor !== null && (
        <TaskCreateModal
          projectId={taskCreateOpenFor}
          open={true}
          onCreated={() => {
            setExpanded((s: Record<number, boolean>) => ({ ...s, [taskCreateOpenFor]: true }));
            reloadTasksFor(taskCreateOpenFor);
            setTaskCreateOpenFor(null);
          }}
          onClose={() => setTaskCreateOpenFor(null)}
        />
      )}

      {addMembersOpenFor !== null && (
        <AddMembersModal
          projectId={addMembersOpenFor}
          open={true}
          onClose={() => setAddMembersOpenFor(null)}
          onMemberAdded={() => {}}
        />
      )}

      {selectedTaskId !== null && (
        <TaskDetail
          taskId={selectedTaskId}
          open={taskModalOpen}
          onClose={() => {
            setTaskModalOpen(false);
            setSelectedTaskId(null);
            setTaskModalProjectId(null);
          }}
          onUpdate={() => {
            // Refresh tasks for the project that opened the modal
            if (taskModalProjectId) {
              reloadTasksFor(taskModalProjectId);
            }
            // Close the modal and reset selection
            setTaskModalOpen(false);
            setSelectedTaskId(null);
            setTaskModalProjectId(null);
          }}
        />
      )}
    </Container>
  );
}