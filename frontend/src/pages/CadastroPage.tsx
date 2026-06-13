import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { userService } from "../services/userService";
import { FaceCapture } from "../features/face-capture/components/FaceCapture";
import type { UserFormData } from "../types";

export function CadastroPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdicao = !!id;

  const [form, setForm] = useState({ nome: "", email: "", cpf: "", telefone: "" });
  const [foto, setFoto] = useState<Blob | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isEdicao) return;
    userService.buscarPorId(Number(id))
      .then((u) => { setForm({ nome: u.nome, email: u.email, cpf: u.cpf, telefone: u.telefone ?? "" }); if (u.fotoUrl) setFotoPreview(u.fotoUrl); })
      .catch(() => { alert("Usuário não encontrado."); navigate("/"); });
  }, [id]);

  const handle = (f: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.nome || !form.email || !form.cpf) { alert("Preencha os campos obrigatórios."); return; }
    setLoading(true);
    const payload: UserFormData = { ...form, cpf: form.cpf.replace(/\D/g,""), foto };
    try {
      isEdicao ? await userService.atualizar(Number(id), payload) : await userService.criar(payload);
      navigate("/");
    } catch { alert("Erro ao salvar. API no ar?"); }
    finally { setLoading(false); }
  };

  const inputStyle = { width: "100%", background: "#0f1117", border: "1px solid #2a2d3e", borderRadius: 8, padding: "10px 12px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" as const };
  const labelStyle = { fontSize: 11, color: "#6b7280", textTransform: "uppercase" as const, letterSpacing: "0.05em", display: "block", marginBottom: 6 };

  if (showCamera) return (
    <div style={{ minHeight: "100vh", background: "#0f1117", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#1a1d27", border: "1px solid #2a2d3e", borderRadius: 12, padding: 24 }}>
        <h2 style={{ color: "#fff", marginTop: 0 }}>Captura facial</h2>
        <FaceCapture onCapture={(blob, url) => { setFoto(blob); setFotoPreview(url); setShowCamera(false); }} onCancel={() => setShowCamera(false)} />
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0f1117", color: "#fff", fontFamily: "Inter, sans-serif" }}>
      <header style={{ borderBottom: "1px solid #2a2d3e", padding: "20px 32px", display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: 14 }}>← Voltar</button>
        <span style={{ color: "#2a2d3e" }}>|</span>
        <h1 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{isEdicao ? "Editar usuário" : "Novo usuário"}</h1>
      </header>

      <main style={{ padding: "32px", maxWidth: 600, margin: "0 auto" }}>
        <div style={{ background: "#1a1d27", border: "1px solid #2a2d3e", borderRadius: 12, padding: 24 }}>

          {/* Foto */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
            {fotoPreview
              ? <img src={fotoPreview} style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", border: "2px solid #3b5bdb" }} />
              : <div style={{ width: 72, height: 72, borderRadius: "50%", border: "2px dashed #2a2d3e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>👤</div>
            }
            <div>
              <p style={{ margin: "0 0 4px", fontWeight: 500 }}>Foto do perfil</p>
              <p style={{ margin: "0 0 8px", fontSize: 12, color: "#6b7280" }}>{fotoPreview ? "Foto capturada" : "Nenhuma foto ainda"}</p>
              <button onClick={() => setShowCamera(true)}
                style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #2a2d3e", background: "transparent", color: "#d1d5db", cursor: "pointer", fontSize: 12 }}>
                {fotoPreview ? "Recapturar" : "Abrir câmera"}
              </button>
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #2a2d3e", margin: "0 0 24px" }} />

          {/* Campos */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={labelStyle}>Nome completo *</label>
              <input style={inputStyle} placeholder="Ana Paula Ferreira" value={form.nome} onChange={handle("nome")} />
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={labelStyle}>E-mail *</label>
              <input style={inputStyle} type="email" placeholder="ana@empresa.com" value={form.email} onChange={handle("email")} />
            </div>
            <div>
              <label style={labelStyle}>CPF *</label>
              <input style={inputStyle} placeholder="000.000.000-00" value={form.cpf} onChange={handle("cpf")} maxLength={14} />
            </div>
            <div>
              <label style={labelStyle}>Telefone</label>
              <input style={inputStyle} placeholder="(11) 99999-9999" value={form.telefone} onChange={handle("telefone")} />
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #2a2d3e", margin: "24px 0" }} />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <button onClick={() => navigate("/")}
              style={{ padding: "8px 20px", borderRadius: 8, border: "1px solid #2a2d3e", background: "transparent", color: "#9ca3af", cursor: "pointer" }}>
              Cancelar
            </button>
            <button onClick={handleSubmit} disabled={loading}
              style={{ padding: "8px 24px", borderRadius: 8, border: "none", background: "#3b5bdb", color: "#fff", cursor: "pointer", fontWeight: 600, opacity: loading ? 0.6 : 1 }}>
              {loading ? "Salvando..." : isEdicao ? "Salvar alterações" : "Cadastrar"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
