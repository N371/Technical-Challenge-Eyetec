import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "../services/userService";
import type { User } from "../types";

const MOCK: User[] = [
  { id: 1, nome: "Ana Paula Ferreira", email: "ana@eyetec.com", cpf: "12345678901", telefone: "(11) 99876-5432", criadoEm: "2024-06-01T10:00:00Z" },
  { id: 2, nome: "Carlos Lima", email: "carlos@eyetec.com", cpf: "98765432100", criadoEm: "2024-06-05T14:30:00Z" },
];

export function ListagemPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService.listar()
      .then((r) => setUsers(r.content ?? []))
      .catch(() => setUsers(MOCK))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Excluir usuário?")) return;
    try { await userService.deletar(id); setUsers((u) => u.filter((x) => x.id !== id)); }
    catch { alert("Erro ao excluir."); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f1117", color: "#fff", fontFamily: "Inter, sans-serif" }}>
      <header style={{ borderBottom: "1px solid #2a2d3e", padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Eyetec</h1>
          <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>Gestão de Usuários - Desafio técnico Eyetec</p>
        </div>
        <button onClick={() => navigate("/cadastro")}
          style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "#3b5bdb", color: "#fff", cursor: "pointer", fontWeight: 600 }}>
          + Novo usuário
        </button>
      </header>

      <main style={{ padding: "24px 32px", maxWidth: 900, margin: "0 auto" }}>
        {loading ? (
          <p style={{ color: "#6b7280" }}>Carregando...</p>
        ) : users.length === 0 ? (
          <p style={{ color: "#6b7280", textAlign: "center", marginTop: 64 }}>Nenhum usuário cadastrado.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #2a2d3e" }}>
                {["Usuário", "CPF", "Telefone", "Cadastrado em", ""].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: "1px solid #1a1d27" }}>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {u.fotoUrl
                        ? <img src={u.fotoUrl} alt={u.nome} style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
                        : <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#3b5bdb33", color: "#3b5bdb", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>
                            {u.nome.split(" ").slice(0,2).map(n=>n[0]).join("").toUpperCase()}
                          </div>
                      }
                      <div>
                        <p style={{ margin: 0, fontWeight: 500 }}>{u.nome}</p>
                        <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", color: "#9ca3af", fontFamily: "monospace", fontSize: 13 }}>
                    {u.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}
                  </td>
                  <td style={{ padding: "14px 16px", color: "#9ca3af", fontSize: 13 }}>{u.telefone || "—"}</td>
                  <td style={{ padding: "14px 16px", color: "#6b7280", fontSize: 13 }}>
                    {new Date(u.criadoEm).toLocaleDateString("pt-BR")}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <button onClick={() => navigate(`/editar/${u.id}`)}
                        style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #2a2d3e", background: "transparent", color: "#d1d5db", cursor: "pointer", fontSize: 12 }}>
                        Editar
                      </button>
                      <button onClick={() => handleDelete(u.id)}
                        style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #7f1d1d55", background: "#ef444410", color: "#f87171", cursor: "pointer", fontSize: 12 }}>
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}
