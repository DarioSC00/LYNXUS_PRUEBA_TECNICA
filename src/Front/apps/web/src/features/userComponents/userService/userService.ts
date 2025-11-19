import api from "../../../../axios/axios";
import axios from "axios";

export type UserItem = {
  id: number;
  name: string;
  email: string;
  created_at?: string;
  is_active?: boolean;
};

export type UserDetail = UserItem & {
  projects?: Array<{ id: number; name: string; description?: string; role?: string }>;
  tasks?: Array<{
    id: number;
    title: string;
    description?: string;
    status: 'todo' | 'doing' | 'done';
    priority: 'low' | 'medium' | 'high';
    due_date?: string | null;
    project_id?: number;
  }>;
};

export type ListUsersParams = { q?: string; page?: number; page_size?: number };
export type ListUsersResponse = { items: UserItem[]; total?: number };

export async function listUsers(params: ListUsersParams = {}): Promise<ListUsersResponse> {
  try {
    const { q = "", page = 1, page_size = 50 } = params;
    // el backend espera page y page_size (no skip/limit)
    const res = await api.get("/users/", { params: { q, page, page_size } });
    console.log("[userService] listUsers response:", res.status, res.data);

    // el backend devuelve { items: [...], total, page, page_size }
    const payload = res.data as { items?: UserItem[]; total?: number };

    return {
      items: Array.isArray(payload.items) ? payload.items : [],
      total: typeof payload.total === "number" ? payload.total : (Array.isArray(payload.items) ? payload.items.length : 0),
    };
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      console.error("listUsers error:", status, err.response?.data);
      if (status === 401 && typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        window.location.href = "/login";
      }
      return { items: [], total: 0 };
    }
    throw err;
  }
}

export async function getUser(id: number): Promise<UserDetail> {
  try {
    const res = await api.get(`/users/${id}`);
    console.log("getUser response:", res.status, res.data);
    return res.data as UserDetail;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      console.error("getUser error:", status, err.response?.data);
      if (status === 401 && typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        window.location.href = "/login";
      }
      throw err.response?.data ?? err;
    }
    throw err;
  }
}