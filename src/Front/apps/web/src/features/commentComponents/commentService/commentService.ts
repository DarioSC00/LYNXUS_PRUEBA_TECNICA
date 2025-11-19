import api from "../../../../axios/axios";
import axios from "axios";

export type CommentInput = { body: string };

export async function listComments(taskId: number) {
  try {
    const res = await api.get(`/tasks/${taskId}/comments`);
    return res.data;
  } catch (err) {
    // Si es 404 o 403, devolver array vacío en lugar de lanzar error
    // 401 debe propagarse para que el componente lo maneje
    if (axios.isAxiosError(err) && (err.response?.status === 404 || err.response?.status === 403)) {
      return [];
    }
    throw err;
  }
}

export async function createComment(taskId: number, payload: CommentInput) {
  const res = await api.post(`/tasks/${taskId}/comments`, payload);
  return res.data;
}

export async function deleteComment(commentId: number) {
  const res = await api.delete(`/comments/${commentId}`);
  return res.data;
}
