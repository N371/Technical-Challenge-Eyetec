import axios from "axios";
import type { User, UserFormData, PagedResponse } from "../types";

// Instância centralizada apontando para a rota relativa gerenciada pelo Caddy/Proxy
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
    console.log("Enviando dados para criação (FormData):", formData);
    
    // Corrigido: Agora utiliza a rota relativa mapeada na instância 'api'.
    // O cabeçalho 'multipart/form-data' garante que o Blob da foto seja enviado como binário.
    const { data } = await api.post("/users", buildFormData(formData), {
      headers: { "Content-Type": "multipart/form-data" },
    });
    
    console.log("Usuário criado com sucesso:", data);
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

/**
 * Auxiliar para converter o objeto de formulário em FormData binário (Multipart)
 */
function buildFormData(f: UserFormData): FormData {
  const fd = new FormData();
  fd.append("nome", f.nome);
  fd.append("email", f.email);
  fd.append("cpf", f.cpf);
  
  if (f.telefone) {
    fd.append("telefone", f.telefone);
  }
  
  if (f.foto) {
    // Mantido o envio do Blob/File com o nome de arquivo padrão para o Spring Boot aceitar
    fd.append("foto", f.foto, "foto.jpg");
  }
  
  return fd;
}