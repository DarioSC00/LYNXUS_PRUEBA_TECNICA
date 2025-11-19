import api from "../../../../axios/axios";

export type User = {
  id: number;
  email: string;
  name?: string;
  created_at?: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
  user: User;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export async function loginWithEmail(payload: LoginPayload): Promise<LoginResponse> {
  // Enviar como JSON (no form data)
  const response = await api.post<LoginResponse>("/users/login", payload);
  return response.data;
}