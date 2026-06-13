export interface User {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  telefone?: string;
  fotoUrl?: string;
  criadoEm: string;
}

export interface UserFormData {
  nome: string;
  email: string;
  cpf: string;
  telefone?: string;
  foto?: File | Blob | null;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}
