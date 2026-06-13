import axios from "axios";
import type { User, UserFormData, PagedResponse } from "../types";

const api = axios.create({ baseURL: "/api", timeout: 10000 });

export const userService = {
  listar: async (page = 0, size = 10): Promise<PagedResponse<User>> => {
    const { data } = await api.get("/users", { params: { page, size } });
    return data;
  },
  buscarPorId: async (id: number): Promise<User> => {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },
  criar: async (formData: UserFormData): Promise<User> => {
    const { data } = await api.post("/users", buildFormData(formData), {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
  atualizar: async (id: number, formData: UserFormData): Promise<User> => {
    const { data } = await api.put(`/users/${id}`, buildFormData(formData), {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
  deletar: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};

function buildFormData(f: UserFormData): FormData {
  const fd = new FormData();
  fd.append("nome", f.nome);
  fd.append("email", f.email);
  fd.append("cpf", f.cpf);
  if (f.telefone) fd.append("telefone", f.telefone);
  if (f.foto) fd.append("foto", f.foto, "foto.jpg");
  return fd;
}
