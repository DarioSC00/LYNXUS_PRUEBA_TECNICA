import api from "../../../../axios/axios";

export type StatusType = "todo" | "doing" | "done";
export type PriorityType = "low" | "medium" | "high";

export type UserItem = {
  id: number;
  name?: string;
  email?: string;
};

export type TaskItem = {
  id: number;
  title: string;
  description?: string;
  status: StatusType;
  priority: PriorityType;
  due_date?: string | null;
  assignee_id?: number | null;
  project_id: number;
  created_at?: string;
  updated_at?: string;
};

export type TaskDetail = TaskItem & {
  assignee?: UserItem | null;
  comments?: CommentItem[];
};

export type CommentItem = {
  id: number;
  body: string;
  author?: UserItem;
  created_at?: string;
};

export type CreateTaskInput = {
  title: string;
  description?: string;
  status?: StatusType;
  priority?: PriorityType;
  due_date?: string | null;
  assignee_id?: number | null;
};

export type UpdateTaskInput = Partial<CreateTaskInput>;

export type ListTasksParams = {
  project_id?: number;
  q?: string;
  status?: StatusType;
  priority?: PriorityType;
  overdue?: boolean;
  skip?: number;
  limit?: number;
};

// Options for selects (labels in English)
export const STATUS_OPTIONS: { value: StatusType; label: string; color: string }[] = [
  { value: "todo", label: "To do", color: "#fef3c7" },
  { value: "doing", label: "In progress", color: "#dbeafe" },
  { value: "done", label: "Completed", color: "#d1fae5" },
];

export const PRIORITY_OPTIONS: { value: PriorityType; label: string; color: string }[] = [
  { value: "low", label: "Low", color: "#e5e7eb" },
  { value: "medium", label: "Medium", color: "#fef3c7" },
  { value: "high", label: "High", color: "#fee2e2" },
];

/**
 * List tasks (with optional filters)
 */
export async function listTasks(params: ListTasksParams = {}): Promise<{ items: TaskItem[]; total: number }> {
  try {
    const { project_id, q, status, priority, overdue, skip = 0, limit = 50 } = params;
    
    // Si hay project_id, usar ruta de proyecto
    const url = project_id ? `/projects/${project_id}/tasks` : `/tasks/`;
    
    const response = await api.get(url, {
      params: {
        search: q || undefined,
        status: status || undefined,
        priority: priority || undefined,
        overdue: overdue || undefined,
        skip,
        limit,
      },
    });

    console.log("[taskService] listTasks response:", response.data);

    const payload = response.data;
    
    // El backend puede devolver array directo o formato paginado
    if (Array.isArray(payload)) {
      return { items: payload, total: payload.length };
    }
    
    return {
      items: payload.items || [],
      total: payload.total || 0,
    };
  } catch (error) {
    console.error("[taskService] listTasks error:", error);
    throw error;
  }
}

/**
 * Obtener detalle de una tarea
 */
export async function getTask(taskId: number) {
  const res = await api.get(`/tasks/${taskId}`);
  return res.data;
}

/**
 * Crear tarea en un proyecto
 */
export async function createTask(projectId: number, data: CreateTaskInput): Promise<TaskItem> {
  try {
    console.log("[taskService] createTask -> starting", { projectId, data });
    console.log("[taskService] createTask -> api.baseURL:", api.defaults.baseURL);
    const token = (typeof window !== 'undefined') ? localStorage.getItem('access_token') : null;
    const online = (typeof navigator !== 'undefined') ? navigator.onLine : 'unknown';
    console.log('[taskService] createTask -> env', { online, tokenPresent: !!token, tokenPreview: token ? `${token.slice(0,10)}...` : null });

    // Build explicit config so we can log it if needed
    const config = { headers: { 'Content-Type': 'application/json' } };
    console.log('[taskService] createTask -> about to post to', `${api.defaults.baseURL}/projects/${projectId}/tasks`, 'with config', config);

    const response = await api.post(`/projects/${projectId}/tasks`, data, config);

    console.log('[taskService] createTask -> success response', { status: response.status, data: response.data });
    return response.data;
  } catch (error) {
    try {
      if ((error as any).response) {
        console.error('[taskService] createTask error.response:', {
          status: (error as any).response.status,
          data: (error as any).response.data,
          headers: (error as any).response.headers,
        });
      } else if ((error as any).request) {
        console.error('[taskService] createTask no response received, request exists:', (error as any).request);
      } else {
        console.error('[taskService] createTask error message:', (error as any).message);
      }
      console.error('[taskService] createTask full error object:', error);
    } catch (logErr) {
      console.error('[taskService] createTask logging failed:', logErr);
    }
    throw error;
  }
}

/**
 * Actualizar tarea
 */
export async function updateTask(taskId: number, data: UpdateTaskInput): Promise<TaskItem> {
  try {
    const response = await api.put(`/tasks/${taskId}`, data);
    console.log("[taskService] updateTask response:", response.data);
    return response.data;
  } catch (error) {
    console.error("[taskService] updateTask error:", error);
    throw error;
  }
}

/**
 * Eliminar tarea
 */
export async function deleteTask(taskId: number): Promise<void> {
  try {
    await api.delete(`/tasks/${taskId}`);
    console.log("[taskService] deleteTask success");
  } catch (error) {
    console.error("[taskService] deleteTask error:", error);
    throw error;
  }
}
