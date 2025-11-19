import api from "../../../../axios/axios";
import axios from "axios";

export type UserItem = { id: number; name?: string; email?: string };
export type CommentItem = { id: number; body: string; author?: UserItem; created_at?: string };
export type TaskItem = {
  id: number;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  due_date?: string | null;
  assignee?: UserItem | null;
  comments?: CommentItem[];
  created_at?: string;
};
export type ProjectDetail = {
  id: number;
  name: string;
  description?: string;
  archived?: boolean;
  owner?: UserItem | null;
  owner_id?: number;
  members?: UserItem[];  // Miembros del proyecto
  tasks?: TaskItem[];
};
export type ProjectItem = { 
  id: number; 
  name: string; 
  description?: string; 
  status?: string;
  created_at?: string;
};
export type CreateProjectInput = {
  name: string;
  description?: string;
  owner?: string | number;
  status?: string;
};

// paginación estándar
export type Paged<T> = {
  items: T[];
  total: number;
  page: number;
  page_size: number;
};

export const STATUS_OPTIONS: string[] = ["active", "archived", "planned"];

export async function getProject(id: number): Promise<ProjectDetail> {
  try {
    const res = await api.get(`/projects/${id}`);
    console.log("[projectService] getProject response:", res.status, res.data);
    return res.data as ProjectDetail;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      console.error("[projectService] getProject error:", status, err.response?.data);
      if (status === 401 && typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        window.location.href = "/login";
      }
      throw err.response?.data ?? err;
    }
    console.error("[projectService] getProject unknown error:", err);
    throw err;
  }
}

// listProjects - el backend ahora devuelve {items, total, page, page_size}
export async function listProjects(params: { q?: string; page?: number; page_size?: number } = {}): Promise<{ items: ProjectItem[]; total: number }> {
  try {
    const { q = "", page = 1, page_size = 50 } = params;
    const skip = (page - 1) * page_size;
    const res = await api.get("/projects/", { params: { search: q, skip, limit: page_size } });
    console.log("[projectService] listProjects response:", res.status, res.data);
    
    // El backend ahora devuelve {items, total, page, page_size}
    if (res.data && typeof res.data === 'object' && 'items' in res.data) {
      return { 
        items: res.data.items || [], 
        total: res.data.total || 0 
      };
    }
    
    // Fallback si el formato es diferente
    const items = Array.isArray(res.data) ? res.data : [];
    return { items, total: items.length };
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error("[projectService] listProjects error:", err.response?.status, err.response?.data);
      if (err.response?.status === 401 && typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        window.location.href = "/login";
      }
      return { items: [], total: 0 };
    }
    console.error("[projectService] listProjects unknown error:", err);
    return { items: [], total: 0 };
  }
}

export async function createProject(payload: CreateProjectInput) {
  // usa la instancia api ya importada en este archivo
  const res = await api.post("/projects/", payload);
  return res.data;
}

// Comentarios de proyecto
export async function getProjectComments(projectId: number): Promise<CommentItem[]> {
  try {
    const res = await api.get(`/projects/${projectId}/comments`);
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error("[projectService] getProjectComments error:", err);
    return [];
  }
}

export async function createProjectComment(projectId: number, data: { body: string }) {
  const res = await api.post(`/projects/${projectId}/comments`, data);
  return res.data;
}

export async function deleteProjectComment(commentId: number) {
  await api.delete(`/projects/comments/${commentId}`);
}

// Miembros de proyecto
export async function getProjectMembers(projectId: number): Promise<UserItem[]> {
  try {
    const res = await api.get(`/projects/${projectId}/members`);
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error("[projectService] getProjectMembers error:", err);
    return [];
  }
}

export async function addProjectMember(projectId: number, userId: number) {
  const res = await api.post(`/projects/${projectId}/members`, { user_id: userId });
  return res.data;
}

export async function removeProjectMember(projectId: number, userId: number) {
  await api.delete(`/projects/${projectId}/members/${userId}`);
}